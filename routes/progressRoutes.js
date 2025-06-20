/**
 * Progress Routes - Rotas do sistema de progresso avançado
 * Define todas as rotas relacionadas ao acompanhamento de progresso,
 * estatísticas e análises de desempenho
 */

const express = require('express');
const router = express.Router();
const progressController = require('../controllers/progressController');
const { requireAuth } = require('../middleware/auth');

// Aplicar middleware de autenticação a todas as rotas
router.use(requireAuth);

// ========================================
// ROTAS PRINCIPAIS
// ========================================

// Página principal de progresso
router.get('/progress', progressController.showProgressPage);

// ========================================
// APIs DE DADOS
// ========================================

// API para dados de gráfico de progresso
router.get('/api/progress/chart', progressController.getProgressChartData);

// API para estatísticas de desempenho por período
router.get('/api/progress/performance/:period', progressController.getPerformanceStats);

// API para comparação detalhada
router.get('/api/progress/comparison', progressController.getDetailedComparison);

// API para atualizar metas do usuário
router.post('/api/progress/goals', progressController.updateUserGoals);

module.exports = router; 