require('dotenv').config();
const express = require('express');
const connectDB = require('./config/database');
const cors = require('cors');

const app = express();

// ========================================
// 1️⃣ Conectar ao MongoDB
// ========================================
connectDB();

// ========================================
// 2️⃣ Configuração de CORS
// ========================================
const allowedOrigins = [
  'http://localhost:8080',
  'http://127.0.0.1:8080',
  'https://rope-v2-production.up.railway.app', // seu frontend
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }

  // Permitir cabeçalhos e métodos necessários
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');

  // ⚠️ Importante: responder imediatamente ao preflight
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
});

// ========================================
// 3️⃣ Middlewares globais
// ========================================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ========================================
// 4️⃣ Rotas
// ========================================
const authRoutes = require('./routes/auth');
const occurrencesRoutes = require('./routes/occurrences');

app.use('/api/auth', authRoutes);
app.use('/api/occurrences', occurrencesRoutes);

// ========================================
// 5️⃣ Rota teste
// ========================================
app.get('/', (req, res) => {
  res.send('🟢 Backend RO-PE funcionando!');
});

// ========================================
// 6️⃣ Servir uploads
// ========================================
app.use('/uploads', express.static('uploads'));

// ========================================
// 7️⃣ Start servidor
// ========================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
