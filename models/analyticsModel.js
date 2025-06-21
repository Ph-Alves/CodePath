const db = require('./database');

/**
 * Modelo de Analytics - Sistema de Análise Avançada
 * Fornece métricas detalhadas, relatórios e insights de aprendizado
 */
class AnalyticsModel {
    
    /**
     * Obtém métricas gerais da plataforma
     * @returns {Promise<Object>} Estatísticas gerais
     */
    static async getPlatformStats() {
        try {
            const stats = await db.get(`
                SELECT 
                    (SELECT COUNT(*) FROM users WHERE active = 1) as total_users,
                    (SELECT COUNT(*) FROM packages) as total_packages,
                    (SELECT COUNT(*) FROM lessons) as total_lessons,
                    (SELECT COUNT(*) FROM quizzes) as total_quizzes,
                    (SELECT COUNT(*) FROM user_progress WHERE completed_at IS NOT NULL) as total_completions,
                    (SELECT AVG(xp_points) FROM users WHERE active = 1) as avg_xp,
                    (SELECT COUNT(*) FROM achievements) as total_achievements,
                    (SELECT COUNT(*) FROM user_achievements) as total_earned_achievements
            `);

            // Calcular taxa de conclusão
            const completionRate = stats.total_lessons > 0 
                ? (stats.total_completions / (stats.total_users * stats.total_lessons) * 100).toFixed(2)
                : 0;

            return {
                ...stats,
                completion_rate: parseFloat(completionRate),
                engagement_score: this.calculateEngagementScore(stats)
            };
        } catch (error) {
            console.error('Erro ao obter estatísticas da plataforma:', error);
            throw error;
        }
    }

    /**
     * Obtém métricas detalhadas de um usuário específico
     * @param {number} userId - ID do usuário
     * @returns {Promise<Object>} Métricas do usuário
     */
    static async getUserAnalytics(userId) {
        try {
            // Estatísticas básicas do usuário
            const userStats = await db.get(`
                SELECT 
                    u.username,
                    u.email,
                    u.xp_points,
                    u.level,
                    u.created_at,
                    u.last_login,
                    (SELECT COUNT(*) FROM user_progress WHERE user_id = ? AND completed_at IS NOT NULL) as lessons_completed,
                    (SELECT COUNT(*) FROM user_quiz_attempts WHERE user_id = ?) as quizzes_attempted,
                    (SELECT COUNT(*) FROM user_achievements WHERE user_id = ?) as achievements_earned,
                    (SELECT AVG(score) FROM user_quiz_attempts WHERE user_id = ?) as avg_quiz_score
                FROM users u
                WHERE u.id = ?
            `, [userId, userId, userId, userId, userId]);

            if (!userStats) {
                throw new Error('Usuário não encontrado');
            }

            // Progresso por pacote
            const packageProgress = await db.all(`
                SELECT 
                    p.id,
                    p.name,
                    p.description,
                    COUNT(l.id) as total_lessons,
                    COUNT(CASE WHEN up.completed_at IS NOT NULL THEN 1 END) as completed_lessons,
                    ROUND(
                        (COUNT(CASE WHEN up.completed_at IS NOT NULL THEN 1 END) * 100.0 / COUNT(l.id)), 2
                    ) as completion_percentage
                FROM packages p
                LEFT JOIN lessons l ON p.id = l.package_id
                LEFT JOIN user_progress up ON l.id = up.lesson_id AND up.user_id = ?
                GROUP BY p.id, p.name, p.description
                ORDER BY completion_percentage DESC
            `, [userId]);

            // Atividade recente (últimos 30 dias)
            const recentActivity = await db.all(`
                SELECT 
                    DATE(completed_at) as date,
                    COUNT(*) as lessons_completed
                FROM user_progress 
                WHERE user_id = ? 
                    AND completed_at IS NOT NULL 
                    AND completed_at >= datetime('now', '-30 days')
                GROUP BY DATE(completed_at)
                ORDER BY date DESC
            `, [userId]);

            // Tempo médio de estudo
            const studyTime = await this.calculateStudyTime(userId);

            // Streak atual
            const currentStreak = await this.calculateCurrentStreak(userId);

            return {
                user: userStats,
                package_progress: packageProgress,
                recent_activity: recentActivity,
                study_time: studyTime,
                current_streak: currentStreak,
                performance_metrics: await this.calculatePerformanceMetrics(userId)
            };
        } catch (error) {
            console.error('Erro ao obter analytics do usuário:', error);
            throw error;
        }
    }

