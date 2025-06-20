/**
 * CodePath - Authentication Routes
 * Rotas para autenticação e autorização
 * 
 * Este arquivo define todas as rotas relacionadas à autenticação:
 * login, registro, logout e dashboard.
 */

const express = require('express');
const { requireAuth, requireGuest, authLogger } = require('../middleware/auth');
const {
  showLogin,
  processLogin,
  showRegister,
  processRegister,
  processLogout,
  showDashboard
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
 */
router.post('/login', requireGuest, processLogin);

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
router.post('/register', requireGuest, processRegister);

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

// ========================================
// ROTAS DO DASHBOARD
// ========================================

/**
 * GET /dashboard - Exibe o dashboard principal
 * Apenas usuários autenticados podem acessar
 */
router.get('/dashboard', requireAuth, showDashboard);

module.exports = router; 