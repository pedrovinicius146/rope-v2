// =============================
// server.js – Backend RO-PE
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
// Middlewares
// =============================
app.use(express.json());
app.use(
  helmet({
    contentSecurityPolicy: false, // desativa CSP para facilitar dev/frontend
  })
);

// Limite de requisições
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Muitas requisições deste IP. Tente novamente mais tarde.',
  })
);

// CORS
const allowedOrigins = [
  'https://rope-v2-production.up.railway.app',
  'http://localhost:8080'
];
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) callback(null, true);
      else callback(new Error('Origem não permitida: ' + origin));
    },
    credentials: true,
  })
);

// =============================
// Conexão com MongoDB
// =============================
const mongoUri = process.env.MONGO_URI;
if (!mongoUri) {
  console.error('❌ MONGO_URI não definido!');
  process.exit(1);
}

mongoose
  .connect(mongoUri)
  .then(() => console.log('✅ Conectado ao MongoDB'))
  .catch((err) => {
    console.error('❌ Erro ao conectar ao MongoDB:', err.message);
    process.exit(1);
  });

// =============================
// Rotas da API
// =============================
const authRoutes = require('./routes/auth');
const occurrenceRoutes = require('./routes/occurrences');

app.use('/api/auth', authRoutes);
app.use('/api/occurrences', occurrenceRoutes);

// =============================
// Servir Frontend (opcional)
// =============================
const frontendPath = path.join(__dirname, '../frontend'); // ajuste conforme pasta
app.use(express.static(frontendPath));
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// =============================
// Iniciar servidor
// =============================
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));