    /**
     * Gera relatório de aprendizado detalhado
     * @param {number} userId - ID do usuário
     * @param {string} period - Período ('week', 'month', 'quarter', 'year')
     * @returns {Promise<Object>} Relatório detalhado
     */
    static async generateLearningReport(userId, period = 'month') {
        try {
            const periodMap = {
                'week': '-7 days',
                'month': '-30 days',
                'quarter': '-90 days',
                'year': '-365 days'
            };

            const dateFilter = periodMap[period] || '-30 days';

            // Progresso no período
            const progressData = await db.all(`
                SELECT 
                    DATE(up.completed_at) as date,
                    COUNT(*) as lessons_completed,
                    SUM(CASE WHEN l.xp_reward IS NOT NULL THEN l.xp_reward ELSE 50 END) as xp_earned,
                    GROUP_CONCAT(l.name) as lessons_list
                FROM user_progress up
                JOIN lessons l ON up.lesson_id = l.id
                WHERE up.user_id = ? 
                    AND up.completed_at IS NOT NULL
                    AND up.completed_at >= datetime('now', ?)
                GROUP BY DATE(up.completed_at)
                ORDER BY date DESC
            `, [userId, dateFilter]);

            // Desempenho em quizzes
            const quizPerformance = await db.all(`
                SELECT 
                    q.title,
                    uqa.score,
                    uqa.completed_at,
                    uqa.time_taken,
                    p.name as package_name
                FROM user_quiz_attempts uqa
                JOIN quizzes q ON uqa.quiz_id = q.id
                JOIN lessons l ON q.lesson_id = l.id
                JOIN packages p ON l.package_id = p.id
                WHERE uqa.user_id = ?
                    AND uqa.completed_at >= datetime('now', ?)
                ORDER BY uqa.completed_at DESC
            `, [userId, dateFilter]);

            // Conquistas obtidas
            const achievements = await db.all(`
                SELECT 
                    a.name,
                    a.description,
                    a.icon,
                    ua.earned_at
                FROM user_achievements ua
                JOIN achievements a ON ua.achievement_id = a.id
                WHERE ua.user_id = ?
                    AND ua.earned_at >= datetime('now', ?)
                ORDER BY ua.earned_at DESC
            `, [userId, dateFilter]);

            // Análise de consistência
            const consistencyAnalysis = await this.analyzeConsistency(userId, dateFilter);

            // Recomendações personalizadas
            const recommendations = await this.generateRecommendations(userId);

            return {
                period: period,
                summary: {
                    total_lessons: progressData.reduce((sum, day) => sum + day.lessons_completed, 0),
                    total_xp: progressData.reduce((sum, day) => sum + day.xp_earned, 0),
                    quiz_average: quizPerformance.length > 0 
                        ? (quizPerformance.reduce((sum, quiz) => sum + quiz.score, 0) / quizPerformance.length).toFixed(2)
                        : 0,
                    achievements_earned: achievements.length
                },
                daily_progress: progressData,
                quiz_performance: quizPerformance,
                achievements: achievements,
                consistency: consistencyAnalysis,
                recommendations: recommendations
            };
        } catch (error) {
            console.error('Erro ao gerar relatório de aprendizado:', error);
            throw error;
        }
    }

