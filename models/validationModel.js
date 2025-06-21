const database = require('./database');
const crypto = require('crypto');

/**
 * Modelo de Validação e Segurança
 * Responsável por validação de dados, sanitização e limpeza de sessões
 */
class ValidationModel {

    /**
     * Sanitiza string removendo caracteres perigosos
     * @param {string} input - String a ser sanitizada
     * @returns {string} String sanitizada
     */
    static sanitizeString(input) {
        if (!input || typeof input !== 'string') return '';
        
        return input
            .trim()
            .replace(/[<>]/g, '') // Remove < e >
            .replace(/javascript:/gi, '') // Remove javascript:
            .replace(/on\w+=/gi, '') // Remove event handlers
            .replace(/script/gi, '') // Remove script
            .slice(0, 1000); // Limita tamanho
    }

    /**
     * Sanitiza email
     * @param {string} email - Email a ser sanitizado
     * @returns {string} Email sanitizado
     */
    static sanitizeEmail(email) {
        if (!email || typeof email !== 'string') return '';
        
        return email
            .trim()
            .toLowerCase()
            .slice(0, 255);
    }

    /**
     * Valida formato de email
     * @param {string} email - Email a ser validado
     * @returns {boolean} True se válido
     */
    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email) && email.length <= 255;
    }

    /**
     * Valida força da senha
     * @param {string} password - Senha a ser validada
     * @returns {object} Resultado da validação
     */
    static validatePassword(password) {
        const result = {
            isValid: false,
            errors: [],
            strength: 'weak'
        };

        if (!password || typeof password !== 'string') {
            result.errors.push('Senha é obrigatória');
            return result;
        }

        if (password.length < 8) {
            result.errors.push('Senha deve ter pelo menos 8 caracteres');
        }

        if (password.length > 128) {
            result.errors.push('Senha muito longa (máximo 128 caracteres)');
        }

        if (!/[a-z]/.test(password)) {
            result.errors.push('Senha deve conter pelo menos uma letra minúscula');
        }

        if (!/[A-Z]/.test(password)) {
            result.errors.push('Senha deve conter pelo menos uma letra maiúscula');
        }

        if (!/\d/.test(password)) {
            result.errors.push('Senha deve conter pelo menos um número');
        }

        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            result.errors.push('Senha deve conter pelo menos um caractere especial');
        }

        // Verifica senhas comuns
        const commonPasswords = [
            '12345678', 'password', '123456789', 'qwerty', 'abc123', 
            'password123', '123123', 'admin', 'letmein', 'welcome'
        ];
        
        if (commonPasswords.includes(password.toLowerCase())) {
            result.errors.push('Senha muito comum, escolha uma mais segura');
        }

        // Calcula força da senha
        let strength = 0;
        if (password.length >= 8) strength++;
        if (password.length >= 12) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/\d/.test(password)) strength++;
        if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;
        if (password.length >= 16) strength++;

        if (strength <= 2) result.strength = 'weak';
        else if (strength <= 4) result.strength = 'medium';
        else if (strength <= 6) result.strength = 'strong';
        else result.strength = 'very_strong';

        result.isValid = result.errors.length === 0;
        return result;
    }

    /**
     * Valida nome de usuário
     * @param {string} name - Nome a ser validado
     * @returns {object} Resultado da validação
     */
    static validateName(name) {
        const result = { isValid: false, errors: [] };

        if (!name || typeof name !== 'string') {
            result.errors.push('Nome é obrigatório');
            return result;
        }

        const sanitizedName = this.sanitizeString(name);
        
        if (sanitizedName.length < 2) {
            result.errors.push('Nome deve ter pelo menos 2 caracteres');
        }

        if (sanitizedName.length > 100) {
            result.errors.push('Nome muito longo (máximo 100 caracteres)');
        }

        if (!/^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]+$/.test(sanitizedName)) {
            result.errors.push('Nome deve conter apenas letras e espaços');
        }

        result.isValid = result.errors.length === 0;
        return result;
    }

    /**
     * Valida ID numérico
     * @param {any} id - ID a ser validado
     * @returns {boolean} True se válido
     */
    static isValidId(id) {
        const numId = parseInt(id);
        return !isNaN(numId) && numId > 0 && numId <= 2147483647;
    }

    /**
     * Gera token CSRF
     * @returns {string} Token CSRF
     */
    static generateCSRFToken() {
        return crypto.randomBytes(32).toString('hex');
    }

    /**
     * Valida token CSRF
     * @param {string} token - Token a ser validado
     * @param {string} sessionToken - Token da sessão
     * @returns {boolean} True se válido
     */
    static validateCSRFToken(token, sessionToken) {
        if (!token || !sessionToken) return false;
        return crypto.timingSafeEqual(
            Buffer.from(token, 'hex'),
            Buffer.from(sessionToken, 'hex')
        );
    }

    /**
     * Registra tentativa de login
     * @param {string} email - Email do usuário
     * @param {string} ip - IP da tentativa
     * @param {boolean} success - Se foi bem-sucedida
     */
    static async logLoginAttempt(email, ip, success) {
        const db = database.database;
        
        try {
            await db.run(`
                INSERT INTO login_attempts (email, ip_address, success, attempted_at)
                VALUES (?, ?, ?, datetime('now'))
            `, [email, ip, success ? 1 : 0]);
        } catch (error) {
            console.error('Erro ao registrar tentativa de login:', error);
        }
    }

    /**
     * Verifica se IP está bloqueado por muitas tentativas
     * @param {string} ip - IP a ser verificado
     * @returns {object} Status do bloqueio
     */
    static async checkIPBlocked(ip) {
        const db = database.database;
        
        try {
            // Verifica tentativas falhadas nas últimas 15 minutos
            const result = await db.get(`
                SELECT COUNT(*) as failed_attempts
                FROM login_attempts 
                WHERE ip_address = ? 
                AND success = 0 
                AND attempted_at > datetime('now', '-15 minutes')
            `, [ip]);

            const isBlocked = result.failed_attempts >= 5;
            const remainingTime = isBlocked ? 15 : 0; // 15 minutos de bloqueio

            return {
                isBlocked,
                failedAttempts: result.failed_attempts,
                remainingTime,
                maxAttempts: 5
            };
        } catch (error) {
            console.error('Erro ao verificar bloqueio de IP:', error);
            return { isBlocked: false, failedAttempts: 0, remainingTime: 0, maxAttempts: 5 };
        }
    }

    /**
     * Limpa tentativas antigas de login
     */
    static async cleanOldLoginAttempts() {
        const db = database.database;
        
        try {
            await db.run(`
                DELETE FROM login_attempts 
                WHERE attempted_at < datetime('now', '-24 hours')
            `);
        } catch (error) {
            console.error('Erro ao limpar tentativas antigas:', error);
        }
    }

    /**
     * Limpa sessões expiradas
     */
    static async cleanExpiredSessions() {
        const db = database.database;
        
        try {
            // Remove sessões inativas há mais de 7 dias
            await db.run(`
                DELETE FROM user_sessions 
                WHERE last_activity < datetime('now', '-7 days')
            `);
        } catch (error) {
            console.error('Erro ao limpar sessões expiradas:', error);
        }
    }

    /**
     * Registra atividade suspeita
     * @param {number} userId - ID do usuário
     * @param {string} activity - Tipo de atividade
     * @param {string} ip - IP da atividade
     * @param {string} details - Detalhes adicionais
     */
    static async logSuspiciousActivity(userId, activity, ip, details = '') {
        const db = database.database;
        
        try {
            await db.run(`
                INSERT INTO suspicious_activities (user_id, activity_type, ip_address, details, detected_at)
                VALUES (?, ?, ?, ?, datetime('now'))
            `, [userId, activity, ip, details]);
        } catch (error) {
            console.error('Erro ao registrar atividade suspeita:', error);
        }
    }

    /**
     * Verifica rate limiting para endpoint
     * @param {string} ip - IP do usuário
     * @param {string} endpoint - Endpoint acessado
     * @param {number} limit - Limite de requisições
     * @param {number} windowMinutes - Janela de tempo em minutos
     * @returns {object} Status do rate limiting
     */
    static async checkRateLimit(ip, endpoint, limit = 100, windowMinutes = 15) {
        const db = database.database;
        
        try {
            // Conta requisições na janela de tempo
            const result = await db.get(`
                SELECT COUNT(*) as request_count
                FROM api_requests 
                WHERE ip_address = ? 
                AND endpoint = ? 
                AND requested_at > datetime('now', '-${windowMinutes} minutes')
            `, [ip, endpoint]);

            const isLimited = result.request_count >= limit;
            const remainingRequests = Math.max(0, limit - result.request_count);

            // Registra a requisição atual
            await db.run(`
                INSERT INTO api_requests (ip_address, endpoint, requested_at)
                VALUES (?, ?, datetime('now'))
            `, [ip, endpoint]);

            return {
                isLimited,
                requestCount: result.request_count + 1,
                remainingRequests: remainingRequests - 1,
                limit,
                windowMinutes,
                resetTime: new Date(Date.now() + windowMinutes * 60 * 1000)
            };
        } catch (error) {
            console.error('Erro no rate limiting:', error);
            return { isLimited: false, requestCount: 1, remainingRequests: limit - 1, limit, windowMinutes };
        }
    }

    /**
     * Limpa registros antigos de requisições
     */
    static async cleanOldApiRequests() {
        const db = database.database;
        
        try {
            await db.run(`
                DELETE FROM api_requests 
                WHERE requested_at < datetime('now', '-1 hours')
            `);
        } catch (error) {
            console.error('Erro ao limpar requisições antigas:', error);
        }
    }

    /**
     * Valida dados de formulário genérico
     * @param {object} data - Dados a serem validados
     * @param {object} rules - Regras de validação
     * @returns {object} Resultado da validação
     */
    static validateFormData(data, rules) {
        const result = { isValid: true, errors: {}, sanitized: {} };

        for (const [field, fieldRules] of Object.entries(rules)) {
            const value = data[field];
            result.errors[field] = [];

            // Verifica se campo é obrigatório
            if (fieldRules.required && (!value || value.toString().trim() === '')) {
                result.errors[field].push(`${field} é obrigatório`);
                result.isValid = false;
                continue;
            }

            // Se campo não é obrigatório e está vazio, pula validação
            if (!fieldRules.required && (!value || value.toString().trim() === '')) {
                result.sanitized[field] = '';
                continue;
            }

            let sanitizedValue = value;

            // Sanitização baseada no tipo
            if (fieldRules.type === 'email') {
                sanitizedValue = this.sanitizeEmail(value);
                if (!this.isValidEmail(sanitizedValue)) {
                    result.errors[field].push('Email inválido');
                    result.isValid = false;
                }
            } else if (fieldRules.type === 'string') {
                sanitizedValue = this.sanitizeString(value);
            } else if (fieldRules.type === 'number') {
                sanitizedValue = parseInt(value);
                if (isNaN(sanitizedValue)) {
                    result.errors[field].push(`${field} deve ser um número`);
                    result.isValid = false;
                }
            }

            // Validação de tamanho
            if (fieldRules.minLength && sanitizedValue.toString().length < fieldRules.minLength) {
                result.errors[field].push(`${field} deve ter pelo menos ${fieldRules.minLength} caracteres`);
                result.isValid = false;
            }

            if (fieldRules.maxLength && sanitizedValue.toString().length > fieldRules.maxLength) {
                result.errors[field].push(`${field} deve ter no máximo ${fieldRules.maxLength} caracteres`);
                result.isValid = false;
            }

            // Validação customizada
            if (fieldRules.custom && typeof fieldRules.custom === 'function') {
                const customResult = fieldRules.custom(sanitizedValue);
                if (customResult !== true) {
                    result.errors[field].push(customResult);
                    result.isValid = false;
                }
            }

            result.sanitized[field] = sanitizedValue;
        }

        // Remove campos sem erros
        for (const field in result.errors) {
            if (result.errors[field].length === 0) {
                delete result.errors[field];
            }
        }

        return result;
    }
}

module.exports = ValidationModel; 