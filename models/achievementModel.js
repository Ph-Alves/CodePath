const { database } = require('./database');

/**
 * Modelo de Conquistas e Streak
 * Gerencia o sistema de gamificação avançada
 */
class AchievementModel {
    
    /**
     * Obtém todas as conquistas disponíveis no sistema
     */
    static async getAllAchievements() {
        const query = `
            SELECT 
                id,
                name,
                description,
                icon,
                category,
                requirement_type,
                requirement_value,
                xp_reward,
                created_at
            FROM achievements 
            ORDER BY category, requirement_value ASC
        `;
        
        return await database.all(query);
    }
    
    /**
     * Obtém conquistas do usuário com status de desbloqueio
     */
    static async getUserAchievements(userId) {
        const query = `
            SELECT 
                a.id,
                a.name,
                a.description,
                a.icon,
                a.category,
                a.requirement_type,
                a.requirement_value,
                a.xp_reward,
                ua.unlocked_at,
                ua.id as user_achievement_id,
                CASE 
                    WHEN ua.id IS NOT NULL THEN 1 
                    ELSE 0 
                END as is_unlocked
            FROM achievements a
            LEFT JOIN user_achievements ua ON a.id = ua.achievement_id AND ua.user_id = ?
            ORDER BY 
                is_unlocked DESC,
                a.category,
                a.requirement_value ASC
        `;
        
        return await database.all(query, [userId]);
    }
    
    /**
     * Verifica e desbloqueia conquistas para um usuário
     */
    static async checkAndUnlockAchievements(userId) {
        const newAchievements = [];
        
        // Busca estatísticas do usuário
        const userStats = this.getUserStats(userId);
        
        // Busca conquistas ainda não desbloqueadas
        const lockedAchievements = database.prepare(`
            SELECT a.* 
            FROM achievements a
            LEFT JOIN user_achievements ua ON a.id = ua.achievement_id AND ua.user_id = ?
            WHERE ua.id IS NULL
        `).all(userId);
        
        // Verifica cada conquista
        for (const achievement of lockedAchievements) {
            if (this.checkAchievementRequirement(achievement, userStats)) {
                // Desbloqueia a conquista
                const unlockResult = this.unlockAchievement(userId, achievement.id);
                if (unlockResult) {
                    newAchievements.push({
                        ...achievement,
                        unlocked_at: new Date().toISOString()
                    });
                }
            }
        }
        
        return newAchievements;
    }
    
    /**
     * Verifica se um usuário atende aos requisitos de uma conquista
     */
    static checkAchievementRequirement(achievement, userStats) {
        const { requirement_type, requirement_value } = achievement;
        
        switch (requirement_type) {
            case 'lessons_completed':
                return userStats.lessons_completed >= requirement_value;
                
            case 'quizzes_completed':
                return userStats.quizzes_completed >= requirement_value;
                
            case 'packages_completed':
                return userStats.packages_completed >= requirement_value;
                
            case 'streak_days':
                return userStats.current_streak >= requirement_value;
                
            case 'total_xp':
                return userStats.total_xp >= requirement_value;
                
            case 'perfect_quizzes':
                return userStats.perfect_quizzes >= requirement_value;
                
            case 'study_hours':
                return userStats.study_hours >= requirement_value;
                
            default:
                return false;
        }
    }
    
    /**
     * Desbloqueia uma conquista para um usuário
     */
    static unlockAchievement(userId, achievementId) {
        try {
            const query = `
                INSERT INTO user_achievements (user_id, achievement_id, unlocked_at)
                VALUES (?, ?, datetime('now'))
            `;
            
            const result = database.prepare(query).run(userId, achievementId);
            
            // Adiciona XP da conquista
            if (result.changes > 0) {
                const achievement = database.prepare('SELECT xp_reward FROM achievements WHERE id = ?').get(achievementId);
                if (achievement && achievement.xp_reward > 0) {
                    this.addXPToUser(userId, achievement.xp_reward);
                }
            }
            
            return result.changes > 0;
        } catch (error) {
            console.error('[ACHIEVEMENT] Erro ao desbloquear conquista:', error);
            return false;
        }
    }
    
