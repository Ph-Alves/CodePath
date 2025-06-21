/**
 * CodePath - Sistema de Testes Automatizados
 * Fase 11 - Testes e Documentação Final
 * 
 * Este script executa uma bateria completa de testes para validar
 * a integridade do sistema CodePath, incluindo:
 * - Testes de conectividade e banco de dados
 * - Validação de rotas e controllers
 * - Verificação de arquivos essenciais
 * - Testes de componentes e interfaces
 * - Validação de dados e modelos
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const sqlite3 = require('sqlite3').verbose();

class CodePathTestRunner {
    constructor() {
        this.tests = [];
        this.results = {
            passed: 0,
            failed: 0,
            total: 0,
            details: []
        };
        this.serverUrl = 'http://localhost:4000';
        this.dbPath = path.join(__dirname, '..', 'db', 'codepath.db');
    }

    /**
     * Adiciona um teste à suite
     */
    addTest(name, testFunction) {
        this.tests.push({ name, testFunction });
    }

    /**
     * Executa todos os testes
     */
    async runAllTests() {
        console.log('🧪 CodePath - Iniciando Testes Automatizados\n');
        console.log('=' .repeat(60));
        
        // Registrar todos os testes
        this.registerTests();
        
        // Executar testes
        for (const test of this.tests) {
            await this.runTest(test);
        }
        
        // Exibir resultados finais
        this.displayResults();
    }

    /**
     * Executa um teste individual
     */
    async runTest(test) {
        this.results.total++;
        
        try {
            process.stdout.write(`${test.name}... `);
            await test.testFunction();
            console.log('✅ PASSOU');
            this.results.passed++;
            this.results.details.push({ name: test.name, status: 'PASSOU', error: null });
        } catch (error) {
            console.log('❌ FALHOU');
            console.log(`   Erro: ${error.message}`);
            this.results.failed++;
            this.results.details.push({ name: test.name, status: 'FALHOU', error: error.message });
        }
    }

    /**
     * Registra todos os testes do sistema
     */
    registerTests() {
        // Testes de Estrutura de Arquivos
        this.addTest('Verificar estrutura de pastas essenciais', () => this.testFolderStructure());
        this.addTest('Verificar arquivos principais', () => this.testMainFiles());
        this.addTest('Verificar controllers', () => this.testControllers());
        this.addTest('Verificar models', () => this.testModels());
        this.addTest('Verificar routes', () => this.testRoutes());
        this.addTest('Verificar views', () => this.testViews());
        this.addTest('Verificar arquivos CSS', () => this.testCSSFiles());
        this.addTest('Verificar arquivos JavaScript', () => this.testJSFiles());

        // Testes de Banco de Dados
        this.addTest('Conectividade com banco SQLite', () => this.testDatabaseConnection());
        this.addTest('Verificar tabelas essenciais', () => this.testDatabaseTables());
        this.addTest('Verificar dados de teste', () => this.testSeedData());

        // Testes de Dependências
        this.addTest('Verificar package.json', () => this.testPackageJson());
        this.addTest('Verificar node_modules', () => this.testNodeModules());

        // Testes de Configuração
        this.addTest('Verificar configuração do app.js', () => this.testAppConfiguration());
        this.addTest('Verificar middleware de autenticação', () => this.testAuthMiddleware());

        // Testes de Integridade de Dados
        this.addTest('Verificar dados mock de usuários', () => this.testMockUsers());
        this.addTest('Verificar dados de carreiras', () => this.testCareerData());
        this.addTest('Verificar dados de progresso', () => this.testProgressData());
    }

    /**
     * Testa estrutura de pastas
     */
    testFolderStructure() {
        const requiredFolders = [
            'controllers', 'models', 'routes', 'views', 'public',
            'db', 'middleware', 'tests', 'docs', 'views/pages',
            'views/partials', 'views/layouts', 'public/css',
            'public/js', 'public/images', 'tests/mock-data'
        ];

        for (const folder of requiredFolders) {
            const folderPath = path.join(__dirname, '..', folder);
            if (!fs.existsSync(folderPath)) {
                throw new Error(`Pasta obrigatória não encontrada: ${folder}`);
            }
        }
    }

    /**
     * Testa arquivos principais
     */
    testMainFiles() {
        const requiredFiles = [
            'app.js', 'package.json', 'README.md',
            'db/schema.sql', 'db/seed.sql'
        ];

        for (const file of requiredFiles) {
            const filePath = path.join(__dirname, '..', file);
            if (!fs.existsSync(filePath)) {
                throw new Error(`Arquivo obrigatório não encontrado: ${file}`);
            }
        }
    }

    /**
     * Testa controllers
     */
    testControllers() {
        const requiredControllers = [
            'authController.js', 'dashboardController.js', 'careerController.js',
            'contentController.js', 'quizController.js', 'progressController.js'
        ];

        for (const controller of requiredControllers) {
            const controllerPath = path.join(__dirname, '..', 'controllers', controller);
            if (!fs.existsSync(controllerPath)) {
                throw new Error(`Controller não encontrado: ${controller}`);
            }

            // Verificar se o controller exporta funções
            const controllerModule = require(controllerPath);
            if (typeof controllerModule !== 'object' || Object.keys(controllerModule).length === 0) {
                throw new Error(`Controller ${controller} não exporta funções`);
            }
        }
    }

    /**
     * Testa models
     */
    testModels() {
        const requiredModels = [
            'database.js', 'userModel.js', 'careerModel.js',
            'contentModel.js', 'quizModel.js', 'progressModel.js'
        ];

        for (const model of requiredModels) {
            const modelPath = path.join(__dirname, '..', 'models', model);
            if (!fs.existsSync(modelPath)) {
                throw new Error(`Model não encontrado: ${model}`);
            }
        }
    }

    /**
     * Testa routes
     */
    testRoutes() {
        const requiredRoutes = [
            'authRoutes.js', 'dashboardRoutes.js', 'careerRoutes.js',
            'contentRoutes.js', 'quizRoutes.js', 'progressRoutes.js'
        ];

        for (const route of requiredRoutes) {
            const routePath = path.join(__dirname, '..', 'routes', route);
            if (!fs.existsSync(routePath)) {
                throw new Error(`Route não encontrada: ${route}`);
            }
        }
    }

    /**
     * Testa views
     */
    testViews() {
        const requiredViews = [
            'layouts/main.mustache',
            'pages/login.mustache', 'pages/register.mustache', 'pages/dashboard.mustache',
            'pages/careers.mustache', 'pages/career-profiles.mustache',
            'pages/quiz.mustache', 'pages/progress.mustache',
            'partials/header.mustache', 'partials/sidebar.mustache', 'partials/footer.mustache'
        ];

        for (const view of requiredViews) {
            const viewPath = path.join(__dirname, '..', 'views', view);
            if (!fs.existsSync(viewPath)) {
                throw new Error(`View não encontrada: ${view}`);
            }
        }
    }

    /**
     * Testa arquivos CSS
     */
    testCSSFiles() {
        const requiredCSS = [
            'global.css', 'auth.css', 'dashboard.css', 'content.css',
            'quiz.css', 'progress.css', 'responsive.css'
        ];

        for (const css of requiredCSS) {
            const cssPath = path.join(__dirname, '..', 'public', 'css', css);
            if (!fs.existsSync(cssPath)) {
                throw new Error(`Arquivo CSS não encontrado: ${css}`);
            }
        }
    }

    /**
     * Testa arquivos JavaScript
     */
    testJSFiles() {
        const requiredJS = [
            'main.js', 'dashboard.js'
        ];

        for (const js of requiredJS) {
            const jsPath = path.join(__dirname, '..', 'public', 'js', js);
            if (!fs.existsSync(jsPath)) {
                throw new Error(`Arquivo JS não encontrado: ${js}`);
            }
        }
    }

    /**
     * Testa conexão com banco de dados
     */
    testDatabaseConnection() {
        return new Promise((resolve, reject) => {
            if (!fs.existsSync(this.dbPath)) {
                reject(new Error('Arquivo do banco de dados não encontrado'));
                return;
            }

            const db = new sqlite3.Database(this.dbPath, (err) => {
                if (err) {
                    reject(new Error(`Erro ao conectar com banco: ${err.message}`));
                    return;
                }

                db.close((err) => {
                    if (err) {
                        reject(new Error(`Erro ao fechar conexão: ${err.message}`));
                    } else {
                        resolve();
                    }
                });
            });
        });
    }

    /**
     * Testa tabelas do banco
     */
    testDatabaseTables() {
        return new Promise((resolve, reject) => {
            const db = new sqlite3.Database(this.dbPath);
            
            const requiredTables = [
                'users', 'career_profiles', 'packages', 'lessons',
                'quizzes', 'quiz_questions', 'quiz_options',
                'user_progress', 'user_quiz_answers', 'notifications'
            ];

            db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
                if (err) {
                    reject(new Error(`Erro ao consultar tabelas: ${err.message}`));
                    return;
                }

                const existingTables = tables.map(t => t.name);
                
                for (const table of requiredTables) {
                    if (!existingTables.includes(table)) {
                        reject(new Error(`Tabela obrigatória não encontrada: ${table}`));
                        return;
                    }
                }

                db.close();
                resolve();
            });
        });
    }

    /**
     * Testa dados de seed
     */
    testSeedData() {
        return new Promise((resolve, reject) => {
            const db = new sqlite3.Database(this.dbPath);
            
            // Verificar se existem usuários de teste
            db.get("SELECT COUNT(*) as count FROM users", (err, result) => {
                if (err) {
                    reject(new Error(`Erro ao verificar dados de seed: ${err.message}`));
                    return;
                }

                if (result.count === 0) {
                    reject(new Error('Nenhum usuário de teste encontrado no banco'));
                    return;
                }

                db.close();
                resolve();
            });
        });
    }

    /**
     * Testa package.json
     */
    testPackageJson() {
        const packagePath = path.join(__dirname, '..', 'package.json');
        const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

        const requiredDependencies = [
            'express', 'mustache-express', 'sqlite3',
            'express-session', 'bcrypt'
        ];

        for (const dep of requiredDependencies) {
            if (!packageData.dependencies || !packageData.dependencies[dep]) {
                throw new Error(`Dependência obrigatória não encontrada: ${dep}`);
            }
        }
    }

    /**
     * Testa node_modules
     */
    testNodeModules() {
        const nodeModulesPath = path.join(__dirname, '..', 'node_modules');
        if (!fs.existsSync(nodeModulesPath)) {
            throw new Error('Pasta node_modules não encontrada. Execute: npm install');
        }
    }

    /**
     * Testa configuração do app.js
     */
    testAppConfiguration() {
        const appPath = path.join(__dirname, '..', 'app.js');
        const appContent = fs.readFileSync(appPath, 'utf8');

        const requiredConfigs = [
            'express()', 'mustache-express', 'express.static',
            'express-session', 'body-parser'
        ];

        for (const config of requiredConfigs) {
            if (!appContent.includes(config)) {
                throw new Error(`Configuração obrigatória não encontrada no app.js: ${config}`);
            }
        }
    }

    /**
     * Testa middleware de autenticação
     */
    testAuthMiddleware() {
        const authPath = path.join(__dirname, '..', 'middleware', 'auth.js');
        if (!fs.existsSync(authPath)) {
            throw new Error('Middleware de autenticação não encontrado');
        }

        const authModule = require(authPath);
        if (typeof authModule.requireAuth !== 'function') {
            throw new Error('Função requireAuth não encontrada no middleware');
        }
    }

    /**
     * Testa dados mock de usuários
     */
    testMockUsers() {
        return new Promise((resolve, reject) => {
            const db = new sqlite3.Database(this.dbPath);
            
            db.all("SELECT name, email FROM users LIMIT 5", (err, users) => {
                if (err) {
                    reject(new Error(`Erro ao consultar usuários: ${err.message}`));
                    return;
                }

                if (users.length === 0) {
                    reject(new Error('Nenhum usuário encontrado para testes'));
                    return;
                }

                // Verificar se existe pelo menos um usuário com dados completos
                const completeUser = users.find(u => u.name && u.email);
                if (!completeUser) {
                    reject(new Error('Nenhum usuário com dados completos encontrado'));
                    return;
                }

                db.close();
                resolve();
            });
        });
    }

    /**
     * Testa dados de carreiras
     */
    testCareerData() {
        return new Promise((resolve, reject) => {
            const db = new sqlite3.Database(this.dbPath);
            
            db.get("SELECT COUNT(*) as count FROM careers", (err, result) => {
                if (err) {
                    reject(new Error(`Erro ao verificar carreiras: ${err.message}`));
                    return;
                }

                if (result.count === 0) {
                    reject(new Error('Nenhuma carreira encontrada no banco'));
                    return;
                }

                db.close();
                resolve();
            });
        });
    }

    /**
     * Testa dados de progresso
     */
    testProgressData() {
        return new Promise((resolve, reject) => {
            const db = new sqlite3.Database(this.dbPath);
            
            db.get("SELECT COUNT(*) as count FROM user_progress", (err, result) => {
                if (err) {
                    reject(new Error(`Erro ao verificar progresso: ${err.message}`));
                    return;
                }

                // Progresso pode estar vazio em instalação nova
                db.close();
                resolve();
            });
        });
    }

    /**
     * Exibe resultados finais
     */
    displayResults() {
        console.log('\n' + '=' .repeat(60));
        console.log('📊 RESULTADOS DOS TESTES');
        console.log('=' .repeat(60));
        
        console.log(`Total de Testes: ${this.results.total}`);
        console.log(`✅ Passou: ${this.results.passed}`);
        console.log(`❌ Falhou: ${this.results.failed}`);
        
        const successRate = ((this.results.passed / this.results.total) * 100).toFixed(1);
        console.log(`📈 Taxa de Sucesso: ${successRate}%`);
        
        if (this.results.failed > 0) {
            console.log('\n❌ TESTES QUE FALHARAM:');
            console.log('-' .repeat(40));
            this.results.details
                .filter(d => d.status === 'FALHOU')
                .forEach(detail => {
                    console.log(`• ${detail.name}`);
                    console.log(`  Erro: ${detail.error}`);
                });
        }
        
        console.log('\n' + '=' .repeat(60));
        
        if (this.results.failed === 0) {
            console.log('🎉 TODOS OS TESTES PASSARAM! Sistema íntegro.');
        } else {
            console.log('⚠️  ALGUNS TESTES FALHARAM. Verifique os erros acima.');
        }
        
        console.log('=' .repeat(60));
    }
}

// Executar testes se chamado diretamente
if (require.main === module) {
    const testRunner = new CodePathTestRunner();
    testRunner.runAllTests().catch(console.error);
}

module.exports = CodePathTestRunner; 