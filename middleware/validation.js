/**
 * CodePath - Middleware de Validação Avançado
 * Fase 11 - Testes e Documentação Final
 * 
 * Sistema robusto de validação com:
 * - Validação de dados de entrada
 * - Sanitização automática
 * - Rate limiting básico
 * - Log de tentativas inválidas
 * - Proteção contra ataques comuns
 */

const fs = require('fs');
const path = require('path');

/**
 * Sistema de Rate Limiting simples baseado em memória
 */
class RateLimiter {
    constructor() {
        this.requests = new Map();
        this.windowMs = 15 * 60 * 1000; // 15 minutos
        this.maxRequests = 100; // máximo de requests por janela
        
        // Limpeza automática a cada 5 minutos
        setInterval(() => this.cleanup(), 5 * 60 * 1000);
    }

    /**
     * Verifica se o IP pode fazer uma requisição
     */
    isAllowed(ip) {
        const now = Date.now();
        const userRequests = this.requests.get(ip) || [];
        
        // Remove requisições antigas
        const validRequests = userRequests.filter(time => now - time < this.windowMs);
        
        if (validRequests.length >= this.maxRequests) {
            return false;
        }
        
        // Adiciona nova requisição
        validRequests.push(now);
        this.requests.set(ip, validRequests);
        
        return true;
    }

    /**
     * Limpa dados antigos
     */
    cleanup() {
        const now = Date.now();
        for (const [ip, requests] of this.requests.entries()) {
            const validRequests = requests.filter(time => now - time < this.windowMs);
            if (validRequests.length === 0) {
                this.requests.delete(ip);
            } else {
                this.requests.set(ip, validRequests);
            }
        }
    }

    /**
     * Obtém estatísticas do rate limiter
     */
    getStats() {
        return {
            activeIPs: this.requests.size,
            totalRequests: Array.from(this.requests.values()).reduce((sum, reqs) => sum + reqs.length, 0)
        };
    }
}

// Instância global do rate limiter
const rateLimiter = new RateLimiter();

/**
 * Sistema de Log de Validação
 */
class ValidationLogger {
    constructor() {
        this.logPath = path.join(__dirname, '..', 'logs');
        this.ensureLogDirectory();
    }

    /**
     * Garante que o diretório de logs existe
     */
    ensureLogDirectory() {
        if (!fs.existsSync(this.logPath)) {
            fs.mkdirSync(this.logPath, { recursive: true });
        }
    }

    /**
     * Registra tentativa de validação inválida
     */
    logInvalidAttempt(ip, endpoint, errors, data = null) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            ip: ip,
            endpoint: endpoint,
            errors: errors,
            data: data ? this.sanitizeForLog(data) : null,
            userAgent: data?.userAgent || 'unknown'
        };

        const logFile = path.join(this.logPath, `validation-${new Date().toISOString().split('T')[0]}.log`);
        const logLine = JSON.stringify(logEntry) + '\n';

        try {
            fs.appendFileSync(logFile, logLine);
        } catch (error) {
            console.error('Erro ao escrever log de validação:', error);
        }
    }

    /**
     * Sanitiza dados para log (remove informações sensíveis)
     */
    sanitizeForLog(data) {
        const sanitized = { ...data };
        
        // Remove campos sensíveis
        const sensitiveFields = ['password', 'password_hash', 'token', 'session', 'cookie'];
        sensitiveFields.forEach(field => {
            if (sanitized[field]) {
                sanitized[field] = '[REDACTED]';
            }
        });

        return sanitized;
    }
}

const validationLogger = new ValidationLogger();

/**
 * Funções de Sanitização
 */
const sanitize = {
    /**
     * Remove caracteres perigosos de strings
     */
    string: (value) => {
        if (typeof value !== 'string') return value;
        
        return value
            .trim()
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts
            .replace(/javascript:/gi, '') // Remove javascript:
            .replace(/on\w+\s*=/gi, '') // Remove event handlers
            .replace(/[<>]/g, ''); // Remove < e >
    },

    /**
     * Sanitiza email
     */
    email: (value) => {
        if (typeof value !== 'string') return value;
        return sanitize.string(value).toLowerCase();
    },

    /**
     * Sanitiza números
     */
    number: (value) => {
        const num = parseInt(value);
        return isNaN(num) ? null : num;
    },

    /**
     * Sanitiza booleanos
     */
    boolean: (value) => {
        if (typeof value === 'boolean') return value;
        if (typeof value === 'string') {
            return value.toLowerCase() === 'true' || value === '1';
        }
        return Boolean(value);
    }
};

