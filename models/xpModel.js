const db = require('./database');

/**
 * Modelo para gerenciamento de XP e gamificação
 * Responsável por cálculos de XP, níveis, conquistas e streaks
 */

// Configurações do sistema de XP
const XP_CONFIG = {
    LESSON_COMPLETE: 50,      // XP por aula concluída
    QUIZ_COMPLETE: 100,       // XP por quiz completado
    PACKAGE_COMPLETE: 500,    // XP por pacote concluído
    DAILY_LOGIN: 10,          // XP por login diário
    STREAK_BONUS: 5,          // XP bônus por dia de streak (multiplicativo)
    PERFECT_QUIZ: 50          // XP bônus por quiz com 100% de acerto
};

// Sistema de níveis (XP necessário para cada nível)
const LEVEL_THRESHOLDS = [
    0,      // Nível 1
    100,    // Nível 2
    250,    // Nível 3
    450,    // Nível 4
    700,    // Nível 5
    1000,   // Nível 6
    1350,   // Nível 7
    1750,   // Nível 8
    2200,   // Nível 9
    2700,   // Nível 10
    3250,   // Nível 11
    3850,   // Nível 12
    4500,   // Nível 13
    5200,   // Nível 14
    5950,   // Nível 15
    6750,   // Nível 16
    7600,   // Nível 17
    8500,   // Nível 18
    9450,   // Nível 19
    10450   // Nível 20
];

/**
 * Calcula o nível baseado no XP total
 */
function calculateLevel(totalXP) {
    let level = 1;
    for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
        if (totalXP >= LEVEL_THRESHOLDS[i]) {
            level = i + 1;
            break;
        }
    }
    return level;
}

/**
 * Calcula XP necessário para o próximo nível
 */
function getXPForNextLevel(currentXP) {
    const currentLevel = calculateLevel(currentXP);
    if (currentLevel >= LEVEL_THRESHOLDS.length) {
        return 0; // Nível máximo atingido
    }
    return LEVEL_THRESHOLDS[currentLevel] - currentXP;
}

/**
 * Obtém dados completos de XP do usuário
 */
