// ==============================
// 🧠 CONFIGURAÇÕES INICIAIS
// ==============================
require('dotenv').config();
const express = require('express');
const connectDB = require('./config/database');
const path = require('path');

const app = express();

// Conectar ao MongoDB
connectDB();

// ==============================
// 🔒 CONFIGURAÇÃO DE CORS
// ==============================

const allowedOrigins = [
  'http://localhost:8080',
  'http://127.0.0.1:8080',
  'https://rope-v2-production.up.railway.app', // ✅ seu frontend no Railway/Vercel
];

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // ✅ Responde requisições preflight (CORS OPTIONS)
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
});

// ==============================
// 🧩 MIDDLEWARES
// ==============================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==============================
// 📦 ROTAS
// ==============================
const authRoutes = require('./routes/auth');
const occurrencesRoutes = require('./routes/occurrences');

app.use('/api/auth', authRoutes);
app.use('/api/occurrences', occurrencesRoutes);

// ==============================
// 📁 SERVIR UPLOADS
// ==============================
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ==============================
// 🧪 ROTA DE TESTE
// ==============================
app.get('/', (req, res) => {
  res.send('🟢 Backend RO-PE funcionando perfeitamente!');
});

// ==============================
// 🚀 INICIAR SERVIDOR
// ==============================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