    /**
     * Obtém estatísticas do usuário para verificar conquistas
     */
    static getUserStats(userId) {
        // Estatísticas básicas do usuário
        const basicStats = database.get(`
            SELECT total_xp, current_streak, longest_streak, last_login_date 
            FROM users u 
            WHERE u.id = ?
        `, [userId]) || {};
        
        // Aulas completadas
        const lessonsResult = database.get(`
            SELECT COUNT(*) as count 
            FROM user_progress 
            WHERE user_id = ? AND completed_at IS NOT NULL
        `, [userId]);
        const lessonsCompleted = lessonsResult?.count || 0;
        
        // Quizzes completados
        const quizzesResult = database.all(`
            SELECT DISTINCT quiz_id
            FROM user_quiz_answers 
            WHERE user_id = ?
        `, [userId]);
        const quizzesCompleted = quizzesResult?.length || 0;
        
        // Quizzes perfeitos (100% de acerto)
        const perfectQuizzesResult = database.get(`
            SELECT COUNT(*) as count
            FROM (
                SELECT quiz_id, 
                       AVG(CASE WHEN is_correct = 1 THEN 1.0 ELSE 0.0 END) as avg_score
                FROM user_quiz_answers 
                WHERE user_id = ?
                GROUP BY quiz_id
                HAVING avg_score = 1.0
            )
        `, [userId]);
        const perfectQuizzes = perfectQuizzesResult?.count || 0;
        
        // Pacotes completados
        const packagesResult = database.get(`
            SELECT COUNT(DISTINCT p.id) as count
            FROM packages p
            JOIN lessons l ON p.id = l.package_id
            LEFT JOIN user_progress up ON l.id = up.lesson_id AND up.user_id = ?
            GROUP BY p.id
            HAVING COUNT(l.id) = COUNT(up.lesson_id)
        `, [userId]);
        const packagesCompleted = packagesResult?.count || 0;
        
        // Horas de estudo (estimativa baseada em aulas assistidas)
        const studyHours = Math.floor(lessonsCompleted * 0.5); // 30 min por aula
        
        return {
            total_xp: basicStats.total_xp || 0,
            current_streak: basicStats.current_streak || 0,
            longest_streak: basicStats.longest_streak || 0,
            lessons_completed: lessonsCompleted,
            quizzes_completed: quizzesCompleted,
            perfect_quizzes: perfectQuizzes,
            packages_completed: packagesCompleted,
            study_hours: studyHours,
            last_login_date: basicStats.last_login_date
        };
    }
    
    /**
     * Atualiza o streak do usuário
     */
    static updateUserStreak(userId) {
        const user = database.get(`
            SELECT current_streak, longest_streak, last_login_date 
            FROM users 
            WHERE id = ?
        `, [userId]);
        
        if (!user) return false;
        
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        const lastLogin = user.last_login_date ? user.last_login_date.split('T')[0] : null;
        
        let newStreak = user.current_streak || 0;
        let newLongestStreak = user.longest_streak || 0;
        
        if (lastLogin === today) {
            // Já fez login hoje, não altera streak
            return { streak: newStreak, isNewDay: false };
        }
        
        if (lastLogin) {
            const lastLoginDate = new Date(lastLogin);
            const todayDate = new Date(today);
            const diffTime = todayDate - lastLoginDate;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays === 1) {
                // Login consecutivo
                newStreak += 1;
            } else if (diffDays > 1) {
                // Quebrou o streak
                newStreak = 1;
            }
        } else {
            // Primeiro login
            newStreak = 1;
        }
        
        // Atualiza o maior streak se necessário
        if (newStreak > newLongestStreak) {
            newLongestStreak = newStreak;
        }
        
        // Atualiza no banco
        database.run(`
            UPDATE users 
            SET current_streak = ?, 
                longest_streak = ?, 
                last_login_date = datetime('now')
            WHERE id = ?
        `, [newStreak, newLongestStreak, userId]);
        
        return { 
            streak: newStreak, 
            longestStreak: newLongestStreak, 
            isNewDay: true 
        };
    }
    
    /**
     * Adiciona XP ao usuário
     */
    static addXPToUser(userId, xpAmount) {
        try {
            database.run(`
                UPDATE users 
                SET total_xp = total_xp + ? 
                WHERE id = ?
            `, [xpAmount, userId]);
            
            return true;
        } catch (error) {
            console.error('[ACHIEVEMENT] Erro ao adicionar XP:', error);
            return false;
        }
    }
    
    /**
     * Obtém conquistas recentes do usuário
     */
    static getRecentAchievements(userId, limit = 5) {
        const query = `
            SELECT 
                a.name,
                a.description,
                a.icon,
                a.category,
                a.xp_reward,
                ua.unlocked_at
            FROM user_achievements ua
            JOIN achievements a ON ua.achievement_id = a.id
            WHERE ua.user_id = ?
            ORDER BY ua.unlocked_at DESC
            LIMIT ?
        `;
        
        return database.all(query, [userId, limit]);
    }
    
    /**
     * Obtém estatísticas de conquistas do usuário
     */
    static async getUserAchievementStats(userId) {
        try {
            const totalAchievements = await database.get('SELECT COUNT(*) as count FROM achievements');
            const unlockedAchievements = await database.get(`
                SELECT COUNT(*) as count 
                FROM user_achievements 
                WHERE user_id = ?
            `, [userId]);
            
            const xpFromAchievements = await database.get(`
                SELECT COALESCE(SUM(a.xp_reward), 0) as total_xp
                FROM user_achievements ua
                JOIN achievements a ON ua.achievement_id = a.id
                WHERE ua.user_id = ?
            `, [userId]);
            
            return {
                total_achievements: totalAchievements?.count || 0,
                unlocked_achievements: unlockedAchievements?.count || 0,
                locked_achievements: (totalAchievements?.count || 0) - (unlockedAchievements?.count || 0),
                completion_percentage: Math.round(((unlockedAchievements?.count || 0) / (totalAchievements?.count || 1)) * 100),
                xp_from_achievements: xpFromAchievements?.total_xp || 0
            };
        } catch (error) {
            console.error('[ACHIEVEMENT] Erro ao obter estatísticas:', error);
            return {
                total_achievements: 0,
                unlocked_achievements: 0,
                locked_achievements: 0,
                completion_percentage: 0,
                xp_from_achievements: 0
            };
        }
    }
}

module.exports = AchievementModel; 