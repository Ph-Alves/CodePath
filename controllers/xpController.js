const xpModel = require('../models/xpModel');

/**
 * Controlador para sistema de XP e gamificação
 * Gerencia rotas relacionadas a XP, níveis, conquistas e leaderboard
 */

/**
 * Obtém dados completos de XP do usuário
 * GET /xp/profile
 */
async function getXPProfile(req, res) {
    try {
        const userId = req.session.userId;
        
        if (!userId) {
            return res.status(401).json({ error: 'Usuário não autenticado' });
        }
        
        const xpData = await xpModel.getUserXPData(userId);
        const xpHistory = await xpModel.getXPHistory(userId, 20);
        
        res.json({
            success: true,
            xpProfile: xpData,
            recentActivity: xpHistory
        });
    } catch (error) {
        console.error('Erro ao obter perfil de XP:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
}

/**
 * Obtém leaderboard de XP
 * GET /xp/leaderboard
 */
async function getLeaderboard(req, res) {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const leaderboard = await xpModel.getXPLeaderboard(limit);
        
        res.json({
            success: true,
            leaderboard
        });
    } catch (error) {
        console.error('Erro ao obter leaderboard:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
}

/**
 * Obtém histórico de XP do usuário
 * GET /xp/history
 */
async function getXPHistory(req, res) {
    try {
        const userId = req.session.userId;
        const limit = parseInt(req.query.limit) || 20;
        
        if (!userId) {
            return res.status(401).json({ error: 'Usuário não autenticado' });
        }
        
        const history = await xpModel.getXPHistory(userId, limit);
        
        res.json({
            success: true,
            history
        });
    } catch (error) {
        console.error('Erro ao obter histórico de XP:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
}

/**
 * Força verificação de conquistas
 * POST /xp/check-achievements
 */
async function checkAchievements(req, res) {
    try {
        const userId = req.session.userId;
        
        if (!userId) {
            return res.status(401).json({ error: 'Usuário não autenticado' });
        }
        
        const achievements = await xpModel.checkXPAchievements(userId);
        
        res.json({
            success: true,
            newAchievements: achievements,
            message: achievements.length > 0 ? 
                `${achievements.length} nova(s) conquista(s) desbloqueada(s)!` : 
                'Nenhuma nova conquista disponível'
        });
    } catch (error) {
        console.error('Erro ao verificar conquistas:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
}

/**
 * Exibe página de leaderboard
 * GET /xp/leaderboard/page
 */
async function showLeaderboardPage(req, res) {
    try {
        const userId = req.session.userId;
        const leaderboard = await xpModel.getXPLeaderboard(20);
        
        // Encontra posição do usuário atual
        let userRank = null;
        if (userId) {
            const fullLeaderboard = await xpModel.getXPLeaderboard(1000); // Busca mais usuários
            userRank = fullLeaderboard.findIndex(user => user.id === userId) + 1;
        }
        
        res.render('pages/leaderboard', {
            title: 'Ranking XP - CodePath',
            leaderboard,
            userRank,
            currentUserId: userId
        });
    } catch (error) {
        console.error('Erro ao exibir página de leaderboard:', error);
        res.render('pages/error', {
            title: 'Erro - CodePath',
            error: 'Erro ao carregar ranking'
        });
    }
}

/**
 * Exibe página de conquistas
 * GET /xp/achievements/page
 */
async function showAchievementsPage(req, res) {
    try {
        const userId = req.session.userId;
        
        if (!userId) {
            return res.redirect('/auth/login');
        }
        
        // Obtém conquistas do usuário
        const userAchievements = await getUserAchievements(userId);
        const xpData = await xpModel.getUserXPData(userId);
        
        res.render('pages/achievements', {
            title: 'Conquistas - CodePath',
            achievements: userAchievements,
            userXP: xpData
        });
    } catch (error) {
        console.error('Erro ao exibir página de conquistas:', error);
        res.render('pages/error', {
            title: 'Erro - CodePath',
            error: 'Erro ao carregar conquistas'
        });
    }
}

/**
 * Obtém estatísticas gerais de XP
 * GET /xp/stats
 */
async function getXPStats(req, res) {
    try {
        const userId = req.session.userId;
        
        if (!userId) {
            return res.status(401).json({ error: 'Usuário não autenticado' });
        }
        
        const xpData = await xpModel.getUserXPData(userId);
        const history = await xpModel.getXPHistory(userId, 7); // Últimos 7 registros
        const leaderboard = await xpModel.getXPLeaderboard(100);
        
        // Calcula posição no ranking
        const userRank = leaderboard.findIndex(user => user.id === userId) + 1;
        
        // Calcula XP ganho nos últimos 7 dias
        const weeklyXP = history.reduce((total, entry) => {
            const entryDate = new Date(entry.created_at);
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            
            if (entryDate >= weekAgo) {
                return total + entry.xp_gained;
            }
            return total;
        }, 0);
        
        res.json({
            success: true,
            stats: {
                ...xpData,
                weeklyXP,
                rank: userRank || 'N/A',
                totalUsers: leaderboard.length
            }
        });
    } catch (error) {
        console.error('Erro ao obter estatísticas de XP:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
}

/**
 * Função auxiliar para obter conquistas do usuário
 */
async function getUserAchievements(userId) {
    try {
        const db = require('../models/database');
        
        // Busca conquistas do usuário
        const userAchievements = db.prepare(`
            SELECT achievement_type, title, description, achieved_at
            FROM user_achievements
            WHERE user_id = ?
            ORDER BY achieved_at DESC
        `).all(userId);
        
        // Lista de todas as conquistas possíveis
        const allAchievements = [
            { type: 'level_5', title: 'Iniciante Dedicado', description: 'Alcançou o nível 5', category: 'level' },
            { type: 'level_10', title: 'Estudante Avançado', description: 'Alcançou o nível 10', category: 'level' },
            { type: 'level_15', title: 'Mestre do Conhecimento', description: 'Alcançou o nível 15', category: 'level' },
            { type: 'level_20', title: 'Lenda CodePath', description: 'Alcançou o nível máximo!', category: 'level' },
            { type: 'streak_7', title: 'Semana Perfeita', description: 'Manteve um streak de 7 dias', category: 'streak' },
            { type: 'streak_30', title: 'Mês Dedicado', description: 'Manteve um streak de 30 dias', category: 'streak' },
            { type: 'streak_100', title: 'Cem Dias de Glória', description: 'Manteve um streak de 100 dias', category: 'streak' }
        ];
        
        // Marca quais foram conquistadas
        return allAchievements.map(achievement => {
            const userAchievement = userAchievements.find(ua => ua.achievement_type === achievement.type);
            return {
                ...achievement,
                achieved: !!userAchievement,
                achievedAt: userAchievement ? userAchievement.achieved_at : null
            };
        });
    } catch (error) {
        console.error('Erro ao obter conquistas do usuário:', error);
        return [];
    }
}

module.exports = {
    getXPProfile,
    getLeaderboard,
    getXPHistory,
    checkAchievements,
    showLeaderboardPage,
    showAchievementsPage,
    getXPStats
}; 