/**
 * Esquemas de Validação
 */
const validationSchemas = {
    // Validação de login
    login: {
        email: {
            required: true,
            type: 'email',
            maxLength: 150,
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        },
        password: {
            required: true,
            type: 'string',
            minLength: 6,
            maxLength: 100
        }
    },

    // Validação de registro
    register: {
        name: {
            required: true,
            type: 'string',
            minLength: 2,
            maxLength: 100,
            pattern: /^[a-zA-ZÀ-ÿ\s]+$/
        },
        email: {
            required: true,
            type: 'email',
            maxLength: 150,
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        },
        password: {
            required: true,
            type: 'string',
            minLength: 6,
            maxLength: 100
        },
        birth_date: {
            required: false,
            type: 'date'
        },
        education_level: {
            required: false,
            type: 'string',
            enum: ['Ensino Fundamental', 'Ensino Médio', 'Ensino Superior', 'Pós-graduação']
        }
    },

    // Validação de questionário
    quiz: {
        quiz_id: {
            required: true,
            type: 'number',
            min: 1
        },
        answers: {
            required: true,
            type: 'array',
            minLength: 1
        }
    },

    // Validação de notificação
    notification: {
        user_id: {
            required: true,
            type: 'number',
            min: 1
        },
        type: {
            required: true,
            type: 'string',
            enum: ['welcome', 'progress', 'quiz', 'streak', 'content', 'achievement']
        },
        title: {
            required: true,
            type: 'string',
            minLength: 1,
            maxLength: 100
        },
        message: {
            required: true,
            type: 'string',
            minLength: 1,
            maxLength: 500
        }
    }
};

/**
 * Função principal de validação
 */
function validateData(data, schema) {
    const errors = [];
    const sanitizedData = {};

    for (const [field, rules] of Object.entries(schema)) {
        const value = data[field];

        // Verificar campo obrigatório
        if (rules.required && (value === undefined || value === null || value === '')) {
            errors.push(`Campo '${field}' é obrigatório`);
            continue;
        }

        // Se campo não é obrigatório e está vazio, pular validação
        if (!rules.required && (value === undefined || value === null || value === '')) {
            continue;
        }

        // Validação de tipo
        if (rules.type) {
            switch (rules.type) {
                case 'string':
                    if (typeof value !== 'string') {
                        errors.push(`Campo '${field}' deve ser uma string`);
                        continue;
                    }
                    sanitizedData[field] = sanitize.string(value);
                    break;

                case 'email':
                    if (typeof value !== 'string') {
                        errors.push(`Campo '${field}' deve ser um email válido`);
                        continue;
                    }
                    sanitizedData[field] = sanitize.email(value);
                    break;

                case 'number':
                    const numValue = sanitize.number(value);
                    if (numValue === null) {
                        errors.push(`Campo '${field}' deve ser um número válido`);
                        continue;
                    }
                    sanitizedData[field] = numValue;
                    break;

                case 'boolean':
                    sanitizedData[field] = sanitize.boolean(value);
                    break;

                case 'date':
                    const dateValue = new Date(value);
                    if (isNaN(dateValue.getTime())) {
                        errors.push(`Campo '${field}' deve ser uma data válida`);
                        continue;
                    }
                    sanitizedData[field] = dateValue.toISOString().split('T')[0];
                    break;

                case 'array':
                    if (!Array.isArray(value)) {
                        errors.push(`Campo '${field}' deve ser um array`);
                        continue;
                    }
                    sanitizedData[field] = value;
                    break;

                default:
                    sanitizedData[field] = value;
            }
        } else {
            sanitizedData[field] = value;
        }

        const currentValue = sanitizedData[field];

        // Validações adicionais
        if (rules.minLength && currentValue.length < rules.minLength) {
            errors.push(`Campo '${field}' deve ter pelo menos ${rules.minLength} caracteres`);
        }

        if (rules.maxLength && currentValue.length > rules.maxLength) {
            errors.push(`Campo '${field}' deve ter no máximo ${rules.maxLength} caracteres`);
        }

        if (rules.min && currentValue < rules.min) {
            errors.push(`Campo '${field}' deve ser pelo menos ${rules.min}`);
        }

        if (rules.max && currentValue > rules.max) {
            errors.push(`Campo '${field}' deve ser no máximo ${rules.max}`);
        }

        if (rules.pattern && !rules.pattern.test(currentValue)) {
            errors.push(`Campo '${field}' tem formato inválido`);
        }

        if (rules.enum && !rules.enum.includes(currentValue)) {
            errors.push(`Campo '${field}' deve ser um dos valores: ${rules.enum.join(', ')}`);
        }
    }

    return {
        isValid: errors.length === 0,
        errors: errors,
        data: sanitizedData
    };
}

