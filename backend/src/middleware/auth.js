const jwt = require('jsonwebtoken'); // Importa a biblioteca para manipular JSON Web Tokens
const User = require('../models/User'); // Importa o modelo de usuário para buscar dados no MongoDB

// =============================
// Middleware de proteção de rotas (autenticação)
// =============================
const protect = async (req, res, next) => {
  let token; // Variável que armazenará o token extraído do cabeçalho

  // Verifica se o cabeçalho Authorization existe e começa com "Bearer"
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    // Extrai apenas o token (após o "Bearer ")
    token = req.headers.authorization.split(' ')[1];

    try {
      // Verifica e decodifica o token usando a chave secreta (JWT_SECRET)
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Busca o usuário correspondente ao ID decodificado, removendo o campo "password"
      req.user = await User.findById(decoded.id).select('-password');

      // Continua para o próximo middleware ou rota protegida
      next();

    } catch (err) {
      // Caso o token seja inválido, expirado ou adulterado
      return res.status(401).json({ message: 'Token inválido' });
    }

  } else {
    // Se o token não foi enviado no cabeçalho Authorization
    return res.status(401).json({ message: 'Não autorizado, token não encontrado' });
  }
};

// =============================
// Exporta o middleware
// =============================
module.exports = protect; // Permite importar em rotas para proteger endpoints