    /**
     * Obtém ranking de usuários
     * @param {string} metric - Métrica para ranking ('xp', 'lessons', 'streak')
     * @param {number} limit - Limite de resultados
     * @returns {Promise<Array>} Lista de usuários ranqueados
     */
    static async getUserRanking(metric = 'xp', limit = 10) {
        try {
            let query = '';
            
            switch (metric) {
                case 'xp':
                    query = `
                        SELECT 
                            u.id,
                            u.username,
                            u.xp_points as value,
                            u.level,
                            'XP' as metric_type
                        FROM users u
                        WHERE u.active = 1
                        ORDER BY u.xp_points DESC
                        LIMIT ?
                    `;
                    break;
                    
                case 'lessons':
                    query = `
                        SELECT 
                            u.id,
                            u.username,
                            COUNT(up.id) as value,
                            u.level,
                            'Aulas' as metric_type
                        FROM users u
                        LEFT JOIN user_progress up ON u.id = up.user_id AND up.completed_at IS NOT NULL
                        WHERE u.active = 1
                        GROUP BY u.id, u.username, u.level
                        ORDER BY COUNT(up.id) DESC
                        LIMIT ?
                    `;
                    break;
                    
                case 'achievements':
                    query = `
                        SELECT 
                            u.id,
                            u.username,
                            COUNT(ua.id) as value,
                            u.level,
                            'Conquistas' as metric_type
                        FROM users u
                        LEFT JOIN user_achievements ua ON u.id = ua.user_id
                        WHERE u.active = 1
                        GROUP BY u.id, u.username, u.level
                        ORDER BY COUNT(ua.id) DESC
                        LIMIT ?
                    `;
                    break;
                    
                default:
                    throw new Error('Métrica de ranking inválida');
            }

            return await db.all(query, [limit]);
        } catch (error) {
            console.error('Erro ao obter ranking:', error);
            throw error;
        }
    }

    /**
     * Obtém métricas de engajamento da plataforma
     * @param {string} period - Período de análise
     * @returns {Promise<Object>} Métricas de engajamento
     */
    static async getEngagementMetrics(period = 'month') {
        try {
            const dateFilter = period === 'week' ? '-7 days' : '-30 days';

            // Usuários ativos
            const activeUsers = await db.get(`
                SELECT 
                    COUNT(DISTINCT user_id) as active_users
                FROM user_progress
                WHERE completed_at >= datetime('now', ?)
            `, [dateFilter]);

            // Taxa de retenção
            const retentionRate = await db.get(`
                SELECT 
                    COUNT(DISTINCT u1.user_id) * 100.0 / COUNT(DISTINCT u2.user_id) as retention_rate
                FROM (
                    SELECT DISTINCT user_id 
                    FROM user_progress 
                    WHERE completed_at >= datetime('now', '-60 days')
                    AND completed_at < datetime('now', '-30 days')
                ) u1
                CROSS JOIN (
                    SELECT DISTINCT user_id 
                    FROM user_progress 
                    WHERE completed_at >= datetime('now', '-30 days')
                ) u2
            `);

            // Tempo médio de sessão
            const avgSessionTime = await db.get(`
                SELECT 
                    AVG(
                        CASE 
                            WHEN time_taken IS NOT NULL THEN time_taken
                            ELSE 300 -- 5 minutos padrão
                        END
                    ) as avg_session_time
                FROM user_quiz_attempts
                WHERE completed_at >= datetime('now', ?)
            `, [dateFilter]);

            // Conteúdo mais popular
            const popularContent = await db.all(`
                SELECT 
                    l.name,
                    p.name as package_name,
                    COUNT(up.id) as completions
                FROM lessons l
                JOIN packages p ON l.package_id = p.id
                JOIN user_progress up ON l.id = up.lesson_id
                WHERE up.completed_at >= datetime('now', ?)
                GROUP BY l.id, l.name, p.name
                ORDER BY completions DESC
                LIMIT 5
            `, [dateFilter]);

            return {
                active_users: activeUsers.active_users || 0,
                retention_rate: parseFloat((retentionRate.retention_rate || 0).toFixed(2)),
                avg_session_time: Math.round(avgSessionTime.avg_session_time || 0),
                popular_content: popularContent
            };
        } catch (error) {
            console.error('Erro ao obter métricas de engajamento:', error);
            throw error;
        }
    }

