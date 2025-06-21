const ValidationModel = require('../models/validationModel');

/**
 * Middleware de Segurança
 * Responsável por proteção CSRF, rate limiting, sanitização e bloqueio de IPs
 */

/**
 * Middleware de proteção CSRF
 */
const csrfProtection = (req, res, next) => {
    // Gera token CSRF para formulários
    if (req.method === 'GET') {
        req.session.csrfToken = ValidationModel.generateCSRFToken();
        res.locals.csrfToken = req.session.csrfToken;
        return next();
    }

    // Valida token CSRF em requisições POST/PUT/DELETE
    if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
        const token = req.body._csrf || req.headers['x-csrf-token'];
        const sessionToken = req.session.csrfToken;

        if (!ValidationModel.validateCSRFToken(token, sessionToken)) {
            return res.status(403).json({
                success: false,
                message: 'Token CSRF inválido. Recarregue a página e tente novamente.',
                code: 'CSRF_INVALID'
            });
        }
    }

    next();
};

/**
 * Middleware de rate limiting
 */
const rateLimiter = (options = {}) => {
    const defaultOptions = {
        limit: 100,
        windowMinutes: 15,
        message: 'Muitas requisições. Tente novamente em alguns minutos.',
        skipSuccessfulRequests: false
    };

    const config = { ...defaultOptions, ...options };

    return async (req, res, next) => {
        try {
            const ip = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
            const endpoint = req.route ? req.route.path : req.path;

            const rateLimit = await ValidationModel.checkRateLimit(
                ip, 
                endpoint, 
                config.limit, 
                config.windowMinutes
            );

            // Adiciona headers de rate limit
            res.set({
                'X-RateLimit-Limit': config.limit,
                'X-RateLimit-Remaining': rateLimit.remainingRequests,
                'X-RateLimit-Reset': rateLimit.resetTime ? rateLimit.resetTime.toISOString() : new Date().toISOString()
            });

            if (rateLimit.isLimited) {
                return res.status(429).json({
                    success: false,
                    message: config.message,
                    code: 'RATE_LIMIT_EXCEEDED',
                    retryAfter: config.windowMinutes * 60,
                    limit: config.limit,
                    resetTime: rateLimit.resetTime
                });
            }

            next();
        } catch (error) {
            console.error('Erro no rate limiting:', error);
            next(); // Continua em caso de erro
        }
    };
};

/**
 * Middleware de verificação de IP bloqueado
 */
const checkBlockedIP = async (req, res, next) => {
    try {
        const ip = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
        const blockStatus = await ValidationModel.checkIPBlocked(ip);

        if (blockStatus.isBlocked) {
            return res.status(429).json({
                success: false,
                message: `IP temporariamente bloqueado devido a muitas tentativas de login falhadas. Tente novamente em ${blockStatus.remainingTime} minutos.`,
                code: 'IP_BLOCKED',
                remainingTime: blockStatus.remainingTime,
                failedAttempts: blockStatus.failedAttempts
            });
        }

        // Adiciona informações do IP à requisição
        req.ipInfo = {
            address: ip,
            failedAttempts: blockStatus.failedAttempts,
            maxAttempts: blockStatus.maxAttempts
        };

        next();
    } catch (error) {
        console.error('Erro ao verificar IP bloqueado:', error);
        next(); // Continua em caso de erro
    }
};

/**
 * Middleware de sanitização de dados de entrada
 */
const sanitizeInput = (req, res, next) => {
    try {
        // Sanitiza body
        if (req.body && typeof req.body === 'object') {
            req.body = sanitizeObject(req.body);
        }

        // Sanitiza query parameters
        if (req.query && typeof req.query === 'object') {
            req.query = sanitizeObject(req.query);
        }

        // Sanitiza params
        if (req.params && typeof req.params === 'object') {
            req.params = sanitizeObject(req.params);
        }

        next();
    } catch (error) {
        console.error('Erro na sanitização:', error);
        next(); // Continua em caso de erro
    }
};

/**
 * Função auxiliar para sanitizar objetos
 */
function sanitizeObject(obj) {
    const sanitized = {};
    
    for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string') {
            sanitized[key] = ValidationModel.sanitizeString(value);
        } else if (typeof value === 'object' && value !== null) {
            sanitized[key] = sanitizeObject(value);
        } else {
            sanitized[key] = value;
        }
    }
    
    return sanitized;
}

