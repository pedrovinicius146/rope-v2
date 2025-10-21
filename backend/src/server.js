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
app.use(
  helmet({
    contentSecurityPolicy: false
  })
);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100,
  message: 'Muitas requisições deste IP. Tente novamente mais tarde.'
});
app.use(limiter);

const allowedOrigins = [
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
    methods: ['GET','POST','PUT','DELETE'],
    credentials: true
  })
);

// =============================
// MONGODB
// =============================
const mongoUri = process.env.MONGO_URI;
if (!mongoUri) {
  console.error('❌ MONGO_URI não definido!');
  process.exit(1);
}

mongoose.connect(mongoUri)
  .then(() => console.log('✅ Conectado ao MongoDB!'))
  .catch(err => {
    console.error('❌ Erro ao conectar:', err.message);
    process.exit(1);
  });

// =============================
// ROTAS DA API
// =============================
const authRoutes = require('./routes/auth');
const occurrenceRoutes = require('./routes/occurrences');

app.use('/api/auth', authRoutes);
app.use('/api/occurrences', occurrenceRoutes);

// =============================
// SERVIR FRONTEND
// =============================
const frontendPath = path.join(__dirname, 'frontend'); // seu HTML/CSS/JS
app.use(express.static(frontendPath));

// Rota SPA fallback (depois das APIs)
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// =============================
// INICIAR SERVIDOR
// =============================
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));