    // Métodos auxiliares privados

    /**
     * Calcula pontuação de engajamento da plataforma
     * @param {Object} stats - Estatísticas básicas
     * @returns {number} Pontuação de engajamento (0-100)
     */
    static calculateEngagementScore(stats) {
        try {
            const factors = {
                completion_rate: parseFloat(stats.completion_rate || 0) * 0.3,
                avg_xp: Math.min((stats.avg_xp || 0) / 1000 * 100, 100) * 0.2,
                achievement_rate: (stats.total_earned_achievements / (stats.total_users * stats.total_achievements) * 100) * 0.3,
                user_activity: Math.min(stats.total_users / 100 * 100, 100) * 0.2
            };

            return Math.round(Object.values(factors).reduce((sum, factor) => sum + factor, 0));
        } catch (error) {
            return 0;
        }
    }

    /**
     * Calcula tempo de estudo de um usuário
     * @param {number} userId - ID do usuário
     * @returns {Promise<Object>} Dados de tempo de estudo
     */
    static async calculateStudyTime(userId) {
        try {
            const result = await db.get(`
                SELECT 
                    COUNT(DISTINCT DATE(completed_at)) as study_days,
                    COUNT(*) as total_sessions,
                    AVG(
                        CASE 
                            WHEN uqa.time_taken IS NOT NULL THEN uqa.time_taken
                            ELSE 300 -- 5 minutos padrão por aula
                        END
                    ) as avg_session_duration
                FROM user_progress up
                LEFT JOIN user_quiz_attempts uqa ON up.user_id = uqa.user_id
                WHERE up.user_id = ? AND up.completed_at IS NOT NULL
            `, [userId]);

            return {
                study_days: result.study_days || 0,
                total_sessions: result.total_sessions || 0,
                avg_session_duration: Math.round(result.avg_session_duration || 0),
                total_study_time: Math.round((result.avg_session_duration || 0) * (result.total_sessions || 0) / 60) // em minutos
            };
        } catch (error) {
            console.error('Erro ao calcular tempo de estudo:', error);
            return { study_days: 0, total_sessions: 0, avg_session_duration: 0, total_study_time: 0 };
        }
    }

    /**
     * Calcula streak atual do usuário
     * @param {number} userId - ID do usuário
     * @returns {Promise<number>} Dias de streak atual
     */
    static async calculateCurrentStreak(userId) {
        try {
            const activities = await db.all(`
                SELECT DISTINCT DATE(completed_at) as activity_date
                FROM user_progress
                WHERE user_id = ? AND completed_at IS NOT NULL
                ORDER BY activity_date DESC
                LIMIT 30
            `, [userId]);

            if (activities.length === 0) return 0;

            let streak = 0;
            let currentDate = new Date();
            currentDate.setHours(0, 0, 0, 0);

            for (let activity of activities) {
                const activityDate = new Date(activity.activity_date);
                const diffDays = Math.floor((currentDate - activityDate) / (1000 * 60 * 60 * 24));

                if (diffDays === streak) {
                    streak++;
                } else {
                    break;
                }
            }

            return streak;
        } catch (error) {
            console.error('Erro ao calcular streak:', error);
            return 0;
        }
    }