/**
 * Middleware de headers de segurança
 */
const securityHeaders = (req, res, next) => {
    // Previne ataques de clickjacking
    res.setHeader('X-Frame-Options', 'DENY');
    
    // Previne MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    // Ativa proteção XSS no navegador
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    // Força HTTPS (apenas em produção)
    if (process.env.NODE_ENV === 'production') {
        res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }
    
    // Content Security Policy básica
    res.setHeader('Content-Security-Policy', 
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net; " +
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
        "font-src 'self' https://fonts.gstatic.com; " +
        "img-src 'self' data: https:; " +
        "connect-src 'self';"
    );
    
    // Remove header que revela tecnologia
    res.removeHeader('X-Powered-By');
    
    next();
};

/**
 * Middleware de validação de dados de formulário
 */
const validateForm = (rules) => {
    return (req, res, next) => {
        try {
            const validation = ValidationModel.validateFormData(req.body, rules);
            
            if (!validation.isValid) {
                return res.status(400).json({
                    success: false,
                    message: 'Dados inválidos',
                    errors: validation.errors,
                    code: 'VALIDATION_ERROR'
                });
            }
            
            // Substitui dados originais pelos sanitizados
            req.body = validation.sanitized;
            req.validationResult = validation;
            
            next();
        } catch (error) {
            console.error('Erro na validação de formulário:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor',
                code: 'INTERNAL_ERROR'
            });
        }
    };
};

/**
 * Middleware de log de atividades suspeitas
 */
const logSuspiciousActivity = (activityType) => {
    return async (req, res, next) => {
        try {
            const originalSend = res.send;
            
            res.send = function(data) {
                // Se resposta indica erro de autenticação/autorização
                if (res.statusCode >= 400 && res.statusCode < 500) {
                    const ip = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
                    const userId = req.session?.user?.id || null;
                    const details = JSON.stringify({
                        method: req.method,
                        url: req.originalUrl,
                        userAgent: req.get('User-Agent'),
                        statusCode: res.statusCode
                    });
                    
                    // Log assíncrono para não bloquear resposta
                    setImmediate(() => {
                        ValidationModel.logSuspiciousActivity(userId, activityType, ip, details);
                    });
                }
                
                originalSend.call(this, data);
            };
            
            next();
        } catch (error) {
            console.error('Erro no log de atividade suspeita:', error);
            next();
        }
    };
};

/**
 * Middleware de limpeza automática de dados antigos
 */
const cleanupOldData = () => {
    // Executa limpeza a cada 1 hora
    setInterval(async () => {
        try {
            await ValidationModel.cleanOldLoginAttempts();
            await ValidationModel.cleanExpiredSessions();
            await ValidationModel.cleanOldApiRequests();
            console.log('Limpeza automática de dados realizada');
        } catch (error) {
            console.error('Erro na limpeza automática:', error);
        }
    }, 60 * 60 * 1000); // 1 hora
};

/**
 * Middleware de proteção contra força bruta em login
 */
const loginProtection = async (req, res, next) => {
    try {
        const ip = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
        const email = req.body.email;
        
        // Registra tentativa de login (será atualizada após autenticação)
        req.loginAttempt = {
            email: email,
            ip: ip,
            timestamp: new Date()
        };
        
        next();
    } catch (error) {
        console.error('Erro na proteção de login:', error);
        next();
    }
};

/**
 * Middleware para registrar resultado do login
 */
const logLoginResult = async (req, res, next) => {
    try {
        const originalSend = res.send;
        
        res.send = function(data) {
            if (req.loginAttempt) {
                const success = res.statusCode === 200;
                
                // Log assíncrono
                setImmediate(() => {
                    ValidationModel.logLoginAttempt(
                        req.loginAttempt.email,
                        req.loginAttempt.ip,
                        success
                    );
                });
            }
            
            originalSend.call(this, data);
        };
        
        next();
    } catch (error) {
        console.error('Erro no log de resultado de login:', error);
        next();
    }
};

// Inicializa limpeza automática
cleanupOldData();

module.exports = {
    csrfProtection,
    rateLimiter,
    checkBlockedIP,
    sanitizeInput,
    securityHeaders,
    validateForm,
    logSuspiciousActivity,
    loginProtection,
    logLoginResult
}; 