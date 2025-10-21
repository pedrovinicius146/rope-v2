// =============================
// SERVER.JS – Backend RO-PE (Separado)
// =============================
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const multer = require('multer');
const path = require('path');

// Inicializa app
const app = express();
app.set('trust proxy', 1); // necessário em Railway/Render

// =============================
// MIDDLEWARES
// =============================
app.use(express.json());
app.use(
  helmet({
    contentSecurityPolicy: false, // desativa CSP para facilitar o frontend
  })
);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Muitas requisições deste IP. Tente novamente mais tarde.',
});
app.use(limiter);

// =============================
// CORS
// =============================
const allowedOrigins = [
  'http://localhost:8080', // frontend local
  'http://127.0.0.1:8080',
  'https://rope-v2-frontend.vercel.app', // frontend hospedado
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) callback(null, true);
      else callback(new Error('Origem não permitida: ' + origin));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  })
);

// =============================
// CONEXÃO COM MONGODB
// =============================
const mongoUri = process.env.MONGO_URI;
if (!mongoUri) {
  console.error('❌ MONGO_URI não definido!');
  process.exit(1);
}

mongoose
  .connect(mongoUri)
  .then(() => console.log('✅ Conectado ao MongoDB!'))
  .catch((err) => {
    console.error('❌ Erro ao conectar:', err.message);
    process.exit(1);
  });

// =============================
// UPLOAD DE FOTOS
// =============================
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads')),
  filename: (req, file, cb) => cb(null, Date.now() + '_' + file.originalname),
});
const upload = multer({ storage });

// =============================
// MODELO DE OCORRÊNCIA
// =============================
const occurrenceSchema = new mongoose.Schema({
  type: { type: String, required: true },
  description: { type: String, required: true },
  location: {
    type: { type: String, default: 'Point' },
    coordinates: { type: [Number], required: true }, // [lng, lat]
  },
  photoUrl: String,
  createdAt: { type: Date, default: Date.now },
});

occurrenceSchema.index({ location: '2dsphere' });
const Occurrence = mongoose.model('Occurrence', occurrenceSchema);

// =============================
// ROTAS
// =============================

// Teste rápido
app.get('/', (req, res) => res.json({ message: 'API ROPE rodando!' }));

// Criar ocorrência
app.post('/api/occurrences', upload.single('photo'), async (req, res) => {
  try {
    const { type, description, lat, lng } = req.body;
    if (!type || !description || !lat || !lng) {
      return res.status(400).json({ message: 'Campos obrigatórios faltando' });
    }

    const newOccurrence = new Occurrence({
      type,
      description,
      location: { coordinates: [parseFloat(lng), parseFloat(lat)] },
      photoUrl: req.file ? `/uploads/${req.file.filename}` : null,
    });

    await newOccurrence.save();
    res.status(201).json({ message: 'Ocorrência criada com sucesso!', occurrence: newOccurrence });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao criar ocorrência' });
  }
});

// Listar ocorrências
app.get('/api/occurrences', async (req, res) => {
  try {
    const occurrences = await Occurrence.find().sort({ createdAt: -1 });
    res.json(occurrences);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao buscar ocorrências' });
  }
});

// Servir uploads de imagens
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// =============================
// INICIA SERVIDOR
// =============================
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));
