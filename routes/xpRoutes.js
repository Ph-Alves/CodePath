const express = require('express');
const router = express.Router();
const xpController = require('../controllers/xpController');
const auth = require('../middleware/auth');
const xpMiddleware = require('../middleware/xpMiddleware');

/**
 * Rotas para sistema de XP e gamificação
 * Todas as rotas requerem autenticação
 */

// Middleware de autenticação para todas as rotas
router.use(auth.requireAuth);

// Middleware para anexar dados de XP aos templates
router.use(xpMiddleware.attachXPToTemplate);

/**
 * APIs REST para XP
 */

// Obtém perfil completo de XP do usuário
router.get('/profile', xpController.getXPProfile);

// Obtém leaderboard de XP
router.get('/leaderboard', xpController.getLeaderboard);

// Obtém histórico de XP do usuário
router.get('/history', xpController.getXPHistory);

// Obtém estatísticas de XP
router.get('/stats', xpController.getXPStats);

// Força verificação de conquistas
router.post('/check-achievements', xpController.checkAchievements);

/**
 * Páginas de interface
 */

// Página de leaderboard
router.get('/leaderboard/page', xpController.showLeaderboardPage);

// Página de conquistas
router.get('/achievements/page', xpController.showAchievementsPage);

module.exports = router; 