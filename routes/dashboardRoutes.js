/**
 * CodePath - Dashboard Routes
 * Rotas para o dashboard e métricas do usuário
 * 
 * Este arquivo contém as rotas relacionadas ao dashboard,
 * incluindo APIs para progresso e métricas em tempo real.
 */

const express = require('express');
const router = express.Router();

// Importar controller do dashboard
const { 
  showDashboard, 
  getPackageProgress, 
  updateMetrics 
} = require('../controllers/dashboardController');

// Middleware de autenticação
const { requireAuth } = require('../middleware/auth');

/**
 * Rota principal do dashboard
 * GET /dashboard
 */
router.get('/', requireAuth, showDashboard);

/**
 * API para buscar progresso detalhado de um pacote
 * GET /dashboard/api/progress/:packageId
 */
router.get('/api/progress/:packageId', requireAuth, getPackageProgress);

/**
 * API para atualizar métricas do dashboard
 * GET /dashboard/api/metrics
 */
router.get('/api/metrics', requireAuth, updateMetrics);

module.exports = router; 