    /**
     * Calcula métricas de performance do usuário
     * @param {number} userId - ID do usuário
     * @returns {Promise<Object>} Métricas de performance
     */
    static async calculatePerformanceMetrics(userId) {
        try {
            const metrics = await db.get(`
                SELECT 
                    AVG(score) as avg_quiz_score,
                    COUNT(CASE WHEN score >= 80 THEN 1 END) * 100.0 / COUNT(*) as high_score_rate,
                    MIN(score) as lowest_score,
                    MAX(score) as highest_score,
                    AVG(time_taken) as avg_completion_time
                FROM user_quiz_attempts
                WHERE user_id = ?
            `, [userId]);

            return {
                avg_quiz_score: parseFloat((metrics.avg_quiz_score || 0).toFixed(2)),
                high_score_rate: parseFloat((metrics.high_score_rate || 0).toFixed(2)),
                lowest_score: metrics.lowest_score || 0,
                highest_score: metrics.highest_score || 0,
                avg_completion_time: Math.round(metrics.avg_completion_time || 0),
                performance_trend: await this.calculatePerformanceTrend(userId)
            };
        } catch (error) {
            console.error('Erro ao calcular métricas de performance:', error);
            return {
                avg_quiz_score: 0,
                high_score_rate: 0,
                lowest_score: 0,
                highest_score: 0,
                avg_completion_time: 0,
                performance_trend: 'stable'
            };
        }
    }

    /**
     * Analisa consistência de estudo do usuário
     * @param {number} userId - ID do usuário
     * @param {string} dateFilter - Filtro de data
     * @returns {Promise<Object>} Análise de consistência
     */
    static async analyzeConsistency(userId, dateFilter) {
        try {
            const dailyActivity = await db.all(`
                SELECT 
                    DATE(completed_at) as date,
                    COUNT(*) as activities
                FROM user_progress
                WHERE user_id = ? 
                    AND completed_at >= datetime('now', ?)
                GROUP BY DATE(completed_at)
                ORDER BY date
            `, [userId, dateFilter]);

            if (dailyActivity.length === 0) {
                return {
                    consistency_score: 0,
                    study_pattern: 'irregular',
                    most_active_day: null,
                    recommendation: 'Tente estabelecer uma rotina diária de estudos'
                };
            }

            const totalDays = dailyActivity.length;
            const avgActivitiesPerDay = dailyActivity.reduce((sum, day) => sum + day.activities, 0) / totalDays;
            const consistencyScore = Math.min(totalDays / 30 * 100, 100); // Baseado em 30 dias

            // Identificar padrão de estudo
            const studyPattern = consistencyScore >= 70 ? 'consistent' : 
                                consistencyScore >= 40 ? 'moderate' : 'irregular';

            // Dia mais ativo
            const mostActiveDay = dailyActivity.reduce((max, day) => 
                day.activities > max.activities ? day : max
            );

            return {
                consistency_score: Math.round(consistencyScore),
                study_pattern: studyPattern,
                avg_activities_per_day: Math.round(avgActivitiesPerDay * 10) / 10,
                most_active_day: mostActiveDay,
                total_study_days: totalDays
            };
        } catch (error) {
            console.error('Erro ao analisar consistência:', error);
            return {
                consistency_score: 0,
                study_pattern: 'irregular',
                avg_activities_per_day: 0,
                most_active_day: null,
                total_study_days: 0
            };
        }
    }

