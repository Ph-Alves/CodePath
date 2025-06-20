/**
 * CodePath - Configuração do Banco de Dados SQLite
 * 
 * Este arquivo gerencia a conexão com o banco SQLite e fornece
 * métodos utilitários para operações de banco de dados.
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// ========================================
// CONFIGURAÇÃO DO BANCO
// ========================================

// Caminho para o arquivo do banco de dados
const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'db', 'codepath.db');

// Caminho para o arquivo de esquema SQL
const SCHEMA_PATH = path.join(__dirname, '..', 'db', 'schema.sql');

/**
 * Classe para gerenciar a conexão com o banco SQLite
 */
class Database {
  constructor() {
    this.db = null;
  }

  /**
   * Conecta ao banco de dados SQLite
   * Cria o banco se não existir
   */
  connect() {
    return new Promise((resolve, reject) => {
      // Verificar se a pasta db existe, se não criar
      const dbDir = path.dirname(DB_PATH);
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
        console.log('📁 Pasta db/ criada');
      }

      // Conectar ao banco SQLite
      this.db = new sqlite3.Database(DB_PATH, (err) => {
        if (err) {
          console.error('❌ Erro ao conectar com o banco:', err.message);
          reject(err);
        } else {
          console.log('✅ Conectado ao banco SQLite:', DB_PATH);
          
          // Habilitar foreign keys
          this.db.run('PRAGMA foreign_keys = ON', (err) => {
            if (err) {
              console.error('❌ Erro ao habilitar foreign keys:', err.message);
              reject(err);
            } else {
              console.log('🔗 Foreign keys habilitadas');
              resolve();
            }
          });
        }
      });
    });
  }

  /**
   * Inicializa o banco com o esquema definido
   * Executa o arquivo schema.sql se as tabelas não existirem
   */
  async initialize() {
    try {
      // Verificar se as tabelas já existem
      const tablesExist = await this.checkTablesExist();
      
      if (!tablesExist) {
        console.log('🔧 Inicializando estrutura do banco...');
        await this.executeSchema();
        console.log('✅ Estrutura do banco criada com sucesso');
      } else {
        console.log('✅ Estrutura do banco já existe');
      }
    } catch (error) {
      console.error('❌ Erro ao inicializar banco:', error.message);
      throw error;
    }
  }

  /**
   * Verifica se as tabelas principais existem no banco
   */
  checkTablesExist() {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name IN ('users', 'packages', 'career_profiles')
      `;
      
      this.db.all(query, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          // Se encontrou pelo menos 3 tabelas principais, considera que existe
          resolve(rows.length >= 3);
        }
      });
    });
  }

  /**
   * Executa o arquivo schema.sql para criar as tabelas
   */
  executeSchema() {
    return new Promise((resolve, reject) => {
      // Ler o arquivo schema.sql
      fs.readFile(SCHEMA_PATH, 'utf8', (err, sql) => {
        if (err) {
          console.error('❌ Erro ao ler schema.sql:', err.message);
          reject(err);
          return;
        }

        // Executar o SQL
        this.db.exec(sql, (err) => {
          if (err) {
            console.error('❌ Erro ao executar schema:', err.message);
            reject(err);
          } else {
            console.log('📋 Schema executado com sucesso');
            resolve();
          }
        });
      });
    });
  }

  /**
   * Executa uma query SELECT e retorna todos os resultados
   */
  all(query, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(query, params, (err, rows) => {
        if (err) {
          console.error('❌ Erro na query SELECT:', err.message);
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  /**
   * Executa uma query SELECT e retorna apenas o primeiro resultado
   */
  get(query, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(query, params, (err, row) => {
        if (err) {
          console.error('❌ Erro na query GET:', err.message);
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  /**
   * Executa uma query INSERT, UPDATE ou DELETE
   */
  run(query, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(query, params, function(err) {
        if (err) {
          console.error('❌ Erro na query RUN:', err.message);
          reject(err);
        } else {
          // 'this' se refere ao contexto da query executada
          resolve({
            id: this.lastID,
            changes: this.changes
          });
        }
      });
    });
  }

  /**
   * Fecha a conexão com o banco
   */
  close() {
    return new Promise((resolve, reject) => {
      if (this.db) {
        this.db.close((err) => {
          if (err) {
            console.error('❌ Erro ao fechar banco:', err.message);
            reject(err);
          } else {
            console.log('🔒 Conexão com banco fechada');
            resolve();
          }
        });
      } else {
        resolve();
      }
    });
  }
}

// ========================================
// INSTÂNCIA SINGLETON
// ========================================

// Criar uma instância única do banco para toda a aplicação
const database = new Database();

/**
 * Inicializa o banco de dados
 * Deve ser chamado na inicialização da aplicação
 */
async function initializeDatabase() {
  try {
    await database.connect();
    await database.initialize();
    console.log('🎉 Banco de dados pronto para uso!');
    return database;
  } catch (error) {
    console.error('💥 Falha na inicialização do banco:', error.message);
    throw error;
  }
}

// ========================================
// EXPORTAÇÕES
// ========================================

module.exports = {
  database,
  initializeDatabase
}; 