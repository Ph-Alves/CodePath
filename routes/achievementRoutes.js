const express = require('express');
const router = express.Router();
const AchievementController = require('../controllers/achievementController');
const auth = require('../middleware/auth');

/**
 * Rotas do Sistema de Conquistas e Streak
 * Todas as rotas requerem autenticação
 */

// Aplicar middleware de autenticação a todas as rotas
router.use(auth.requireAuth);

// ========================================
// ROTAS DE PÁGINA
// ========================================

/**
 * GET /achievements
 * Página principal de conquistas
 */
router.get('/', AchievementController.showAchievementsPage);

// ========================================
// ROTAS DE API
// ========================================

/**
 * GET /achievements/api/user
 * API: Obtém conquistas do usuário atual
 */
router.get('/api/user', AchievementController.getUserAchievementsAPI);

/**
 * POST /achievements/api/check
 * API: Verifica e desbloqueia novas conquistas
 */
router.post('/api/check', AchievementController.checkAchievementsAPI);

/**
 * POST /achievements/api/streak/update
 * API: Atualiza streak do usuário
 */
router.post('/api/streak/update', AchievementController.updateStreakAPI);

/**
 * GET /achievements/api/stats
 * API: Obtém estatísticas de conquistas
 */
router.get('/api/stats', AchievementController.getAchievementStatsAPI);

/**
 * GET /achievements/api/progress/:id
 * API: Obtém progresso de uma conquista específica
 */
router.get('/api/progress/:id', AchievementController.getAchievementProgressAPI);

module.exports = router; 