    /**
     * Gera recomendações personalizadas para o usuário
     * @param {number} userId - ID do usuário
     * @returns {Promise<Array>} Lista de recomendações
     */
    static async generateRecommendations(userId) {
        try {
            const recommendations = [];
            
            // Analisar progresso do usuário
            const userProgress = await db.get(`
                SELECT 
                    COUNT(CASE WHEN up.completed_at IS NOT NULL THEN 1 END) as completed_lessons,
                    COUNT(l.id) as total_lessons,
                    AVG(CASE WHEN uqa.score IS NOT NULL THEN uqa.score ELSE 0 END) as avg_score
                FROM lessons l
                LEFT JOIN user_progress up ON l.id = up.lesson_id AND up.user_id = ?
                LEFT JOIN user_quiz_attempts uqa ON up.user_id = uqa.user_id
            `, [userId]);

            const completionRate = userProgress.total_lessons > 0 
                ? (userProgress.completed_lessons / userProgress.total_lessons) * 100 
                : 0;

            // Recomendações baseadas na taxa de conclusão
            if (completionRate < 25) {
                recommendations.push({
                    type: 'motivation',
                    title: 'Continue Aprendendo!',
                    description: 'Você está no início da jornada. Tente completar pelo menos uma aula por dia.',
                    priority: 'high'
                });
            } else if (completionRate < 50) {
                recommendations.push({
                    type: 'consistency',
                    title: 'Mantenha o Ritmo',
                    description: 'Você está progredindo bem! Tente manter uma rotina consistente de estudos.',
                    priority: 'medium'
                });
            } else if (completionRate < 75) {
                recommendations.push({
                    type: 'challenge',
                    title: 'Desafie-se Mais',
                    description: 'Que tal tentar os quizzes mais difíceis ou explorar tópicos avançados?',
                    priority: 'medium'
                });
            } else {
                recommendations.push({
                    type: 'mastery',
                    title: 'Você é um Expert!',
                    description: 'Parabéns pelo progresso! Considere ajudar outros usuários ou revisar conceitos.',
                    priority: 'low'
                });
            }

            // Recomendações baseadas na performance em quizzes
            if (userProgress.avg_score < 60) {
                recommendations.push({
                    type: 'study',
                    title: 'Revise os Conceitos',
                    description: 'Sua média em quizzes pode melhorar. Tente revisar as aulas antes dos testes.',
                    priority: 'high'
                });
            } else if (userProgress.avg_score >= 90) {
                recommendations.push({
                    type: 'achievement',
                    title: 'Performance Excelente!',
                    description: 'Você está dominando o conteúdo. Continue assim!',
                    priority: 'low'
                });
            }

            // Recomendação de streak
            const currentStreak = await this.calculateCurrentStreak(userId);
            if (currentStreak === 0) {
                recommendations.push({
                    type: 'habit',
                    title: 'Crie uma Rotina',
                    description: 'Tente estudar pelo menos 15 minutos por dia para criar um hábito.',
                    priority: 'high'
                });
            } else if (currentStreak >= 7) {
                recommendations.push({
                    type: 'celebration',
                    title: 'Streak Incrível!',
                    description: `Você está em uma sequência de ${currentStreak} dias! Continue assim!`,
                    priority: 'low'
                });
            }

            return recommendations;
        } catch (error) {
            console.error('Erro ao gerar recomendações:', error);
            return [];
        }
    }

    /**
     * Calcula tendência de performance do usuário
     * @param {number} userId - ID do usuário
     * @returns {Promise<string>} Tendência ('improving', 'stable', 'declining')
     */
    static async calculatePerformanceTrend(userId) {
        try {
            const recentScores = await db.all(`
                SELECT score, completed_at
                FROM user_quiz_attempts
                WHERE user_id = ?
                ORDER BY completed_at DESC
                LIMIT 10
            `, [userId]);

            if (recentScores.length < 3) return 'stable';

            const firstHalf = recentScores.slice(0, Math.floor(recentScores.length / 2));
            const secondHalf = recentScores.slice(Math.floor(recentScores.length / 2));

            const firstHalfAvg = firstHalf.reduce((sum, quiz) => sum + quiz.score, 0) / firstHalf.length;
            const secondHalfAvg = secondHalf.reduce((sum, quiz) => sum + quiz.score, 0) / secondHalf.length;

            const difference = firstHalfAvg - secondHalfAvg;

            if (difference > 5) return 'improving';
            if (difference < -5) return 'declining';
            return 'stable';
        } catch (error) {
            console.error('Erro ao calcular tendência de performance:', error);
            return 'stable';
        }
    }
}

module.exports = AnalyticsModel; 