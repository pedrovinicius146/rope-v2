require('dotenv').config();
const express = require('express');
const connectDB = require('./config/database');
const path = require('path');

const app = express();

// Conecta ao MongoDB
connectDB();

// ===============================
// 🔒 CORS manual e robusto
// ===============================
const allowedOrigins = [
  'https://rope-v2-production.up.railway.app',
  'http://localhost:8080',
  'http://127.0.0.1:8080',
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    // ✅ responde imediatamente ao preflight
    return res.sendStatus(204);
  }

  next();
});

// ===============================
// Middlewares
// ===============================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===============================
// Rotas
// ===============================
const authRoutes = require('./routes/auth');
const occurrencesRoutes = require('./routes/occurrences');

app.use('/api/auth', authRoutes);
app.use('/api/occurrences', occurrencesRoutes);

// Rota teste
app.get('/', (req, res) => {
  res.send('🟢 Backend RO-PE funcionando!');
});

// Servir uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ===============================
// Start do servidor
// ===============================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
