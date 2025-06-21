const express = require('express');
const router = express.Router();
const SecurityController = require('../controllers/securityController');
const { requireAuth } = require('../middleware/auth');
const { 
    csrfProtection, 
    rateLimiter, 
    sanitizeInput, 
    validateForm,
    logSuspiciousActivity 
} = require('../middleware/security');

/**
 * Rotas de Segurança
 * Endpoints para monitoramento e gerenciamento de segurança
 */

// Middleware aplicado a todas as rotas de segurança
router.use(requireAuth);
router.use(sanitizeInput);
router.use(csrfProtection);

// Rate limiting mais restritivo para endpoints de segurança
const securityRateLimit = rateLimiter({
    limit: 30,
    windowMinutes: 15,
    message: 'Muitas tentativas de acesso aos endpoints de segurança. Tente novamente em 15 minutos.'
});

// Log de atividades suspeitas para todos os endpoints de segurança
const securityActivityLog = logSuspiciousActivity('security_access');

// Aplica middleware específico de segurança
router.use(securityRateLimit);
router.use(securityActivityLog);

/**
 * GET /security/dashboard
 * Exibe dashboard de segurança (apenas admins)
 */
router.get('/dashboard', SecurityController.showSecurityDashboard);

/**
 * API Routes - Estatísticas e Monitoramento
 */

/**
 * GET /security/api/stats
 * Obtém estatísticas de segurança
 */
router.get('/api/stats', SecurityController.getSecurityStatsAPI);

/**
 * GET /security/api/activities
 * Obtém atividades suspeitas recentes
 * Query params: limit, offset
 */
router.get('/api/activities', SecurityController.getSuspiciousActivitiesAPI);

/**
 * GET /security/api/blocked-ips
 * Obtém lista de IPs bloqueados
 */
router.get('/api/blocked-ips', SecurityController.getBlockedIPsAPI);

/**
 * POST /security/api/unblock-ip
 * Desbloqueia IP específico (apenas admins)
 */
router.post('/api/unblock-ip', 
    validateForm({
        ip: {
            required: true,
            type: 'string',
            minLength: 7,
            maxLength: 45,
            custom: (value) => {
                // Validação básica de IP (IPv4 e IPv6)
                const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
                const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
                
                if (!ipv4Regex.test(value) && !ipv6Regex.test(value)) {
                    return 'Formato de IP inválido';
                }
                return true;
            }
        }
    }),
    SecurityController.unblockIP
);

/**
 * POST /security/api/clean-logs
 * Executa limpeza manual de logs antigos (apenas admins)
 */
router.post('/api/clean-logs', SecurityController.cleanOldLogs);

/**
 * Validation APIs - Endpoints para validação em tempo real
 */

/**
 * POST /security/api/validate-password
 * Valida força da senha
 */
router.post('/api/validate-password',
    rateLimiter({
        limit: 50,
        windowMinutes: 15,
        message: 'Muitas validações de senha. Tente novamente em alguns minutos.'
    }),
    validateForm({
        password: {
            required: true,
            type: 'string',
            minLength: 1,
            maxLength: 128
        }
    }),
    SecurityController.validatePasswordStrength
);

/**
 * POST /security/api/validate-email
 * Valida formato de email
 */
router.post('/api/validate-email',
    rateLimiter({
        limit: 50,
        windowMinutes: 15,
        message: 'Muitas validações de email. Tente novamente em alguns minutos.'
    }),
    validateForm({
        email: {
            required: true,
            type: 'string',
            minLength: 5,
            maxLength: 255
        }
    }),
    SecurityController.validateEmail
);

/**
 * Middleware de tratamento de erros específico para rotas de segurança
 */
router.use((error, req, res, next) => {
    console.error('Erro nas rotas de segurança:', error);
    
    // Log do erro como atividade suspeita
    const ip = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
    const userId = req.session?.user?.id || null;
    
    // Log assíncrono para não bloquear resposta
    setImmediate(() => {
        const ValidationModel = require('../models/validationModel');
        ValidationModel.logSuspiciousActivity(
            userId,
            'security_error',
            ip,
            JSON.stringify({
                error: error.message,
                stack: error.stack,
                url: req.originalUrl,
                method: req.method
            })
        );
    });
    
    // Resposta genérica para não revelar detalhes do erro
    if (req.originalUrl.includes('/api/')) {
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor de segurança',
            code: 'SECURITY_ERROR'
        });
    } else {
        res.status(500).render('pages/error', {
            title: 'Erro de Segurança',
            message: 'Ocorreu um erro no sistema de segurança. Tente novamente.',
            user: req.session.user
        });
    }
});

module.exports = router; 