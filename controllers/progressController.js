/**
 * Progress Controller - Controlador do sistema de progresso avançado
 * Gerencia a exibição de estatísticas detalhadas, gráficos e comparações
 */

const progressModel = require('../models/progressModel');

const progressController = {
    
    /**
     * Exibir página principal de progresso
     */
    showProgressPage: async (req, res) => {
        try {
            const userId = req.session.user.id;
            
            // Buscar estatísticas gerais
            const overallStats = await progressModel.getUserOverallStats(userId);
            
            // Buscar progresso por pacote
            const packageProgress = await progressModel.getUserPackageProgress(userId);
            
            // Buscar atividade recente
            const recentActivity = await progressModel.getUserRecentActivity(userId, 8);
            
            // Buscar metas/objetivos
            const goals = await progressModel.getUserGoals(userId);
            
            // Buscar estatísticas de desempenho do mês
            const monthlyStats = await progressModel.getUserPerformanceStats(userId, 'month');
            
            // Buscar comparação com outros usuários
            const comparison = await progressModel.getUserComparison(userId);
            
            // Preparar dados para a view
            const progressData = {
                user: req.session.user,
                overallStats: {
                    ...overallStats,
                    // Calcular dias desde o registro
                    daysSinceRegistration: overallStats.registration_date ? 
                        Math.floor((new Date() - new Date(overallStats.registration_date)) / (1000 * 60 * 60 * 24)) : 0,
                    // Formatar última atividade
                    lastActivityFormatted: overallStats.last_activity ? 
                        formatDate(overallStats.last_activity) : 'Nunca',
                    // Calcular progresso médio formatado
                    averageProgressFormatted: Math.round(overallStats.average_progress || 0)
                },
                packageProgress: packageProgress.map(pkg => ({
                    ...pkg,
                    // Adicionar classe CSS baseada no status
                    statusClass: getStatusClass(pkg.status),
                    statusText: getStatusText(pkg.status),
                    // Formatar progresso
                    progressFormatted: Math.round(pkg.progress_percentage || 0),
                    // Calcular eficiência (pontos por aula)
                    efficiency: pkg.lessons_watched > 0 ? 
                        Math.round(pkg.points_earned / pkg.lessons_watched) : 0
                })),
                recentActivity: recentActivity.map(activity => ({
                    ...activity,
                    activityDateFormatted: formatDate(activity.activity_date),
                    activityIcon: getActivityIcon(activity.activity_type)
                })),
                goals: goals,
                monthlyStats: {
                    ...monthlyStats,
                    // Calcular velocidade formatada
                    learningVelocityFormatted: Math.round(monthlyStats.learning_velocity || 0),
                    // Calcular progresso médio formatado
                    averageProgressFormatted: Math.round(monthlyStats.average_progress || 0)
                },
                comparison: {
                    ...comparison,
                    // Determinar se está acima ou abaixo da média
                    packagesComparison: getComparisonText(comparison.packages_percentile),
                    progressComparison: getComparisonText(comparison.progress_percentile),
                    xpComparison: getComparisonText(comparison.xp_percentile)
                }
            };
            
            res.render('pages/progress', {
                title: 'Meu Progresso - CodePath',
                additionalCSS: 'progress',
                ...progressData
            });
            
        } catch (error) {
            console.error('Erro ao exibir página de progresso:', error);
            res.status(500).render('pages/error', {
                title: 'Erro interno',
                message: 'Ocorreu um erro ao carregar seus dados de progresso.'
            });
        }
    },
    
    /**
     * API para dados de gráfico de progresso
     */
    getProgressChartData: async (req, res) => {
        try {
            const userId = req.session.user.id;
            const days = parseInt(req.query.days) || 30;
            
            const chartData = await progressModel.getProgressChartData(userId, days);
            
            res.json({
                success: true,
                data: chartData.map(item => ({
                    date: item.date,
                    points: item.points,
                    cumulativePoints: item.cumulative_points,
                    // Formatar data para exibição
                    dateFormatted: formatDateForChart(item.date)
                }))
            });
            
        } catch (error) {
            console.error('Erro ao buscar dados do gráfico:', error);
            res.status(500).json({
                success: false,
                message: 'Erro ao carregar dados do gráfico'
            });
        }
    },
    
    /**
     * API para estatísticas de desempenho por período
     */
    getPerformanceStats: async (req, res) => {
        try {
            const userId = req.session.user.id;
            const period = req.params.period || 'month';
            
            const stats = await progressModel.getUserPerformanceStats(userId, period);
            
            res.json({
                success: true,
                data: {
                    ...stats,
                    period: period,
                    periodLabel: getPeriodLabel(period)
                }
            });
            
        } catch (error) {
            console.error('Erro ao buscar estatísticas de desempenho:', error);
            res.status(500).json({
                success: false,
                message: 'Erro ao carregar estatísticas'
            });
        }
    },
    
    /**
     * API para comparação detalhada
     */
    getDetailedComparison: async (req, res) => {
        try {
            const userId = req.session.user.id;
            
            const comparison = await progressModel.getUserComparison(userId);
            
            res.json({
                success: true,
                data: {
                    ...comparison,
                    insights: generateInsights(comparison)
                }
            });
            
        } catch (error) {
            console.error('Erro ao buscar comparação:', error);
            res.status(500).json({
                success: false,
                message: 'Erro ao carregar comparação'
            });
        }
    },
    
    /**
     * API para atualizar metas do usuário
     */
    updateUserGoals: async (req, res) => {
        try {
            const userId = req.session.user.id;
            const { goals } = req.body;
            
            // Por enquanto, apenas retornar sucesso
            // Em uma implementação futura, salvar metas personalizadas no banco
            
            res.json({
                success: true,
                message: 'Metas atualizadas com sucesso',
                data: goals
            });
            
        } catch (error) {
            console.error('Erro ao atualizar metas:', error);
            res.status(500).json({
                success: false,
                message: 'Erro ao atualizar metas'
            });
        }
    }
};

