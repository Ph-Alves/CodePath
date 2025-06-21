const AnalyticsModel = require('../models/analyticsModel');

/**
 * Controlador de Analytics - Sistema de Análise Avançada
 * Gerencia dashboard, relatórios e métricas de aprendizado
 */
class AnalyticsController {

    /**
     * Renderiza o dashboard principal de analytics
     */
    static async renderAnalyticsDashboard(req, res) {
        try {
            const userId = req.session.userId;
            
            // Verificar se é administrador para métricas da plataforma
            const isAdmin = req.session.isAdmin || false;
            
            // Obter analytics do usuário
            const userAnalytics = await AnalyticsModel.getUserAnalytics(userId);
            
            // Obter ranking do usuário
            const xpRanking = await AnalyticsModel.getUserRanking('xp', 10);
            const lessonsRanking = await AnalyticsModel.getUserRanking('lessons', 10);
            
            // Encontrar posição do usuário no ranking
            const userXpPosition = xpRanking.findIndex(user => user.id === userId) + 1;
            const userLessonsPosition = lessonsRanking.findIndex(user => user.id === userId) + 1;
            
            let platformStats = null;
            let engagementMetrics = null;
            
            // Se for admin, obter métricas da plataforma
            if (isAdmin) {
                platformStats = await AnalyticsModel.getPlatformStats();
                engagementMetrics = await AnalyticsModel.getEngagementMetrics('month');
            }

            res.render('pages/analytics-dashboard', {
                title: 'Analytics - CodePath',
                user: req.session.user,
                analytics: userAnalytics,
                rankings: {
                    xp: xpRanking,
                    lessons: lessonsRanking,
                    user_xp_position: userXpPosition || 'N/A',
                    user_lessons_position: userLessonsPosition || 'N/A'
                },
                platform_stats: platformStats,
                engagement_metrics: engagementMetrics,
                is_admin: isAdmin,
                // Dados para gráficos (formato JSON)
                chart_data: {
                    recent_activity: JSON.stringify(userAnalytics.recent_activity),
                    package_progress: JSON.stringify(userAnalytics.package_progress),
                    performance_metrics: JSON.stringify(userAnalytics.performance_metrics)
                }
            });
        } catch (error) {
            console.error('Erro ao renderizar dashboard de analytics:', error);
            res.status(500).render('pages/error', {
                title: 'Erro - CodePath',
                message: 'Erro interno do servidor',
                error: process.env.NODE_ENV === 'development' ? error : {}
            });
        }
    }

    /**
     * Gera e renderiza relatório de aprendizado
     */
    static async renderLearningReport(req, res) {
        try {
            const userId = req.session.userId;
            const period = req.query.period || 'month';
            
            // Validar período
            const validPeriods = ['week', 'month', 'quarter', 'year'];
            if (!validPeriods.includes(period)) {
                return res.status(400).json({
                    success: false,
                    message: 'Período inválido'
                });
            }
            
            // Gerar relatório
            const report = await AnalyticsModel.generateLearningReport(userId, period);
            
            res.render('pages/learning-report', {
                title: `Relatório de Aprendizado - ${period} - CodePath`,
                user: req.session.user,
                report: report,
                period: period,
                period_label: {
                    'week': 'Última Semana',
                    'month': 'Último Mês',
                    'quarter': 'Últimos 3 Meses',
                    'year': 'Último Ano'
                }[period],
                // Dados para gráficos
                chart_data: {
                    daily_progress: JSON.stringify(report.daily_progress),
                    quiz_performance: JSON.stringify(report.quiz_performance)
                }
            });
        } catch (error) {
            console.error('Erro ao gerar relatório de aprendizado:', error);
            res.status(500).render('pages/error', {
                title: 'Erro - CodePath',
                message: 'Erro ao gerar relatório',
                error: process.env.NODE_ENV === 'development' ? error : {}
            });
        }
    }