async function getUserXPData(userId) {
    try {
        const stmt = db.prepare(`
            SELECT 
                total_xp,
                current_streak,
                longest_streak,
                last_login_date,
                created_at
            FROM users 
            WHERE id = ?
        `);
        
        const user = stmt.get(userId);
        if (!user) {
            throw new Error('Usuário não encontrado');
        }

        const currentLevel = calculateLevel(user.total_xp);
        const xpForNextLevel = getXPForNextLevel(user.total_xp);
        const currentLevelXP = currentLevel > 1 ? LEVEL_THRESHOLDS[currentLevel - 2] : 0;
        const nextLevelXP = currentLevel < LEVEL_THRESHOLDS.length ? LEVEL_THRESHOLDS[currentLevel - 1] : user.total_xp;
        
        return {
            totalXP: user.total_xp,
            currentLevel,
            xpForNextLevel,
            currentLevelXP,
            nextLevelXP,
            progressToNextLevel: nextLevelXP > currentLevelXP ? 
                Math.round(((user.total_xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100) : 100,
            currentStreak: user.current_streak,
            longestStreak: user.longest_streak,
            lastLoginDate: user.last_login_date
        };
    } catch (error) {
        console.error('Erro ao obter dados de XP:', error);
        throw error;
    }
}

/**
 * Adiciona XP ao usuário
 */
async function addXP(userId, xpAmount, reason = 'Atividade completada') {
    try {
        // Obtém dados atuais do usuário
        const currentData = await getUserXPData(userId);
        const oldLevel = currentData.currentLevel;
        
        // Calcula novo XP total
        const newTotalXP = currentData.totalXP + xpAmount;
        const newLevel = calculateLevel(newTotalXP);
        
        // Atualiza XP no banco
        const updateStmt = db.prepare(`
            UPDATE users 
            SET total_xp = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `);
        updateStmt.run(newTotalXP, userId);
        
        // Registra histórico de XP
        const historyStmt = db.prepare(`
            INSERT INTO xp_history (user_id, xp_gained, reason, created_at)
            VALUES (?, ?, ?, CURRENT_TIMESTAMP)
        `);
        historyStmt.run(userId, xpAmount, reason);
        
        // Verifica se houve mudança de nível
        const leveledUp = newLevel > oldLevel;
        if (leveledUp) {
            await recordLevelUp(userId, oldLevel, newLevel);
        }
        
        return {
            xpGained: xpAmount,
            newTotalXP,
            oldLevel,
            newLevel,
            leveledUp,
            reason
        };
    } catch (error) {
        console.error('Erro ao adicionar XP:', error);
        throw error;
    }
}

/**
 * Registra mudança de nível
 */
async function recordLevelUp(userId, oldLevel, newLevel) {
    try {
        const stmt = db.prepare(`
            INSERT INTO level_history (user_id, old_level, new_level, achieved_at)
            VALUES (?, ?, ?, CURRENT_TIMESTAMP)
        `);
        stmt.run(userId, oldLevel, newLevel);
        
        // Adiciona notificação de nível
        const notificationStmt = db.prepare(`
            INSERT INTO notifications (user_id, type, title, message, created_at)
            VALUES (?, 'level_up', ?, ?, CURRENT_TIMESTAMP)
        `);
        notificationStmt.run(
            userId, 
            '🎉 Parabéns! Você subiu de nível!', 
            `Você alcançou o nível ${newLevel}! Continue assim e desbloqueie novas conquistas.`
        );
    } catch (error) {
        console.error('Erro ao registrar mudança de nível:', error);
        throw error;
    }
}

/**
 * Processa login diário e streak
 */
async function processeDailyLogin(userId) {
    try {
        const user = db.prepare(`
            SELECT last_login_date, current_streak, longest_streak
            FROM users WHERE id = ?
        `).get(userId);
        
        if (!user) return;
        
        const today = new Date().toISOString().split('T')[0];
        const lastLogin = user.last_login_date ? user.last_login_date.split('T')[0] : null;
        
        // Se já fez login hoje, não processa
        if (lastLogin === today) {
            return { alreadyLoggedToday: true };
        }
        
        let newStreak = 1;
        let streakBonus = 0;
        
        // Calcula streak
        if (lastLogin) {
            const lastLoginDate = new Date(lastLogin);
            const todayDate = new Date(today);
            const daysDiff = Math.floor((todayDate - lastLoginDate) / (1000 * 60 * 60 * 24));
            
            if (daysDiff === 1) {
                // Streak continua
                newStreak = user.current_streak + 1;
                streakBonus = Math.min(newStreak * XP_CONFIG.STREAK_BONUS, 50); // Máximo 50 XP de bônus
            } else if (daysDiff > 1) {
                // Streak quebrado
                newStreak = 1;
            }
        }
        
        // Atualiza dados do usuário
        const updateStmt = db.prepare(`
            UPDATE users 
            SET last_login_date = CURRENT_TIMESTAMP,
                current_streak = ?,
                longest_streak = MAX(longest_streak, ?),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `);
        updateStmt.run(newStreak, newStreak, userId);
        
        // Adiciona XP do login diário + bônus de streak
        const totalXP = XP_CONFIG.DAILY_LOGIN + streakBonus;
        const xpResult = await addXP(userId, totalXP, `Login diário (${newStreak} dias consecutivos)`);
        
        return {
            dailyLoginXP: XP_CONFIG.DAILY_LOGIN,
            streakBonus,
            totalXPGained: totalXP,
            currentStreak: newStreak,
            leveledUp: xpResult.leveledUp,
            newLevel: xpResult.newLevel
        };
    } catch (error) {
        console.error('Erro ao processar login diário:', error);
        throw error;
    }
}

/**
 * Obtém histórico de XP do usuário
 */
async function getXPHistory(userId, limit = 10) {
    try {
        const stmt = db.prepare(`
            SELECT xp_gained, reason, created_at
            FROM xp_history 
            WHERE user_id = ?
            ORDER BY created_at DESC
            LIMIT ?
        `);
        
        return stmt.all(userId, limit);
    } catch (error) {
        console.error('Erro ao obter histórico de XP:', error);
        throw error;
    }
}

/**
 * Obtém estatísticas de XP para ranking
 */
async function getXPLeaderboard(limit = 10) {
    try {
        const stmt = db.prepare(`
            SELECT 
                u.id,
                u.name,
                u.email,
                u.total_xp,
                u.current_streak,
                u.longest_streak
            FROM users u
            WHERE u.total_xp > 0
            ORDER BY u.total_xp DESC, u.longest_streak DESC
            LIMIT ?
        `);
        
        const users = stmt.all(limit);
        
        return users.map((user, index) => ({
            ...user,
            rank: index + 1,
            level: calculateLevel(user.total_xp)
        }));
    } catch (error) {
        console.error('Erro ao obter leaderboard:', error);
        throw error;
    }
}

/**
 * Verifica e processa conquistas baseadas em XP
 */
async function checkXPAchievements(userId) {
    try {
        const userData = await getUserXPData(userId);
        const achievements = [];
        
        // Conquistas por nível
        const levelAchievements = [
            { level: 5, title: 'Iniciante Dedicado', description: 'Alcançou o nível 5' },
            { level: 10, title: 'Estudante Avançado', description: 'Alcançou o nível 10' },
            { level: 15, title: 'Mestre do Conhecimento', description: 'Alcançou o nível 15' },
            { level: 20, title: 'Lenda CodePath', description: 'Alcançou o nível máximo!' }
        ];
        
        for (const achievement of levelAchievements) {
            if (userData.currentLevel >= achievement.level) {
                const exists = db.prepare(`
                    SELECT id FROM user_achievements 
                    WHERE user_id = ? AND achievement_type = ?
                `).get(userId, `level_${achievement.level}`);
                
                if (!exists) {
                    // Adiciona conquista
                    db.prepare(`
                        INSERT INTO user_achievements (user_id, achievement_type, title, description, achieved_at)
                        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
                    `).run(userId, `level_${achievement.level}`, achievement.title, achievement.description);
                    
                    achievements.push(achievement);
                }
            }
        }
        
        // Conquistas por streak
        const streakAchievements = [
            { streak: 7, title: 'Semana Perfeita', description: 'Manteve um streak de 7 dias' },
            { streak: 30, title: 'Mês Dedicado', description: 'Manteve um streak de 30 dias' },
            { streak: 100, title: 'Cem Dias de Glória', description: 'Manteve um streak de 100 dias' }
        ];
        
        for (const achievement of streakAchievements) {
            if (userData.currentStreak >= achievement.streak) {
                const exists = db.prepare(`
                    SELECT id FROM user_achievements 
                    WHERE user_id = ? AND achievement_type = ?
                `).get(userId, `streak_${achievement.streak}`);
                
                if (!exists) {
                    db.prepare(`
                        INSERT INTO user_achievements (user_id, achievement_type, title, description, achieved_at)
                        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
                    `).run(userId, `streak_${achievement.streak}`, achievement.title, achievement.description);
                    
                    achievements.push(achievement);
                }
            }
        }
        
        return achievements;
    } catch (error) {
        console.error('Erro ao verificar conquistas de XP:', error);
        throw error;
    }
}

module.exports = {
    XP_CONFIG,
    LEVEL_THRESHOLDS,
    calculateLevel,
    getXPForNextLevel,
    getUserXPData,
    addXP,
    processeDailyLogin,
    getXPHistory,
    getXPLeaderboard,
    checkXPAchievements
}; 