// ========================================
// FUNÇÕES AUXILIARES
// ========================================

/**
 * Formatar data para exibição
 */
function formatDate(dateString) {
    if (!dateString) return 'Nunca';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Hoje';
    if (diffDays === 2) return 'Ontem';
    if (diffDays <= 7) return `${diffDays} dias atrás`;
    if (diffDays <= 30) return `${Math.ceil(diffDays / 7)} semanas atrás`;
    
    return date.toLocaleDateString('pt-BR');
}

/**
 * Formatar data para gráfico
 */
function formatDateForChart(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: '2-digit' 
    });
}

/**
 * Obter classe CSS baseada no status
 */
function getStatusClass(status) {
    switch (status) {
        case 'completed': return 'success';
        case 'in_progress': return 'primary';
        case 'not_started': return 'secondary';
        default: return 'secondary';
    }
}

/**
 * Obter texto do status
 */
function getStatusText(status) {
    switch (status) {
        case 'completed': return 'Concluído';
        case 'in_progress': return 'Em Progresso';
        case 'not_started': return 'Não Iniciado';
        default: return 'Desconhecido';
    }
}

/**
 * Obter ícone da atividade
 */
function getActivityIcon(activityType) {
    switch (activityType) {
        case 'lesson': return 'fas fa-play-circle';
        case 'quiz': return 'fas fa-question-circle';
        case 'challenge': return 'fas fa-code';
        default: return 'fas fa-check-circle';
    }
}

/**
 * Obter texto de comparação
 */
function getComparisonText(percentile) {
    if (percentile >= 120) return 'Muito acima da média';
    if (percentile >= 110) return 'Acima da média';
    if (percentile >= 90) return 'Na média';
    if (percentile >= 70) return 'Ligeiramente abaixo';
    return 'Abaixo da média';
}

/**
 * Obter label do período
 */
function getPeriodLabel(period) {
    switch (period) {
        case 'week': return 'Última Semana';
        case 'month': return 'Último Mês';
        case 'year': return 'Último Ano';
        default: return 'Período';
    }
}

/**
 * Gerar insights baseados na comparação
 */
function generateInsights(comparison) {
    const insights = [];
    
    if (comparison.packages_percentile >= 120) {
        insights.push('Você está explorando mais tecnologias que a maioria dos usuários!');
    }
    
    if (comparison.progress_percentile >= 110) {
        insights.push('Seu progresso está acima da média da plataforma.');
    }
    
    if (comparison.xp_percentile >= 120) {
        insights.push('Você está entre os usuários mais ativos da plataforma!');
    }
    
    if (comparison.xp_percentile < 70) {
        insights.push('Que tal aumentar sua atividade para ganhar mais XP?');
    }
    
    return insights;
}

module.exports = progressController; 