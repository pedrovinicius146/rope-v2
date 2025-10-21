// =============================
//  server.js – Backend + Frontend (Railway)
// =============================
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
//  MIDDLEWARES
// =============================
app.use(express.json());
app.use(helmet());

// Limita requisições para evitar abuso
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100,
  message: 'Muitas requisições deste IP. Tente novamente mais tarde.'
});
app.use(limiter);

// =============================
//  CORS
// =============================
const allowedOrigins = [
  'http://localhost:8080',
  'http://127.0.0.1:8080',
  'https://rope-v2-production.up.railway.app'
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Origem não permitida: ' + origin));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  })
);

// =============================
//  CONEXÃO COM MONGODB
// =============================
const mongoUri = process.env.MONGO_URI;
console.log('🔍 MONGO_URI lido:', mongoUri ? 'OK' : 'undefined');

if (!mongoUri) {
  console.error('❌ ERRO: MONGO_URI não está definido!');
  process.exit(1);
}

mongoose
  .connect(mongoUri)
  .then(() => console.log('✅ Conectado ao MongoDB!'))
  .catch((err) => {
    console.error('❌ Erro ao conectar ao MongoDB:', err.message);
    process.exit(1);
  });

// =============================
//  ROTAS DA API
// =============================
const authRoutes = require('./routes/auth');
const occurrenceRoutes = require('./routes/occurrences');

app.use('/api/auth', authRoutes);
app.use('/api/occurrences', occurrenceRoutes);

// =============================
//  SERVIR FRONTEND (build ou arquivos estáticos)
// =============================
const frontendPath = path.join(__dirname, '../../frontend'); // sobe 2 níveis se estiver em backend/src/
app.use(express.static(frontendPath));

// Rota de fallback — entrega index.html para rotas SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// =============================
//  INICIAR SERVIDOR
// =============================
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));
