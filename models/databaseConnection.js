/**
 * CodePath - Database Connection Singleton
 * 
 * Este módulo gerencia uma conexão global ao database que pode ser
 * acessada de forma segura por todos os models.
 */

let databaseInstance = null;

/**
 * Define a instância do database
 * @param {Object} db - Instância do database
 */
function setDatabaseInstance(db) {
    databaseInstance = db;
}

/**
 * Obtém a instância do database
 * @returns {Object|null} Instância do database ou null se não inicializado
 */
function getDatabaseInstance() {
    return databaseInstance;
}

/**
 * Verifica se o database está inicializado
 * @returns {boolean} True se inicializado
 */
function isDatabaseReady() {
    return databaseInstance !== null && databaseInstance.db !== null;
}

/**
 * Obtém a instância do database de forma segura
 * @returns {Object} Instância do database SQLite
 * @throws {Error} Se o database não estiver inicializado
 */
function getDatabase() {
    if (!isDatabaseReady()) {
        throw new Error('Database não inicializado. Certifique-se de que initializeDatabase() foi chamado.');
    }
    // Retornar a instância completa do database (que tem métodos get, run, all)
    return databaseInstance;
}

/**
 * Obtém a instância do database de forma segura (sem throw)
 * @returns {Object|null} Instância do database ou null
 */
function getDatabaseSafe() {
    if (!isDatabaseReady()) {
        console.warn('Database não inicializado - operação ignorada');
        return null;
    }
    return databaseInstance;
}

module.exports = {
    setDatabaseInstance,
    getDatabaseInstance,
    isDatabaseReady,
    getDatabase,
    getDatabaseSafe
}; 