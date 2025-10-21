// ==========================================
//  server.js – Backend ROPE V2 (definitivo)
// ==========================================
require('dotenv').config(); // Carrega variáveis do .env ou do Railway

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Rotas
const authRoutes = require('./routes/authRoutes');
const occurrenceRoutes = require('./routes/occurrenceRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

// Inicializa app
const app = express();

// ==========================================
//  MIDDLEWARES
// ==========================================
app.use(express.json());
app.use(helmet());

// Limita requisições (proteção básica contra DDoS)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requisições por IP
});
app.use(limiter);

// ==========================================
//  CONFIGURAÇÃO DE CORS
// ==========================================
const allowedOrigins = [
  'http://localhost:8080',
  'https://rope-v2-production.up.railway.app'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn('🚫 Origem bloqueada pelo CORS:', origin);
      callback(new Error('CORS não permitido para: ' + origin));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// ==========================================
//  CONEXÃO COM MONGODB
// ==========================================
const mongoUri = process.env.MONGO_URI;
console.log('🔍 MONGO_URI lido:', mongoUri ? 'OK' : 'undefined');

mongoose.connect(mongoUri)
  .then(() => console.log('✅ Conectado ao MongoDB com sucesso!'))
  .catch(err => console.error('❌ Erro ao conectar ao MongoDB:', err.message));

// ==========================================
//  ROTAS
// ==========================================
app.get('/', (req, res) => {
  res.json({ message: '🚀 API ROPE rodando com sucesso!' });
});

app.use('/api/auth', authRoutes);
app.use('/api/occurrences', occurrenceRoutes);
app.use('/api/uploads', uploadRoutes);

// ==========================================
//  SERVIR ARQUIVOS ESTÁTICOS (uploads)
// ==========================================
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ==========================================
//  INICIAR SERVIDOR
// ==========================================
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));
