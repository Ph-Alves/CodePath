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
const userModel = require('../models/userModel');

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
  // rateLimiter({
  //   limit: 10,
  //   windowMinutes: 5,
  //   message: 'Muitas tentativas de login. Tente novamente em 5 minutos.'
  // }),
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
  // rateLimiter({
  //   limit: 3,
  //   windowMinutes: 60,
  //   message: 'Muitas tentativas de registro. Tente novamente em 1 hora.'
  // }),
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

// Rota para mostrar a página de login
router.get('/login', (req, res) => {
    // Se usuário já está logado, redirecionar para dashboard
    if (req.session.user) {
        return res.redirect('/dashboard');
    }
    
    res.render('pages/login', {
        title: 'Login - CodePath',
        error: req.query.error,
        message: req.query.message
    });
});

// Rota /my-area removida - agora está em userRoutes.js

// Rota temporária para Configurações
router.get('/settings', requireAuth, async (req, res) => {
    try {
        // Buscar dados do usuário para a página
        const user = req.session.user;
        const userData = await userModel.getUserById(user.id);
        
        // Calcular progresso XP para próximo nível
        const xpForNextLevel = userData.level * 1000;
        const xpProgress = Math.round((userData.total_xp / xpForNextLevel) * 100);
        
        res.render('pages/settings', {
            title: 'Configurações - CodePath',
            user: {
                ...userData,
                xpProgress: xpProgress
            },
            isSettings: true,
            comingSoon: true
        });
    } catch (error) {
        console.error('Erro ao carregar Configurações:', error);
        res.status(500).render('pages/error', {
            title: 'Erro - CodePath',
            error: 'Erro interno do servidor',
            user: req.session.user
        });
    }
});

module.exports = router; 