require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

const app = express();
app.set('trust proxy', 1);

// =============================
// MIDDLEWARES
// =============================
app.use(express.json());
app.use(helmet({ contentSecurityPolicy: false }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Muitas requisições deste IP. Tente novamente mais tarde.'
});
app.use(limiter);

const allowedOrigins = [
  'http://localhost:8080',
  'https://rope-v2-production.up.railway.app'
];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) callback(null, true);
    else callback(new Error('Origem não permitida: ' + origin));
  },
  methods: ['GET','POST','PUT','DELETE'],
  credentials: true
}));

// =============================
// Conexão MongoDB
// =============================
if (!process.env.MONGO_URI) {
  console.error('❌ ERRO: MONGO_URI não está definido!');
  process.exit(1);
}

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Conectado ao MongoDB!'))
  .catch(err => {
    console.error('❌ Erro ao conectar ao MongoDB:', err.message);
    process.exit(1);
  });

// =============================
// Rotas
// =============================
const authRoutes = require('./routes/auth');
const occurrenceRoutes = require('./routes/occurrences');

app.use('/api/auth', authRoutes);
app.use('/api/occurrences', occurrenceRoutes);

// Servir fotos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Servir frontend
const frontendPath = path.join(__dirname, '../../frontend');
app.use(express.static(frontendPath));

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// =============================
// Iniciar servidor
// =============================
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));
