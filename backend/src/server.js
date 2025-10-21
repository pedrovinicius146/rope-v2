// =============================
//  server.js – Backend ROPE V2
// =============================
require('dotenv').config(); // Carrega variáveis do .env ou do Railway

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Cria app
const app = express();

// =============================
//  MIDDLEWARES
// =============================
app.use(express.json());
app.use(helmet());

// Limita requisições (segurança)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100,
});
app.use(limiter);

// =============================
//  CONFIGURAÇÃO DE CORS
// =============================
const allowedOrigins = [
  'http://localhost:8080',
  'https://rope-v2-production.up.railway.app'
];

app.use(cors({
  origin: function (origin, callback) {
    // Permite sem origem (ex: ferramentas internas ou Postman)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Origem não permitida pelo CORS: ' + origin));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// =============================
//  CONEXÃO COM O BANCO DE DADOS
// =============================
const mongoUri = process.env.MONGO_URI;

console.log('🔍 MONGO_URI lido:', mongoUri ? 'OK' : 'undefined');

if (!mongoUri) {
  console.error('❌ ERRO: MONGO_URI não está definido nas variáveis de ambiente.');
  process.exit(1);
}

mongoose.connect(mongoUri)
  .then(() => console.log('✅ Conectado ao MongoDB com sucesso!'))
  .catch(err => {
    console.error('❌ Erro ao conectar ao MongoDB:', err.message);
    process.exit(1);
  });

// =============================
//  IMPORTAÇÃO DAS ROTAS
// =============================
const authRoutes = require('./routes/authRoutes');
const occurrenceRoutes = require('./routes/occurrenceRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

// =============================
//  ROTAS
// =============================

// Teste rápido (para checar se o backend está online)
app.get('/', (req, res) => {
  res.json({ message: '🚀 API ROPE rodando com sucesso!' });
});

app.use('/api/auth', authRoutes);
app.use('/api/occurrences', occurrenceRoutes);
;

// =============================
//  SERVIR FRONTEND (caso queira usar o mesmo domínio)
// =============================
// app.use(express.static(path.join(__dirname, '../frontend')));
// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, '../frontend/index.html'));
// });

// =============================
//  INICIA O SERVIDOR
// =============================
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));
