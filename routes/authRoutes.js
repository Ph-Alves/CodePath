/**
 * CodePath - Authentication Routes
 * Rotas para autenticação e autorização
 * 
 * Este arquivo define todas as rotas relacionadas à autenticação:
 * login, registro, logout e dashboard.
 */

const express = require('express');
const { requireAuth, requireGuest, authLogger } = require('../middleware/auth');
const { processDailyLogin } = require('../middleware/xpMiddleware');
const { 
  rateLimiter, 
  validateForm, 
  loginProtection, 
  logLoginResult 
} = require('../middleware/security');
const {
  showLogin,
  processLogin,
  showRegister,
  processRegister,
  processLogout
} = require('../controllers/authController');

const router = express.Router();

// Aplicar middleware de logging em todas as rotas de autenticação
router.use(authLogger);

// ========================================
// ROTAS DE LOGIN
// ========================================

/**
 * GET /login - Exibe a página de login
 * Apenas usuários não autenticados podem acessar
 */
router.get('/login', requireGuest, showLogin);

/**
 * POST /login - Processa o login do usuário
 * Apenas usuários não autenticados podem acessar
 * Inclui processamento de login diário para XP
 */
router.post('/login', 
  requireGuest, 
  rateLimiter({
    limit: 5,
    windowMinutes: 15,
    message: 'Muitas tentativas de login. Tente novamente em 15 minutos.'
  }),
  validateForm({
    email: {
      required: true,
      type: 'email',
      minLength: 5,
      maxLength: 255
    },
    password: {
      required: true,
      type: 'string',
      minLength: 1,
      maxLength: 128
    }
  }),
  loginProtection,
  processLogin, 
  logLoginResult,
  processDailyLogin
);

// ========================================
// ROTAS DE REGISTRO
// ========================================

/**
 * GET /register - Exibe a página de registro
 * Apenas usuários não autenticados podem acessar
 */
router.get('/register', requireGuest, showRegister);

/**
 * POST /register - Processa o registro de novo usuário
 * Apenas usuários não autenticados podem acessar
 */
router.post('/register', 
  requireGuest, 
  rateLimiter({
    limit: 3,
    windowMinutes: 60,
    message: 'Muitas tentativas de registro. Tente novamente em 1 hora.'
  }),
  validateForm({
    name: {
      required: true,
      type: 'string',
      minLength: 2,
      maxLength: 100
    },
    email: {
      required: true,
      type: 'email',
      minLength: 5,
      maxLength: 255
    },
    password: {
      required: true,
      type: 'string',
      minLength: 8,
      maxLength: 128
    },
    confirmPassword: {
      required: true,
      type: 'string',
      minLength: 8,
      maxLength: 128
    }
  }),
  processRegister
);

// ========================================
// ROTAS DE LOGOUT
// ========================================

/**
 * POST /logout - Processa o logout do usuário
 * Apenas usuários autenticados podem acessar
 */
router.post('/logout', requireAuth, processLogout);

/**
 * GET /logout - Alternativa para logout via GET (para links)
 * Apenas usuários autenticados podem acessar
 */
router.get('/logout', requireAuth, processLogout);



module.exports = router; 