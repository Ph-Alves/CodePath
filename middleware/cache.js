/**
 * CodePath - Middleware de Cache Avançado
 * Fase 24 - Otimização de Performance
 * 
 * Sistema de cache inteligente para otimizar:
 * - Respostas de API frequentes
 * - Dados de progresso do usuário
 * - Consultas do banco de dados
 * - Assets estáticos
 */

const NodeCache = require('node-cache');

/**
 * Sistema de Cache Avançado - CodePath
 * Implementa cache inteligente para diferentes tipos de dados
 */

// Configurações de cache por tipo de dados
const cacheConfigs = {
    // Cache para dados de usuário (perfil, configurações)
    user: {
        stdTTL: 300, // 5 minutos
        checkperiod: 60, // verifica a cada 1 minuto
        maxKeys: 1000
    },
    // Cache para dados de progresso
    progress: {
        stdTTL: 120, // 2 minutos
        checkperiod: 30,
        maxKeys: 500
    },
    // Cache para conteúdo estático (pacotes, aulas)
    static: {
        stdTTL: 3600, // 1 hora
        checkperiod: 300, // 5 minutos
        maxKeys: 200
    },
    // Cache para queries do banco
    query: {
        stdTTL: 600, // 10 minutos
        checkperiod: 120,
        maxKeys: 300
    }
};

// Instâncias de cache
const caches = {
    user: new NodeCache(cacheConfigs.user),
    progress: new NodeCache(cacheConfigs.progress),
    static: new NodeCache(cacheConfigs.static),
    query: new NodeCache(cacheConfigs.query)
};

/**
 * Gerenciador de Cache Principal
 */
class CacheManager {
    static get(type, key) {
        if (!caches[type]) {
            console.warn(`Cache type '${type}' not found`);
            return null;
        }
        return caches[type].get(key);
    }

    static set(type, key, value, ttl = null) {
        if (!caches[type]) {
            console.warn(`Cache type '${type}' not found`);
            return false;
        }
        if (ttl) {
            return caches[type].set(key, value, ttl);
        }
        return caches[type].set(key, value);
    }

    static del(type, key) {
        if (!caches[type]) {
            console.warn(`Cache type '${type}' not found`);
            return false;
        }
        return caches[type].del(key);
    }

    static flush(type) {
        if (!caches[type]) {
            console.warn(`Cache type '${type}' not found`);
            return false;
        }
        return caches[type].flushAll();
    }

    static flushAll() {
        Object.keys(caches).forEach(type => {
            caches[type].flushAll();
        });
        console.log('✅ Cache: Todos os caches foram limpos');
    }

    static getStats() {
        const stats = {};
        Object.keys(caches).forEach(type => {
            const cache = caches[type];
            stats[type] = {
                keys: cache.keys().length,
                hits: cache.getStats().hits,
                misses: cache.getStats().misses,
                hitRate: cache.getStats().hits / (cache.getStats().hits + cache.getStats().misses) || 0
            };
        });
        return stats;
    }

    static clearExpired() {
        Object.keys(caches).forEach(type => {
            caches[type].flushExpired();
        });
    }
}

/**
 * Middleware de Cache para Rotas
 */
const cacheMiddleware = (type, keyGenerator, ttl = null) => {
    return (req, res, next) => {
        try {
            const cacheKey = typeof keyGenerator === 'function' 
                ? keyGenerator(req) 
                : keyGenerator;
            
            const cachedData = CacheManager.get(type, cacheKey);
            
            if (cachedData) {
                console.log(`🚀 Cache HIT: ${type}:${cacheKey}`);
                return res.json(cachedData);
            }

            // Interceptar resposta para cachear
            const originalSend = res.send;
            res.send = function(data) {
                try {
                    const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
                    CacheManager.set(type, cacheKey, parsedData, ttl);
                    console.log(`💾 Cache SET: ${type}:${cacheKey}`);
                } catch (error) {
                    console.warn(`⚠️ Cache: Erro ao cachear ${type}:${cacheKey}`, error.message);
                }
                originalSend.call(this, data);
            };

            next();
        } catch (error) {
            console.error('❌ Cache Middleware Error:', error);
            next();
        }
    };
};

/**
 * Middleware para Invalidar Cache
 */
const invalidateCacheMiddleware = (type, keyGenerator) => {
    return (req, res, next) => {
        try {
            const cacheKey = typeof keyGenerator === 'function' 
                ? keyGenerator(req) 
                : keyGenerator;
            
            CacheManager.del(type, cacheKey);
            console.log(`🗑️ Cache INVALIDATED: ${type}:${cacheKey}`);
        } catch (error) {
            console.error('❌ Cache Invalidation Error:', error);
        }
        next();
    };
};

/**
 * Função helper para cachear queries do banco
 */
const cacheQuery = async (key, queryFunction, ttl = 600) => {
    try {
        // Verificar cache primeiro
        const cachedResult = CacheManager.get('query', key);
        if (cachedResult) {
            console.log(`🚀 Query Cache HIT: ${key}`);
            return cachedResult;
        }

        // Executar query
        console.log(`🔍 Query Cache MISS: ${key} - Executando query...`);
        const result = await queryFunction();
        
        // Cachear resultado
        CacheManager.set('query', key, result, ttl);
        console.log(`💾 Query Cache SET: ${key}`);
        
        return result;
    } catch (error) {
        console.error(`❌ Query Cache Error for ${key}:`, error);
        throw error;
    }
};

/**
 * Configuração de limpeza automática
 */
const setupCacheCleanup = () => {
    // Limpeza automática a cada 30 minutos
    setInterval(() => {
        const stats = CacheManager.getStats();
        console.log('🧹 Cache: Limpeza automática executada');
        console.log('📊 Cache Stats:', stats);
        
        // Limpar caches com baixo hit rate (< 30%)
        Object.keys(stats).forEach(type => {
            if (stats[type].hitRate < 0.3 && stats[type].keys > 50) {
                console.log(`🗑️ Cache: Limpando cache ${type} com baixo hit rate (${(stats[type].hitRate * 100).toFixed(1)}%)`);
                CacheManager.flush(type);
            }
        });
    }, 30 * 60 * 1000); // 30 minutos
};

module.exports = {
    CacheManager,
    cacheMiddleware,
    invalidateCacheMiddleware,
    cacheQuery,
    setupCacheCleanup
}; 