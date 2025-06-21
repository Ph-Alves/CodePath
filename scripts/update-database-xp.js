const { initializeDatabase } = require('../models/database');

/**
 * Script para atualizar banco de dados existente com sistema de XP
 * Este script adiciona as tabelas e colunas necessárias para a Fase 14
 */

async function updateDatabase() {
    console.log('🔄 Iniciando atualização do banco de dados para sistema de XP...');

    try {
        // Inicializa o banco (se necessário)
        const db = await initializeDatabase();
        console.log('✅ Conectado ao banco SQLite');
        
        // Verifica se as colunas de XP já existem na tabela users
        const userColumns = await db.all('PRAGMA table_info(users)');
        const hasXPColumns = userColumns.some(col => col.name === 'total_xp');
        
        if (!hasXPColumns) {
            console.log('📝 Adicionando colunas de XP à tabela users...');
            
            // Adiciona colunas de XP à tabela users
            try {
                await db.run('ALTER TABLE users ADD COLUMN total_xp INTEGER DEFAULT 0');
                await db.run('ALTER TABLE users ADD COLUMN current_streak INTEGER DEFAULT 0');
                await db.run('ALTER TABLE users ADD COLUMN longest_streak INTEGER DEFAULT 0');
                await db.run('ALTER TABLE users ADD COLUMN last_login_date DATETIME');
                console.log('✅ Colunas de XP adicionadas à tabela users');
            } catch (error) {
                if (error.message.includes('duplicate column name')) {
                    console.log('ℹ️ Colunas de XP já existem na tabela users');
                } else {
                    throw error;
                }
            }
        } else {
            console.log('ℹ️ Colunas de XP já existem na tabela users');
        }
        
        // Cria tabela xp_history
        console.log('📝 Criando tabela xp_history...');
        await db.run(`
            CREATE TABLE IF NOT EXISTS xp_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                xp_gained INTEGER NOT NULL,
                reason TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        `);
        console.log('✅ Tabela xp_history criada');
        
        // Cria tabela level_history
        console.log('📝 Criando tabela level_history...');
        await db.run(`
            CREATE TABLE IF NOT EXISTS level_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                old_level INTEGER NOT NULL,
                new_level INTEGER NOT NULL,
                achieved_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        `);
        console.log('✅ Tabela level_history criada');
        
        // Cria tabela user_achievements
        console.log('📝 Criando tabela user_achievements...');
        await db.run(`
            CREATE TABLE IF NOT EXISTS user_achievements (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                achievement_type VARCHAR(50) NOT NULL,
                title VARCHAR(100) NOT NULL,
                description TEXT,
                achieved_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id),
                UNIQUE(user_id, achievement_type)
            )
        `);
        console.log('✅ Tabela user_achievements criada');
        
        // Cria índices para otimização
        console.log('📝 Criando índices para sistema de XP...');
        await db.run('CREATE INDEX IF NOT EXISTS idx_xp_history_user_id ON xp_history(user_id)');
        await db.run('CREATE INDEX IF NOT EXISTS idx_xp_history_created_at ON xp_history(created_at)');
        await db.run('CREATE INDEX IF NOT EXISTS idx_level_history_user_id ON level_history(user_id)');
        await db.run('CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id)');
        await db.run('CREATE INDEX IF NOT EXISTS idx_user_achievements_type ON user_achievements(achievement_type)');
        await db.run('CREATE INDEX IF NOT EXISTS idx_users_total_xp ON users(total_xp)');
        await db.run('CREATE INDEX IF NOT EXISTS idx_users_current_streak ON users(current_streak)');
        console.log('✅ Índices criados');
        
        // Migra dados existentes se necessário
        console.log('📝 Migrando dados existentes...');
        
        // Atualiza users existentes com XP baseado no progresso atual
        const usersWithoutXP = await db.all(`
            SELECT id, xp_points, level, streak_days 
            FROM users 
            WHERE total_xp = 0 OR total_xp IS NULL
        `);
        
        if (usersWithoutXP.length > 0) {
            console.log(`🔄 Migrando XP para ${usersWithoutXP.length} usuários...`);
            
            for (const user of usersWithoutXP) {
                // Converte dados antigos para o novo sistema
                const totalXP = user.xp_points || 0;
                const currentStreak = user.streak_days || 0;
                const longestStreak = user.streak_days || 0;
                
                await db.run(`
                    UPDATE users 
                    SET total_xp = ?, 
                        current_streak = ?, 
                        longest_streak = ?,
                        last_login_date = CURRENT_TIMESTAMP
                    WHERE id = ?
                `, [totalXP, currentStreak, longestStreak, user.id]);
                
                // Adiciona entrada no histórico se havia XP
                if (totalXP > 0) {
                    await db.run(`
                        INSERT INTO xp_history (user_id, xp_gained, reason, created_at)
                        VALUES (?, ?, ?, CURRENT_TIMESTAMP)
                    `, [user.id, totalXP, 'Migração de dados existentes']);
                }
            }
            
            console.log('✅ Dados migrados com sucesso');
        } else {
            console.log('ℹ️ Nenhum dado para migrar');
        }
        
        // Adiciona alguns dados de teste se o banco estiver vazio
        const userCount = await db.get('SELECT COUNT(*) as count FROM users');
        if (userCount.count === 0) {
            console.log('📝 Adicionando dados de teste...');
            
            // Insere usuário de teste
            const result = await db.run(`
                INSERT INTO users (name, email, password_hash, total_xp, current_streak, longest_streak, last_login_date)
                VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            `, ['Usuário Teste XP', 'teste@codepath.com', 'hash123', 150, 3, 5]);
            
            // Adiciona histórico de XP
            await db.run(`
                INSERT INTO xp_history (user_id, xp_gained, reason, created_at)
                VALUES (?, ?, ?, CURRENT_TIMESTAMP)
            `, [result.id, 150, 'Dados de teste iniciais']);
            
            console.log('✅ Dados de teste adicionados');
        }
        
        // Verifica se tudo foi criado corretamente
        console.log('🔍 Verificando estrutura criada...');
        
        const tables = await db.all(`
            SELECT name FROM sqlite_master 
            WHERE type='table' AND name IN ('xp_history', 'level_history', 'user_achievements')
        `);
        
        console.log(`✅ Tabelas criadas: ${tables.map(t => t.name).join(', ')}`);
        
        console.log('🎉 Atualização do banco concluída com sucesso!');
        console.log('📊 Sistema de XP está pronto para uso');
        
    } catch (error) {
        console.error('❌ Erro ao atualizar banco de dados:', error);
        process.exit(1);
    }
}

// Executa o script
updateDatabase(); 