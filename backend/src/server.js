require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const http = require('http');
const socketIO = require('socket.io');
const connectDB = require('./config/database');

// Inicializar Express
const app = express();
const server = http.createServer(app);

// Configurar Socket.io
const io = socketIO(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:8080',
    methods: ['GET', 'POST']
  }
});

// Disponibilizar io globalmente
app.set('io', io);

// Conectar ao MongoDB
connectDB();

// Middlewares
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8080',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo de 100 requests por IP
  message: {
    success: false,
    message: 'Muitas requisições. Tente novamente mais tarde.'
  }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // máximo de 5 tentativas de login/registro por IP
  message: {
    success: false,
    message: 'Muitas tentativas. Tente novamente em 15 minutos.'
  }
});

app.use('/api/', limiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Rotas
app.use('/api/auth', require('./routes/auth'));
app.use('/api/occurrences', require('./routes/occurrences'));

// Rota de health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'API RO-PE está funcionando!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Rota raiz
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Bem-vindo à API RO-PE!',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        me: 'GET /api/auth/me'
      },
      occurrences: {
        list: 'GET /api/occurrences',
        create: 'POST /api/occurrences',
        details: 'GET /api/occurrences/:id',
        update: 'PUT /api/occurrences/:id',
        delete: 'DELETE /api/occurrences/:id',
        photo: 'GET /api/occurrences/:id/photo'
      }
    }
  });
});

// Handler de erro 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Rota não encontrada.'
  });
});

// Handler de erro global
app.use((err, req, res, next) => {
  console.error('Erro:', err);
  
  // Erro de Multer (upload)
  if (err.name === 'MulterError') {
    return res.status(400).json({
      success: false,
      message: 'Erro no upload do arquivo.',
      error: err.message
    });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Erro interno do servidor.',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Socket.io - Eventos em tempo real
io.on('connection', (socket) => {
  console.log(`✅ Cliente conectado: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`❌ Cliente desconectado: ${socket.id}`);
  });

  // Enviar mensagem de boas-vindas
  socket.emit('welcome', {
    message: 'Conectado ao servidor RO-PE!',
    timestamp: new Date().toISOString()
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`
  ╔═══════════════════════════════════════╗
  ║   🚀 Servidor RO-PE Iniciado!        ║
  ╠═══════════════════════════════════════╣
  ║   Porta: ${PORT}                      ║
  ║   Ambiente: ${process.env.NODE_ENV || 'development'}           ║
  ║   URL: http://localhost:${PORT}       ║
  ╚═══════════════════════════════════════╝
  `);
});