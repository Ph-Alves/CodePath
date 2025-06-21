const ValidationModel = require('../models/validationModel');
const database = require('../models/database');

/**
 * Controlador de Segurança
 * Responsável por endpoints de monitoramento e gerenciamento de segurança
 */
class SecurityController {

    /**
     * Exibe dashboard de segurança (apenas para admins)
     */
    static async showSecurityDashboard(req, res) {
        try {
            // Verifica se usuário é admin
            if (!req.session.user || req.session.user.role !== 'admin') {
                return res.status(403).render('pages/error', {
                    title: 'Acesso Negado',
                    message: 'Você não tem permissão para acessar esta área.',
                    user: req.session.user
                });
            }

            const stats = await SecurityController.getSecurityStats();
            const recentActivities = await SecurityController.getRecentSuspiciousActivities();
            const blockedIPs = await SecurityController.getBlockedIPs();

            res.render('pages/security-dashboard', {
                title: 'Dashboard de Segurança - CodePath',
                user: req.session.user,
                stats,
                recentActivities,
                blockedIPs,
                csrfToken: res.locals.csrfToken
            });
        } catch (error) {
            console.error('Erro no dashboard de segurança:', error);
            res.status(500).render('pages/error', {
                title: 'Erro Interno',
                message: 'Erro ao carregar dashboard de segurança.',
                user: req.session.user
            });
        }
    }