/**
 * Middleware de Rate Limiting
 */
const rateLimitMiddleware = (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    
    if (!rateLimiter.isAllowed(ip)) {
        validationLogger.logInvalidAttempt(ip, req.path, ['Rate limit exceeded'], {
            userAgent: req.get('User-Agent')
        });
        
        return res.status(429).json({
            success: false,
            message: 'Muitas tentativas. Tente novamente em alguns minutos.',
            error: 'RATE_LIMIT_EXCEEDED'
        });
    }
    
    next();
};

/**
 * Middleware de validação genérico
 */
const validateMiddleware = (schemaName) => {
    return (req, res, next) => {
        const schema = validationSchemas[schemaName];
        
        if (!schema) {
            console.error(`Schema de validação '${schemaName}' não encontrado`);
            return res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }

        const validation = validateData(req.body, schema);
        
        if (!validation.isValid) {
            const ip = req.ip || req.connection.remoteAddress || 'unknown';
            
            validationLogger.logInvalidAttempt(ip, req.path, validation.errors, {
                body: req.body,
                userAgent: req.get('User-Agent')
            });
            
            return res.status(400).json({
                success: false,
                message: 'Dados inválidos',
                errors: validation.errors
            });
        }

        // Substituir req.body pelos dados sanitizados
        req.body = validation.data;
        next();
    };
};

/**
 * Middleware de validação para login
 */
const validateLogin = validateMiddleware('login');

/**
 * Middleware de validação para registro
 */
const validateRegister = validateMiddleware('register');

/**
 * Middleware de validação para questionário
 */
const validateQuiz = validateMiddleware('quiz');

/**
 * Middleware de validação para notificação
 */
const validateNotification = validateMiddleware('notification');

/**
 * Middleware de sanitização geral
 */
const sanitizeInput = (req, res, next) => {
    if (req.body) {
        for (const [key, value] of Object.entries(req.body)) {
            if (typeof value === 'string') {
                req.body[key] = sanitize.string(value);
            }
        }
    }
    
    if (req.query) {
        for (const [key, value] of Object.entries(req.query)) {
            if (typeof value === 'string') {
                req.query[key] = sanitize.string(value);
            }
        }
    }
    
    next();
};

/**
 * Função para obter estatísticas de validação
 */
const getValidationStats = () => {
    const rateLimiterStats = rateLimiter.getStats();
    
    return {
        rateLimiter: rateLimiterStats,
        schemas: Object.keys(validationSchemas),
        timestamp: new Date().toISOString()
    };
};

/**
 * Middleware para adicionar headers de segurança
 */
const securityHeaders = (req, res, next) => {
    // Prevenir clickjacking
    res.setHeader('X-Frame-Options', 'DENY');
    
    // Prevenir MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    // Habilitar proteção XSS
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    // Política de referrer
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    next();
};

module.exports = {
    // Middlewares principais
    rateLimitMiddleware,
    validateLogin,
    validateRegister,
    validateQuiz,
    validateNotification,
    sanitizeInput,
    securityHeaders,
    
    // Funções utilitárias
    validateData,
    sanitize,
    getValidationStats,
    
    // Classes para uso avançado
    RateLimiter,
    ValidationLogger,
    
    // Schemas para validação customizada
    validationSchemas
}; 