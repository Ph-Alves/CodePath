const AchievementModel = require('../models/achievementModel');

/**
 * Controlador de Conquistas e Streak
 * Gerencia todas as operações relacionadas ao sistema de gamificação
 */
class AchievementController {
    
    /**
     * Exibe a página de conquistas do usuário
     */
    static async showAchievementsPage(req, res) {
        try {
            console.log('[ACHIEVEMENT] Carregando página de conquistas...');
            console.log('[ACHIEVEMENT] ID do usuário:', req.session.userId);
            
            const userId = req.session.userId;
            
            // Busca conquistas do usuário
            const userAchievements = AchievementModel.getUserAchievements(userId);
            console.log('[ACHIEVEMENT] Conquistas encontradas:', userAchievements.length);
            
            // Busca estatísticas de conquistas
            const achievementStats = await AchievementModel.getUserAchievementStats(userId);
            console.log('[ACHIEVEMENT] Estatísticas:', achievementStats);
            
            // Busca conquistas recentes
            const recentAchievements = AchievementModel.getRecentAchievements(userId, 3);
            console.log('[ACHIEVEMENT] Conquistas recentes:', recentAchievements.length);
            
            // Busca estatísticas do usuário para streak
            const userStats = AchievementModel.getUserStats(userId);
            console.log('[ACHIEVEMENT] Stats do usuário:', userStats);
            
            // Organiza conquistas por categoria
            const achievementsByCategory = {};
            userAchievements.forEach(achievement => {
                if (!achievementsByCategory[achievement.category]) {
                    achievementsByCategory[achievement.category] = [];
                }
                achievementsByCategory[achievement.category].push(achievement);
            });
            
            // Dados para a view
            const viewData = {
                title: 'Conquistas - CodePath',
                user: req.session.user,
                achievements: userAchievements,
                achievementsByCategory,
                achievementStats,
                recentAchievements,
                userStats,
                categories: [
                    { key: 'beginner', name: 'Iniciante', icon: '🌱' },
                    { key: 'progress', name: 'Progresso', icon: '📈' },
                    { key: 'mastery', name: 'Maestria', icon: '🎯' },
                    { key: 'social', name: 'Social', icon: '👥' },
                    { key: 'streak', name: 'Consistência', icon: '🔥' },
                    { key: 'special', name: 'Especiais', icon: '⭐' }
                ]
            };
            
            console.log('[ACHIEVEMENT] Renderizando página com', Object.keys(achievementsByCategory).length, 'categorias');
            res.render('pages/achievements', viewData);
            
        } catch (error) {
            console.error('[ACHIEVEMENT] Erro ao carregar página de conquistas:', error);
            res.status(500).render('pages/error', {
                title: 'Erro - CodePath',
                error: 'Erro interno do servidor',
                message: 'Não foi possível carregar as conquistas.'
            });
        }
    }
    
    /**
     * API: Obtém conquistas do usuário
     */
    static async getUserAchievementsAPI(req, res) {
        try {
            const userId = req.session.userId;
            const achievements = AchievementModel.getUserAchievements(userId);
            const stats = AchievementModel.getUserAchievementStats(userId);
            
            res.json({
                success: true,
                data: {
                    achievements,
                    stats
                }
            });
            
        } catch (error) {
            console.error('[ACHIEVEMENT] Erro na API de conquistas:', error);
            res.status(500).json({
                success: false,
                error: 'Erro ao buscar conquistas'
            });
        }
    }
    
    /**
     * API: Verifica e desbloqueia novas conquistas
     */
    static async checkAchievementsAPI(req, res) {
        try {
            const userId = req.session.userId;
            console.log('[ACHIEVEMENT] Verificando conquistas para usuário:', userId);
            
            // Verifica e desbloqueia novas conquistas
            const newAchievements = await AchievementModel.checkAndUnlockAchievements(userId);
            console.log('[ACHIEVEMENT] Novas conquistas desbloqueadas:', newAchievements.length);
            
            res.json({
                success: true,
                data: {
                    newAchievements,
                    count: newAchievements.length
                }
            });
            
        } catch (error) {
            console.error('[ACHIEVEMENT] Erro ao verificar conquistas:', error);
            res.status(500).json({
                success: false,
                error: 'Erro ao verificar conquistas'
            });
        }
    }
    