    /**
     * API: Obtém estatísticas de segurança
     */
    static async getSecurityStatsAPI(req, res) {
        try {
            if (!req.session.user || req.session.user.role !== 'admin') {
                return res.status(403).json({
                    success: false,
                    message: 'Acesso negado'
                });
            }

            const stats = await SecurityController.getSecurityStats();
            
            res.json({
                success: true,
                data: stats
            });
        } catch (error) {
            console.error('Erro ao obter estatísticas de segurança:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    /**
     * API: Obtém atividades suspeitas recentes
     */
    static async getSuspiciousActivitiesAPI(req, res) {
        try {
            if (!req.session.user || req.session.user.role !== 'admin') {
                return res.status(403).json({
                    success: false,
                    message: 'Acesso negado'
                });
            }

            const limit = parseInt(req.query.limit) || 50;
            const offset = parseInt(req.query.offset) || 0;

            const activities = await SecurityController.getRecentSuspiciousActivities(limit, offset);
            
            res.json({
                success: true,
                data: activities
            });
        } catch (error) {
            console.error('Erro ao obter atividades suspeitas:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    /**
     * API: Obtém IPs bloqueados
     */
    static async getBlockedIPsAPI(req, res) {
        try {
            if (!req.session.user || req.session.user.role !== 'admin') {
                return res.status(403).json({
                    success: false,
                    message: 'Acesso negado'
                });
            }

            const blockedIPs = await SecurityController.getBlockedIPs();
            
            res.json({
                success: true,
                data: blockedIPs
            });
        } catch (error) {
            console.error('Erro ao obter IPs bloqueados:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    /**
     * API: Desbloqueia IP específico
     */
    static async unblockIP(req, res) {
        try {
            if (!req.session.user || req.session.user.role !== 'admin') {
                return res.status(403).json({
                    success: false,
                    message: 'Acesso negado'
                });
            }

            const { ip } = req.body;
            
            if (!ip) {
                return res.status(400).json({
                    success: false,
                    message: 'IP é obrigatório'
                });
            }

            const db = await database.getConnection();
            
            // Remove tentativas de login falhadas do IP
            await db.run(`
                DELETE FROM login_attempts 
                WHERE ip_address = ? AND success = 0
            `, [ip]);

            // Log da ação administrativa
            await ValidationModel.logSuspiciousActivity(
                req.session.user.id,
                'admin_unblock_ip',
                req.ip,
                `Admin desbloqueou IP: ${ip}`
            );

            res.json({
                success: true,
                message: `IP ${ip} desbloqueado com sucesso`
            });
        } catch (error) {
            console.error('Erro ao desbloquear IP:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    /**
     * API: Limpa logs antigos manualmente
     */
    static async cleanOldLogs(req, res) {
        try {
            if (!req.session.user || req.session.user.role !== 'admin') {
                return res.status(403).json({
                    success: false,
                    message: 'Acesso negado'
                });
            }

            await ValidationModel.cleanOldLoginAttempts();
            await ValidationModel.cleanExpiredSessions();
            await ValidationModel.cleanOldApiRequests();

            // Log da ação administrativa
            await ValidationModel.logSuspiciousActivity(
                req.session.user.id,
                'admin_clean_logs',
                req.ip,
                'Admin executou limpeza manual de logs'
            );

            res.json({
                success: true,
                message: 'Limpeza de logs executada com sucesso'
            });
        } catch (error) {
            console.error('Erro na limpeza de logs:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    /**
     * Função auxiliar: Obtém estatísticas de segurança
     */
    static async getSecurityStats() {
        const db = await database.getConnection();
        
        try {
            // Tentativas de login nas últimas 24 horas
            const loginAttempts = await db.get(`
                SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN success = 1 THEN 1 ELSE 0 END) as successful,
                    SUM(CASE WHEN success = 0 THEN 1 ELSE 0 END) as failed
                FROM login_attempts 
                WHERE attempted_at > datetime('now', '-24 hours')
            `);

            // IPs únicos que tentaram login
            const uniqueIPs = await db.get(`
                SELECT COUNT(DISTINCT ip_address) as count
                FROM login_attempts 
                WHERE attempted_at > datetime('now', '-24 hours')
            `);

            // Atividades suspeitas nas últimas 24 horas
            const suspiciousActivities = await db.get(`
                SELECT COUNT(*) as count
                FROM suspicious_activities 
                WHERE detected_at > datetime('now', '-24 hours')
            `);

            // Requisições por hora nas últimas 24 horas
            const requestsPerHour = await db.all(`
                SELECT 
                    strftime('%H', requested_at) as hour,
                    COUNT(*) as requests
                FROM api_requests 
                WHERE requested_at > datetime('now', '-24 hours')
                GROUP BY strftime('%H', requested_at)
                ORDER BY hour
            `);

            // IPs atualmente bloqueados
            const blockedIPs = await db.get(`
                SELECT COUNT(DISTINCT ip_address) as count
                FROM login_attempts 
                WHERE success = 0 
                AND attempted_at > datetime('now', '-15 minutes')
                GROUP BY ip_address
                HAVING COUNT(*) >= 5
            `);

            // Endpoints mais acessados
            const topEndpoints = await db.all(`
                SELECT 
                    endpoint,
                    COUNT(*) as requests
                FROM api_requests 
                WHERE requested_at > datetime('now', '-24 hours')
                GROUP BY endpoint
                ORDER BY requests DESC
                LIMIT 10
            `);

            return {
                loginAttempts: {
                    total: loginAttempts.total || 0,
                    successful: loginAttempts.successful || 0,
                    failed: loginAttempts.failed || 0,
                    successRate: loginAttempts.total > 0 ? 
                        Math.round((loginAttempts.successful / loginAttempts.total) * 100) : 0
                },
                uniqueIPs: uniqueIPs.count || 0,
                suspiciousActivities: suspiciousActivities.count || 0,
                blockedIPs: blockedIPs.count || 0,
                requestsPerHour: requestsPerHour || [],
                topEndpoints: topEndpoints || []
            };
        } catch (error) {
            console.error('Erro ao obter estatísticas:', error);
            return {
                loginAttempts: { total: 0, successful: 0, failed: 0, successRate: 0 },
                uniqueIPs: 0,
                suspiciousActivities: 0,
                blockedIPs: 0,
                requestsPerHour: [],
                topEndpoints: []
            };
        }
    }

    /**
     * Função auxiliar: Obtém atividades suspeitas recentes
     */
    static async getRecentSuspiciousActivities(limit = 50, offset = 0) {
        const db = await database.getConnection();
        
        try {
            const activities = await db.all(`
                SELECT 
                    sa.*,
                    u.name as user_name,
                    u.email as user_email
                FROM suspicious_activities sa
                LEFT JOIN users u ON sa.user_id = u.id
                ORDER BY sa.detected_at DESC
                LIMIT ? OFFSET ?
            `, [limit, offset]);

            return activities.map(activity => ({
                id: activity.id,
                userId: activity.user_id,
                userName: activity.user_name || 'Usuário não identificado',
                userEmail: activity.user_email || 'N/A',
                activityType: activity.activity_type,
                ipAddress: activity.ip_address,
                details: activity.details ? JSON.parse(activity.details) : {},
                detectedAt: activity.detected_at,
                detectedAtFormatted: new Date(activity.detected_at).toLocaleString('pt-BR')
            }));
        } catch (error) {
            console.error('Erro ao obter atividades suspeitas:', error);
            return [];
        }
    }

    /**
     * Função auxiliar: Obtém IPs bloqueados
     */
    static async getBlockedIPs() {
        const db = await database.getConnection();
        
        try {
            const blockedIPs = await db.all(`
                SELECT 
                    ip_address,
                    COUNT(*) as failed_attempts,
                    MAX(attempted_at) as last_attempt,
                    MIN(attempted_at) as first_attempt
                FROM login_attempts 
                WHERE success = 0 
                AND attempted_at > datetime('now', '-15 minutes')
                GROUP BY ip_address
                HAVING COUNT(*) >= 5
                ORDER BY failed_attempts DESC
            `);

            return blockedIPs.map(ip => ({
                address: ip.ip_address,
                failedAttempts: ip.failed_attempts,
                lastAttempt: ip.last_attempt,
                firstAttempt: ip.first_attempt,
                lastAttemptFormatted: new Date(ip.last_attempt).toLocaleString('pt-BR'),
                firstAttemptFormatted: new Date(ip.first_attempt).toLocaleString('pt-BR'),
                remainingTime: 15 - Math.floor((Date.now() - new Date(ip.last_attempt).getTime()) / (1000 * 60))
            }));
        } catch (error) {
            console.error('Erro ao obter IPs bloqueados:', error);
            return [];
        }
    }

    /**
     * API: Valida força da senha
     */
    static async validatePasswordStrength(req, res) {
        try {
            const { password } = req.body;
            
            if (!password) {
                return res.status(400).json({
                    success: false,
                    message: 'Senha é obrigatória'
                });
            }

            const validation = ValidationModel.validatePassword(password);
            
            res.json({
                success: true,
                data: {
                    isValid: validation.isValid,
                    strength: validation.strength,
                    errors: validation.errors,
                    strengthScore: {
                        weak: 1,
                        medium: 2,
                        strong: 3,
                        very_strong: 4
                    }[validation.strength]
                }
            });
        } catch (error) {
            console.error('Erro na validação de senha:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    /**
     * API: Verifica se email é válido
     */
    static async validateEmail(req, res) {
        try {
            const { email } = req.body;
            
            if (!email) {
                return res.status(400).json({
                    success: false,
                    message: 'Email é obrigatório'
                });
            }

            const sanitizedEmail = ValidationModel.sanitizeEmail(email);
            const isValid = ValidationModel.isValidEmail(sanitizedEmail);
            
            res.json({
                success: true,
                data: {
                    isValid,
                    sanitizedEmail,
                    originalEmail: email
                }
            });
        } catch (error) {
            console.error('Erro na validação de email:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }
}

module.exports = SecurityController; 