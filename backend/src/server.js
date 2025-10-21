require('dotenv').config(); // Carrega variáveis do .env
const express = require('express');
const connectDB = require('./config/database');
const cors = require('cors');
const path = require('path');

const app = express();

// Conectar ao MongoDB
connectDB();

// Configuração de CORS
const allowedOrigins = [
  'http://localhost:8080',
  'http://127.0.0.1:8080',
  'https://rope-v2-production.up.railway.app',
];

app.use(cors({
  origin: function(origin, callback) {
    // Permite requisições sem origin (ex: Postman)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) === -1) {
      return callback(new Error('Acesso bloqueado por CORS'), false);
    }
    return callback(null, true);
  },
  credentials: true, // Permite envio de cookies
}));

// Permite receber JSON e dados de formulários
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rotas
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

// Start do servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
