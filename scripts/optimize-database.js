#!/usr/bin/env node

/**
 * Script de Otimização do Banco de Dados - CodePath
 * Fase 24 - Otimização de Performance
 * 
 * Otimiza o banco SQLite com índices, configurações e análises
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

class DatabaseOptimizer {
    constructor(dbPath = './db/codepath.db') {
        this.dbPath = dbPath;
        this.db = null;
        this.stats = {
            indicesCreated: 0,
            indicesExisting: 0,
            tablesAnalyzed: 0,
            errors: []
        };
    }
    
    async optimize() {
        console.log('🚀 Iniciando otimização do banco de dados SQLite');
        console.log(`📁 Banco: ${this.dbPath}`);
        console.log('─'.repeat(50));
        
        try {
            await this.connect();
            await this.configurePerformance();
            await this.createIndices();
            await this.analyzeTables();
            await this.vacuum();
            this.printSummary();
            
        } catch (error) {
            console.error('❌ Erro durante otimização:', error.message);
            this.stats.errors.push(error.message);
        } finally {
            await this.disconnect();
        }
    }
    
    connect() {
        return new Promise((resolve, reject) => {
            // Verificar se o arquivo existe
            if (!fs.existsSync(this.dbPath)) {
                reject(new Error(`Arquivo de banco não encontrado: ${this.dbPath}`));
                return;
            }
            
            this.db = new sqlite3.Database(this.dbPath, sqlite3.OPEN_READWRITE, (err) => {
                if (err) {
                    reject(new Error(`Erro ao conectar ao banco: ${err.message}`));
                } else {
                    console.log('✅ Conectado ao banco de dados');
                    resolve();
                }
            });
        });
    }
    
    disconnect() {
        return new Promise((resolve) => {
            if (this.db) {
                this.db.close((err) => {
                    if (err) {
                        console.error('⚠️  Erro ao fechar conexão:', err.message);
                    } else {
                        console.log('✅ Conexão fechada');
                    }
                    resolve();
                });
            } else {
                resolve();
            }
        });
    }
    
    async configurePerformance() {
        console.log('⚙️  Configurando parâmetros de performance...');
        
        const configurations = [
            // Habilitar WAL mode para melhor concorrência
            'PRAGMA journal_mode = WAL',
            // Configurar cache para 10MB
            'PRAGMA cache_size = 10000',
            // Habilitar foreign keys
            'PRAGMA foreign_keys = ON',
            // Configurar synchronous para NORMAL (balance entre performance e segurança)
            'PRAGMA synchronous = NORMAL',
            // Habilitar memory-mapped I/O
            'PRAGMA mmap_size = 268435456', // 256MB
            // Otimizar temp store
            'PRAGMA temp_store = MEMORY',
            // Configurar page size para 4096 (otimizado para SSDs)
            'PRAGMA page_size = 4096'
        ];
        
        for (const config of configurations) {
            try {
                await this.runQuery(config);
                console.log(`   ✅ ${config}`);
            } catch (error) {
                console.log(`   ⚠️  ${config} - ${error.message}`);
                this.stats.errors.push(`Config: ${config} - ${error.message}`);
            }
        }
    }
    
    async createIndices() {
        console.log('📊 Criando índices para otimização...');
        
        const indices = [
            // Índices para tabela users
            {
                name: 'idx_users_email',
                sql: 'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)',
                description: 'Otimizar login por email'
            },
            {
                name: 'idx_users_level',
                sql: 'CREATE INDEX IF NOT EXISTS idx_users_level ON users(level)',
                description: 'Otimizar consultas por nível'
            },
            {
                name: 'idx_users_total_xp',
                sql: 'CREATE INDEX IF NOT EXISTS idx_users_total_xp ON users(total_xp)',
                description: 'Otimizar ranking por XP'
            },
            {
                name: 'idx_users_created_at',
                sql: 'CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at)',
                description: 'Otimizar consultas por data de criação'
            },
            
            // Índices para tabela user_progress
            {
                name: 'idx_progress_user_package',
                sql: 'CREATE INDEX IF NOT EXISTS idx_progress_user_package ON user_progress(user_id, package_id)',
                description: 'Otimizar progresso por usuário e pacote'
            },
            {
                name: 'idx_progress_status',
                sql: 'CREATE INDEX IF NOT EXISTS idx_progress_status ON user_progress(status)',
                description: 'Otimizar consultas por status'
            },
            {
                name: 'idx_progress_completed_at',
                sql: 'CREATE INDEX IF NOT EXISTS idx_progress_completed_at ON user_progress(completed_at)',
                description: 'Otimizar consultas por data de conclusão'
            },
            
            // Índices para tabela notifications
            {
                name: 'idx_notifications_user',
                sql: 'CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id)',
                description: 'Otimizar notificações por usuário'
            },
            {
                name: 'idx_notifications_read',
                sql: 'CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read_at)',
                description: 'Otimizar consultas de notificações não lidas'
            },
            {
                name: 'idx_notifications_created',
                sql: 'CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at)',
                description: 'Otimizar ordenação por data'
            },
            
            // Índices para tabela user_achievements
            {
                name: 'idx_achievements_user',
                sql: 'CREATE INDEX IF NOT EXISTS idx_achievements_user ON user_achievements(user_id)',
                description: 'Otimizar conquistas por usuário'
            },
            {
                name: 'idx_achievements_earned',
                sql: 'CREATE INDEX IF NOT EXISTS idx_achievements_earned ON user_achievements(earned_at)',
                description: 'Otimizar consultas por data de conquista'
            },
            
            // Índices para tabela quiz_results
            {
                name: 'idx_quiz_results_user',
                sql: 'CREATE INDEX IF NOT EXISTS idx_quiz_results_user ON quiz_results(user_id)',
                description: 'Otimizar resultados por usuário'
            },
            {
                name: 'idx_quiz_results_quiz',
                sql: 'CREATE INDEX IF NOT EXISTS idx_quiz_results_quiz ON quiz_results(quiz_id)',
                description: 'Otimizar resultados por quiz'
            },
            {
                name: 'idx_quiz_results_score',
                sql: 'CREATE INDEX IF NOT EXISTS idx_quiz_results_score ON quiz_results(score)',
                description: 'Otimizar consultas por pontuação'
            },
            
            // Índices para tabela chat_messages
            {
                name: 'idx_chat_messages_room',
                sql: 'CREATE INDEX IF NOT EXISTS idx_chat_messages_room ON chat_messages(room_id)',
                description: 'Otimizar mensagens por sala'
            },
            {
                name: 'idx_chat_messages_user',
                sql: 'CREATE INDEX IF NOT EXISTS idx_chat_messages_user ON chat_messages(user_id)',
                description: 'Otimizar mensagens por usuário'
            },
            {
                name: 'idx_chat_messages_created',
                sql: 'CREATE INDEX IF NOT EXISTS idx_chat_messages_created ON chat_messages(created_at)',
                description: 'Otimizar ordenação por data'
            },
            
            // Índices compostos para consultas complexas
            {
                name: 'idx_progress_user_status',
                sql: 'CREATE INDEX IF NOT EXISTS idx_progress_user_status ON user_progress(user_id, status)',
                description: 'Otimizar progresso por usuário e status'
            },
            {
                name: 'idx_notifications_user_read',
                sql: 'CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, read_at)',
                description: 'Otimizar notificações não lidas por usuário'
            }
        ];
        
        for (const index of indices) {
            try {
                // Verificar se o índice já existe
                const exists = await this.indexExists(index.name);
                
                if (exists) {
                    console.log(`   ⚪ ${index.name} - já existe`);
                    this.stats.indicesExisting++;
                } else {
                    await this.runQuery(index.sql);
                    console.log(`   ✅ ${index.name} - criado (${index.description})`);
                    this.stats.indicesCreated++;
                }
                
            } catch (error) {
                console.log(`   ❌ ${index.name} - erro: ${error.message}`);
                this.stats.errors.push(`Índice ${index.name}: ${error.message}`);
            }
        }
    }
    
    async indexExists(indexName) {
        const query = `
            SELECT name FROM sqlite_master 
            WHERE type='index' AND name=?
        `;
        
        return new Promise((resolve, reject) => {
            this.db.get(query, [indexName], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(!!row);
                }
            });
        });
    }
    
    async analyzeTables() {
        console.log('📈 Analisando tabelas para otimização...');
        
        // Obter lista de tabelas
        const tables = await this.getTables();
        
        for (const table of tables) {
            try {
                await this.runQuery(`ANALYZE ${table}`);
                console.log(`   ✅ ${table} - analisada`);
                this.stats.tablesAnalyzed++;
            } catch (error) {
                console.log(`   ⚠️  ${table} - erro: ${error.message}`);
                this.stats.errors.push(`Análise ${table}: ${error.message}`);
            }
        }
    }
    
    async getTables() {
        const query = `
            SELECT name FROM sqlite_master 
            WHERE type='table' AND name NOT LIKE 'sqlite_%'
            ORDER BY name
        `;
        
        return new Promise((resolve, reject) => {
            this.db.all(query, [], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows.map(row => row.name));
                }
            });
        });
    }
    
    async vacuum() {
        console.log('🧹 Executando VACUUM para otimizar espaço...');
        
        try {
            await this.runQuery('VACUUM');
            console.log('   ✅ VACUUM executado com sucesso');
        } catch (error) {
            console.log(`   ⚠️  VACUUM falhou: ${error.message}`);
            this.stats.errors.push(`VACUUM: ${error.message}`);
        }
    }
    
    runQuery(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this);
                }
            });
        });
    }
    
    async getDatabaseStats() {
        const stats = {};
        
        try {
            // Tamanho do banco
            const fileStats = fs.statSync(this.dbPath);
            stats.fileSize = fileStats.size;
            
            // Número de páginas
            const pageCountResult = await this.runQueryGet('PRAGMA page_count');
            stats.pageCount = pageCountResult ? pageCountResult.page_count : 0;
            
            // Tamanho da página
            const pageSizeResult = await this.runQueryGet('PRAGMA page_size');
            stats.pageSize = pageSizeResult ? pageSizeResult.page_size : 0;
            
            // Número de tabelas
            const tables = await this.getTables();
            stats.tableCount = tables.length;
            
            // Número de índices
            const indexCountResult = await this.runQueryGet(`
                SELECT COUNT(*) as count FROM sqlite_master 
                WHERE type='index' AND name NOT LIKE 'sqlite_%'
            `);
            stats.indexCount = indexCountResult ? indexCountResult.count : 0;
            
        } catch (error) {
            console.log(`⚠️  Erro ao obter estatísticas: ${error.message}`);
        }
        
        return stats;
    }
    
    runQueryGet(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.get(sql, params, (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }
    
    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    async printSummary() {
        const dbStats = await this.getDatabaseStats();
        
        console.log('🎉 RESUMO DA OTIMIZAÇÃO');
        console.log('═'.repeat(50));
        console.log(`📊 Índices criados: ${this.stats.indicesCreated}`);
        console.log(`⚪ Índices já existentes: ${this.stats.indicesExisting}`);
        console.log(`📈 Tabelas analisadas: ${this.stats.tablesAnalyzed}`);
        
        if (dbStats.fileSize) {
            console.log(`💾 Tamanho do banco: ${this.formatBytes(dbStats.fileSize)}`);
        }
        if (dbStats.tableCount) {
            console.log(`🗃️  Número de tabelas: ${dbStats.tableCount}`);
        }
        if (dbStats.indexCount) {
            console.log(`📊 Total de índices: ${dbStats.indexCount}`);
        }
        
        if (this.stats.errors.length > 0) {
            console.log(`❌ Erros encontrados: ${this.stats.errors.length}`);
            this.stats.errors.forEach(error => console.log(`   • ${error}`));
        }
        
        console.log('═'.repeat(50));
        console.log('✨ Otimização concluída!');
        
        // Sugestões
        console.log('\n💡 SUGESTÕES PARA MELHOR PERFORMANCE:');
        console.log('  • Execute esta otimização regularmente');
        console.log('  • Monitore o crescimento do banco de dados');
        console.log('  • Considere particionar tabelas muito grandes');
        console.log('  • Use prepared statements nas consultas');
    }
}

// Função principal
async function main() {
    const args = process.argv.slice(2);
    
    // Configurações padrão
    let dbPath = './db/codepath.db';
    
    // Processar argumentos da linha de comando
    if (args.includes('--db')) {
        const dbIndex = args.indexOf('--db');
        if (args[dbIndex + 1]) {
            dbPath = args[dbIndex + 1];
        }
    }
    
    if (args.includes('--help')) {
        console.log('🔧 OTIMIZADOR DE BANCO DE DADOS SQLite');
        console.log('');
        console.log('Uso: node optimize-database.js [opções]');
        console.log('');
        console.log('Opções:');
        console.log('  --db <caminho>    Caminho para o arquivo de banco (padrão: ./db/codepath.db)');
        console.log('  --help           Mostra esta ajuda');
        console.log('');
        console.log('Exemplo:');
        console.log('  node optimize-database.js --db ./db/meubancojs');
        return;
    }
    
    // Executar otimização
    const optimizer = new DatabaseOptimizer(dbPath);
    await optimizer.optimize();
}

// Executar se chamado diretamente
if (require.main === module) {
    main().catch(error => {
        console.error('❌ Erro fatal:', error);
        process.exit(1);
    });
}

module.exports = {
    DatabaseOptimizer
}; 