    /**
     * API: Obtém analytics do usuário
     */
    static async getUserAnalyticsAPI(req, res) {
        try {
            const userId = req.session.userId;
            const analytics = await AnalyticsModel.getUserAnalytics(userId);
            
            res.json({
                success: true,
                data: analytics
            });
        } catch (error) {
            console.error('Erro ao obter analytics via API:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    /**
     * API: Obtém métricas da plataforma (apenas admin)
     */
    static async getPlatformStatsAPI(req, res) {
        try {
            // Verificar se é administrador
            if (!req.session.isAdmin) {
                return res.status(403).json({
                    success: false,
                    message: 'Acesso negado'
                });
            }
            
            const stats = await AnalyticsModel.getPlatformStats();
            
            res.json({
                success: true,
                data: stats
            });
        } catch (error) {
            console.error('Erro ao obter estatísticas da plataforma:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    /**
     * API: Obtém ranking de usuários
     */
    static async getUserRankingAPI(req, res) {
        try {
            const metric = req.query.metric || 'xp';
            const limit = parseInt(req.query.limit) || 10;
            
            // Validar métrica
            const validMetrics = ['xp', 'lessons', 'achievements'];
            if (!validMetrics.includes(metric)) {
                return res.status(400).json({
                    success: false,
                    message: 'Métrica inválida'
                });
            }
            
            // Validar limite
            if (limit < 1 || limit > 50) {
                return res.status(400).json({
                    success: false,
                    message: 'Limite deve estar entre 1 e 50'
                });
            }
            
            const ranking = await AnalyticsModel.getUserRanking(metric, limit);
            
            res.json({
                success: true,
                data: ranking
            });
        } catch (error) {
            console.error('Erro ao obter ranking:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    /**
     * API: Obtém métricas de engajamento
     */
    static async getEngagementMetricsAPI(req, res) {
        try {
            // Verificar se é administrador
            if (!req.session.isAdmin) {
                return res.status(403).json({
                    success: false,
                    message: 'Acesso negado'
                });
            }
            
            const period = req.query.period || 'month';
            
            // Validar período
            const validPeriods = ['week', 'month'];
            if (!validPeriods.includes(period)) {
                return res.status(400).json({
                    success: false,
                    message: 'Período inválido'
                });
            }
            
            const metrics = await AnalyticsModel.getEngagementMetrics(period);
            
            res.json({
                success: true,
                data: metrics
            });
        } catch (error) {
            console.error('Erro ao obter métricas de engajamento:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    /**
     * API: Gera relatório de aprendizado
     */
    static async generateLearningReportAPI(req, res) {
        try {
            const userId = req.session.userId;
            const period = req.query.period || 'month';
            
            // Validar período
            const validPeriods = ['week', 'month', 'quarter', 'year'];
            if (!validPeriods.includes(period)) {
                return res.status(400).json({
                    success: false,
                    message: 'Período inválido'
                });
            }
            
            const report = await AnalyticsModel.generateLearningReport(userId, period);
            
            res.json({
                success: true,
                data: report
            });
        } catch (error) {
            console.error('Erro ao gerar relatório via API:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    /**
     * API: Obtém dados para gráficos
     */
    static async getChartDataAPI(req, res) {
        try {
            const userId = req.session.userId;
            const chartType = req.query.type;
            const period = req.query.period || 'month';
            
            let data = {};
            
            switch (chartType) {
                case 'activity':
                    // Dados de atividade recente
                    const analytics = await AnalyticsModel.getUserAnalytics(userId);
                    data = analytics.recent_activity;
                    break;
                    
                case 'performance':
                    // Dados de performance em quizzes
                    const report = await AnalyticsModel.generateLearningReport(userId, period);
                    data = report.quiz_performance;
                    break;
                    
                case 'progress':
                    // Dados de progresso por pacote
                    const userAnalytics = await AnalyticsModel.getUserAnalytics(userId);
                    data = userAnalytics.package_progress;
                    break;
                    
                case 'comparison':
                    // Dados de comparação com outros usuários
                    const rankings = await AnalyticsModel.getUserRanking('xp', 10);
                    const userPosition = rankings.findIndex(user => user.id === userId) + 1;
                    data = {
                        user_position: userPosition || 'N/A',
                        ranking: rankings
                    };
                    break;
                    
                default:
                    return res.status(400).json({
                        success: false,
                        message: 'Tipo de gráfico inválido'
                    });
            }
            
            res.json({
                success: true,
                data: data
            });
        } catch (error) {
            console.error('Erro ao obter dados para gráfico:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    /**
     * API: Exporta dados de analytics
     */
    static async exportAnalyticsData(req, res) {
        try {
            const userId = req.session.userId;
            const format = req.query.format || 'json';
            const period = req.query.period || 'month';
            
            // Coletar todos os dados
            const analytics = await AnalyticsModel.getUserAnalytics(userId);
            const report = await AnalyticsModel.generateLearningReport(userId, period);
            
            const exportData = {
                export_date: new Date().toISOString(),
                user_id: userId,
                period: period,
                analytics: analytics,
                report: report
            };
            
            if (format === 'json') {
                res.setHeader('Content-Type', 'application/json');
                res.setHeader('Content-Disposition', `attachment; filename="analytics_${userId}_${period}.json"`);
                res.json(exportData);
            } else {
                return res.status(400).json({
                    success: false,
                    message: 'Formato de exportação não suportado'
                });
            }
        } catch (error) {
            console.error('Erro ao exportar dados de analytics:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    /**
     * Renderiza página de comparação de usuários
     */
    static async renderUserComparison(req, res) {
        try {
            const userId = req.session.userId;
            
            // Obter rankings por diferentes métricas
            const xpRanking = await AnalyticsModel.getUserRanking('xp', 20);
            const lessonsRanking = await AnalyticsModel.getUserRanking('lessons', 20);
            const achievementsRanking = await AnalyticsModel.getUserRanking('achievements', 20);
            
            // Encontrar posições do usuário
            const userPositions = {
                xp: xpRanking.findIndex(user => user.id === userId) + 1 || 'N/A',
                lessons: lessonsRanking.findIndex(user => user.id === userId) + 1 || 'N/A',
                achievements: achievementsRanking.findIndex(user => user.id === userId) + 1 || 'N/A'
            };
            
            // Obter analytics do usuário para comparação
            const userAnalytics = await AnalyticsModel.getUserAnalytics(userId);
            
            res.render('pages/user-comparison', {
                title: 'Comparação de Performance - CodePath',
                user: req.session.user,
                rankings: {
                    xp: xpRanking,
                    lessons: lessonsRanking,
                    achievements: achievementsRanking
                },
                user_positions: userPositions,
                user_analytics: userAnalytics,
                // Dados para gráficos
                chart_data: {
                    xp_ranking: JSON.stringify(xpRanking.slice(0, 10)),
                    lessons_ranking: JSON.stringify(lessonsRanking.slice(0, 10)),
                    achievements_ranking: JSON.stringify(achievementsRanking.slice(0, 10))
                }
            });
        } catch (error) {
            console.error('Erro ao renderizar comparação de usuários:', error);
            res.status(500).render('pages/error', {
                title: 'Erro - CodePath',
                message: 'Erro interno do servidor',
                error: process.env.NODE_ENV === 'development' ? error : {}
            });
        }
    }
}

module.exports = AnalyticsController; 