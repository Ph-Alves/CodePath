/**
 * CodePath - Authentication Middleware
 * Middleware para controle de autenticação e autorização
 * 
 * Este arquivo contém middlewares para verificar se o usuário
 * está autenticado e proteger rotas que requerem login.
 */

const { validateSession } = require('../models/userModel');

/**
 * Middleware para verificar se o usuário está autenticado
 * Se não estiver, redireciona para a página de login
 */
function requireAuth(req, res, next) {
  // Verificar se existe sessão
  if (!req.session.user) {
    return res.redirect('/login');
  }
  
  // Usuário autenticado, continuar
  next();
}

/**
 * Middleware para verificar se o usuário NÃO está autenticado
 * Se estiver autenticado, redireciona para o dashboard
 * Útil para páginas como login e registro
 */
function requireGuest(req, res, next) {
  // Se já está logado, redirecionar para dashboard
  if (req.session.user) {
    return res.redirect('/dashboard');
  }
  
  // Usuário não autenticado, continuar
  next();
}

/**
 * Middleware para validar sessão com o banco de dados
 * Verifica se a sessão ainda é válida e atualiza os dados do usuário
 */
async function validateSessionMiddleware(req, res, next) {
  try {
    // Se não há sessão, continuar sem fazer nada
    if (!req.session.sessionToken) {
      return next();
    }
    
    // Validar sessão no banco de dados
    const userData = await validateSession(req.session.sessionToken);
    
    if (userData) {
      // Sessão válida - atualizar dados do usuário na sessão
      req.session.user = userData;
      res.locals.user = userData;
      res.locals.isAuthenticated = true;
    } else {
      // Sessão inválida - limpar dados da sessão
      req.session.user = null;
      req.session.sessionToken = null;
      res.locals.user = null;
      res.locals.isAuthenticated = false;
    }
    
    next();
  } catch (error) {
    console.error('Erro ao validar sessão:', error);
    
    // Em caso de erro, limpar sessão por segurança
    req.session.user = null;
    req.session.sessionToken = null;
    res.locals.user = null;
    res.locals.isAuthenticated = false;
    
    next();
  }
}

/**
 * Middleware para adicionar dados do usuário às views
 * Garante que as informações do usuário estejam disponíveis nos templates
 */
function addUserToViews(req, res, next) {
  // Disponibilizar dados do usuário para todas as views
  res.locals.user = req.session.user || null;
  res.locals.isAuthenticated = !!req.session.user;
  
  // Adicionar informações úteis para o template
  if (req.session.user) {
    res.locals.userName = req.session.user.name;
    res.locals.userLevel = req.session.user.level || 1;
    res.locals.userXP = req.session.user.xp_points || 0;
    res.locals.userStreak = req.session.user.streak_days || 0;
  }
  
  next();
}

/**
 * Middleware para logging de autenticação
 * Registra tentativas de login e logout para auditoria
 */
function authLogger(req, res, next) {
  // Log apenas em rotas de autenticação
  if (req.path.includes('/login') || req.path.includes('/logout') || req.path.includes('/register')) {
    const timestamp = new Date().toISOString();
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');
    
    console.log(`[AUTH] ${timestamp} - ${req.method} ${req.path} - IP: ${ip} - User: ${req.session.user?.email || 'Anônimo'}`);
  }
  
  next();
}

module.exports = {
  requireAuth,
  requireGuest,
  validateSessionMiddleware,
  addUserToViews,
  authLogger
}; 