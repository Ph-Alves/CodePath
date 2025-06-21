const express = require('express');
const router = express.Router();
const AnalyticsController = require('../controllers/analyticsController');
const authMiddleware = require('../middleware/auth');

/**
 * Rotas de Analytics - Sistema de Análise Avançada
 * Todas as rotas requerem autenticação
 */

// Middleware de autenticação para todas as rotas
router.use(authMiddleware.requireAuth);

// === ROTAS DE PÁGINAS ===

/**
 * GET /analytics
 * Dashboard principal de analytics
 */
router.get('/', AnalyticsController.renderAnalyticsDashboard);

/**
 * GET /analytics/report
 * Página de relatório de aprendizado
 * Query params: period (week|month|quarter|year)
 */
router.get('/report', AnalyticsController.renderLearningReport);

/**
 * GET /analytics/comparison
 * Página de comparação com outros usuários
 */
router.get('/comparison', AnalyticsController.renderUserComparison);

// === ROTAS DE API ===

/**
 * GET /analytics/api/user
 * Obtém analytics completos do usuário autenticado
 */
router.get('/api/user', AnalyticsController.getUserAnalyticsAPI);

/**
 * GET /analytics/api/platform
 * Obtém estatísticas gerais da plataforma (apenas admin)
 */
router.get('/api/platform', AnalyticsController.getPlatformStatsAPI);

/**
 * GET /analytics/api/ranking
 * Obtém ranking de usuários
 * Query params: metric (xp|lessons|achievements), limit (1-50)
 */
router.get('/api/ranking', AnalyticsController.getUserRankingAPI);

/**
 * GET /analytics/api/engagement
 * Obtém métricas de engajamento da plataforma (apenas admin)
 * Query params: period (week|month)
 */
router.get('/api/engagement', AnalyticsController.getEngagementMetricsAPI);

/**
 * GET /analytics/api/report
 * Gera relatório de aprendizado via API
 * Query params: period (week|month|quarter|year)
 */
router.get('/api/report', AnalyticsController.generateLearningReportAPI);

/**
 * GET /analytics/api/chart-data
 * Obtém dados formatados para gráficos
 * Query params: type (activity|performance|progress|comparison), period
 */
router.get('/api/chart-data', AnalyticsController.getChartDataAPI);

/**
 * GET /analytics/api/export
 * Exporta dados de analytics do usuário
 * Query params: format (json), period (week|month|quarter|year)
 */
router.get('/api/export', AnalyticsController.exportAnalyticsData);

module.exports = router; 