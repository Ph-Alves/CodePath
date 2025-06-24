/**
 * CodePath - Authentication Middleware
 * Middleware para controle de autenticação e autorização
 * 
 * Este arquivo contém middlewares para verificar se o usuário
 * está autenticado e proteger rotas que requerem login.
 */

const { validateSession } = require('../models/userModel');
const ValidationModel = require('../models/validationModel');
const database = require('../models/database');

/**
 * Função auxiliar para atualizar atividade da sessão
 */
async function updateSessionActivity(sessionToken) {
  try {
    const db = database.database;
    await db.run(`
      UPDATE user_sessions 
      SET last_activity = datetime('now') 
      WHERE session_token = ?
    `, [sessionToken]);
  } catch (error) {
    console.error('Erro ao atualizar atividade da sessão:', error);
  }
}

/**
 * Middleware para verificar se o usuário está autenticado
 * Se não estiver, redireciona para a página de login
 * Versão melhorada com tratamento robusto de erros
 */
function requireAuth(req, res, next) {
  try {
    // Verificar se existe sessão
    if (!req.session || !req.session.user) {
      console.log(`[AUTH] Acesso negado para ${req.originalUrl} - Usuário não autenticado`);
      
      // Log tentativa de acesso não autorizado de forma assíncrona
      const ip = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
      setImmediate(() => {
        try {
          ValidationModel.logSuspiciousActivity(
            null,
            'unauthorized_access',
            ip,
            JSON.stringify({
              url: req.originalUrl,
              method: req.method,
              userAgent: req.get('User-Agent')
            })
          );
        } catch (logError) {
          console.warn('[AUTH] Erro ao registrar atividade suspeita:', logError.message);
        }
      });
      
      // Verificar se é uma requisição AJAX
      if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
        return res.status(401).json({
          error: 'Não autenticado',
          message: 'Você precisa fazer login para acessar este recurso.',
          redirectTo: '/login'
        });
      }
      
      // Redirecionar para login
      return res.redirect('/login');
    }
    
    // Verificar se os dados da sessão são válidos
    if (!req.session.user.id || !req.session.user.email) {
      console.log(`[AUTH] Sessão inválida detectada - dados do usuário incompletos`);
      
      // Limpar sessão inválida
      req.session.user = null;
      req.session.sessionToken = null;
      
      return res.redirect('/login');
    }
    
    // Log de acesso autorizado (apenas para debug)
    console.log(`[AUTH] Acesso autorizado para ${req.originalUrl} - Usuário: ${req.session.user.email}`);
    
    // Usuário autenticado, continuar
    next();
    
  } catch (error) {
    console.error('[AUTH] Erro no middleware requireAuth:', error);
    
    // Em caso de erro, limpar sessão por segurança
    try {
      req.session.user = null;
      req.session.sessionToken = null;
    } catch (sessionError) {
      console.error('[AUTH] Erro ao limpar sessão:', sessionError);
    }
    
    // Redirecionar para login
    res.redirect('/login');
  }
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
      
      // Atualizar last_activity da sessão
      await updateSessionActivity(req.session.sessionToken);
    } else {
      // Sessão inválida - limpar dados da sessão e log atividade suspeita
      const ip = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
      
      setImmediate(() => {
        ValidationModel.logSuspiciousActivity(
          null,
          'invalid_session',
          ip,
          JSON.stringify({
            sessionToken: req.session.sessionToken?.substring(0, 10) + '...',
            url: req.originalUrl,
            userAgent: req.get('User-Agent')
          })
        );
      });
      
      req.session.user = null;
      req.session.sessionToken = null;
      res.locals.user = null;
      res.locals.isAuthenticated = false;
    }
    
    next();
  } catch (error) {
    console.error('Erro ao validar sessão:', error);
    
    // Log erro como atividade suspeita
    const ip = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
    setImmediate(() => {
      ValidationModel.logSuspiciousActivity(
        null,
        'session_validation_error',
        ip,
        JSON.stringify({
          error: error.message,
          url: req.originalUrl
        })
      );
    });
    
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
            res.locals.userXP = req.session.user.total_xp || 0;
    res.locals.userStreak = req.session.user.streak_days || 0;
    res.locals.isAdmin = req.session.user.isAdmin || req.session.user.is_admin;
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