    /**
     * API: Atualiza streak do usuário
     */
    static async updateStreakAPI(req, res) {
        try {
            const userId = req.session.userId;
            console.log('[ACHIEVEMENT] Atualizando streak para usuário:', userId);
            
            // Atualiza o streak
            const streakResult = AchievementModel.updateUserStreak(userId);
            console.log('[ACHIEVEMENT] Resultado do streak:', streakResult);
            
            // Verifica se desbloqueou conquistas de streak
            const newAchievements = await AchievementModel.checkAndUnlockAchievements(userId);
            
            res.json({
                success: true,
                data: {
                    streak: streakResult.streak,
                    longestStreak: streakResult.longestStreak,
                    isNewDay: streakResult.isNewDay,
                    newAchievements
                }
            });
            
        } catch (error) {
            console.error('[ACHIEVEMENT] Erro ao atualizar streak:', error);
            res.status(500).json({
                success: false,
                error: 'Erro ao atualizar streak'
            });
        }
    }
    
    /**
     * API: Obtém estatísticas de conquistas
     */
    static async getAchievementStatsAPI(req, res) {
        try {
            const userId = req.session.userId;
            
            const stats = AchievementModel.getUserAchievementStats(userId);
            const userStats = AchievementModel.getUserStats(userId);
            const recentAchievements = AchievementModel.getRecentAchievements(userId, 5);
            
            res.json({
                success: true,
                data: {
                    achievementStats: stats,
                    userStats,
                    recentAchievements
                }
            });
            
        } catch (error) {
            console.error('[ACHIEVEMENT] Erro ao buscar estatísticas:', error);
            res.status(500).json({
                success: false,
                error: 'Erro ao buscar estatísticas'
            });
        }
    }
    
    /**
     * API: Obtém progresso de uma conquista específica
     */
    static async getAchievementProgressAPI(req, res) {
        try {
            const userId = req.session.userId;
            const achievementId = parseInt(req.params.id);
            
            // Busca a conquista
            const achievement = AchievementModel.getAllAchievements()
                .find(a => a.id === achievementId);
            
            if (!achievement) {
                return res.status(404).json({
                    success: false,
                    error: 'Conquista não encontrada'
                });
            }
            
            // Busca estatísticas do usuário
            const userStats = AchievementModel.getUserStats(userId);
            
            // Calcula progresso
            let currentValue = 0;
            let progressPercentage = 0;
            
            switch (achievement.requirement_type) {
                case 'lessons_completed':
                    currentValue = userStats.lessons_completed;
                    break;
                case 'quizzes_completed':
                    currentValue = userStats.quizzes_completed;
                    break;
                case 'packages_completed':
                    currentValue = userStats.packages_completed;
                    break;
                case 'streak_days':
                    currentValue = userStats.current_streak;
                    break;
                case 'total_xp':
                    currentValue = userStats.total_xp;
                    break;
                case 'perfect_quizzes':
                    currentValue = userStats.perfect_quizzes;
                    break;
                case 'study_hours':
                    currentValue = userStats.study_hours;
                    break;
            }
            
            progressPercentage = Math.min(100, Math.round((currentValue / achievement.requirement_value) * 100));
            
            res.json({
                success: true,
                data: {
                    achievement,
                    currentValue,
                    targetValue: achievement.requirement_value,
                    progressPercentage,
                    isCompleted: currentValue >= achievement.requirement_value
                }
            });
            
        } catch (error) {
            console.error('[ACHIEVEMENT] Erro ao buscar progresso da conquista:', error);
            res.status(500).json({
                success: false,
                error: 'Erro ao buscar progresso'
            });
        }
    }
}

module.exports = AchievementController; 