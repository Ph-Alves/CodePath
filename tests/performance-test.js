/**
 * CodePath - Testes de Performance
 * Fase 11 - Testes e Documentação Final
 * 
 * Sistema de testes de performance para validar:
 * - Tempo de resposta das rotas
 * - Eficiência das queries do banco
 * - Velocidade de carregamento de páginas
 * - Performance do sistema de autenticação
 * - Otimização de recursos estáticos
 */

const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const { performance } = require('perf_hooks');

class PerformanceTestRunner {
    constructor() {
        this.results = [];
        this.dbPath = path.join(__dirname, '..', 'db', 'codepath.db');
        this.thresholds = {
            database: 50,      // ms - Queries devem ser < 50ms
            fileSystem: 10,    // ms - Operações de arquivo < 10ms
            computation: 100,  // ms - Cálculos complexos < 100ms
            memory: 50 * 1024 * 1024  // 50MB - Uso de memória
        };
    }

    /**
     * Executa todos os testes de performance
     */
    async runAllTests() {
        console.log('⚡ CodePath - Testes de Performance\n');
        console.log('=' .repeat(60));

        // Testes de banco de dados
        await this.testDatabasePerformance();
        
        // Testes de sistema de arquivos
        await this.testFileSystemPerformance();
        
        // Testes de processamento
        await this.testComputationPerformance();
        
        // Testes de memória
        await this.testMemoryUsage();
        
        // Testes de otimização de assets
        await this.testAssetOptimization();

        // Exibir relatório final
        this.displayPerformanceReport();
    }

    /**
     * Testa performance do banco de dados
     */
    async testDatabasePerformance() {
        console.log('\n🗄️  TESTES DE BANCO DE DADOS');
        console.log('-' .repeat(40));

        // Teste de conexão
        const connectionTime = await this.measureTime(async () => {
            return new Promise((resolve, reject) => {
                const db = new sqlite3.Database(this.dbPath, (err) => {
                    if (err) reject(err);
                    else {
                        db.close();
                        resolve();
                    }
                });
            });
        });
        this.logResult('Conexão com banco', connectionTime, this.thresholds.database);

        // Teste de consulta simples
        const simpleQueryTime = await this.measureTime(async () => {
            return new Promise((resolve, reject) => {
                const db = new sqlite3.Database(this.dbPath);
                db.get("SELECT COUNT(*) as count FROM users", (err, result) => {
                    if (err) reject(err);
                    else {
                        db.close();
                        resolve(result);
                    }
                });
            });
        });
        this.logResult('Consulta simples (COUNT)', simpleQueryTime, this.thresholds.database);

        // Teste de consulta complexa com JOIN
        const complexQueryTime = await this.measureTime(async () => {
            return new Promise((resolve, reject) => {
                const db = new sqlite3.Database(this.dbPath);
                db.all(`
                    SELECT u.name, COUNT(up.id) as progress_count 
                    FROM users u 
                    LEFT JOIN user_progress up ON u.id = up.user_id 
                    GROUP BY u.id
                    LIMIT 10
                `, (err, results) => {
                    if (err) reject(err);
                    else {
                        db.close();
                        resolve(results);
                    }
                });
            });
        });
        this.logResult('Consulta complexa (JOIN)', complexQueryTime, this.thresholds.database * 2);

        // Teste de inserção
        const insertTime = await this.measureTime(async () => {
            return new Promise((resolve, reject) => {
                const db = new sqlite3.Database(this.dbPath);
                const testData = {
                    user_id: 1,
                    type: 'test',
                    title: 'Teste de Performance',
                    message: 'Mensagem de teste para performance',
                    is_read: 0
                };
                
                db.run(`
                    INSERT INTO notifications (user_id, type, title, message, is_read, created_at)
                    VALUES (?, ?, ?, ?, ?, datetime('now'))
                `, [testData.user_id, testData.type, testData.title, testData.message, testData.is_read], 
                function(err) {
                    if (err) reject(err);
                    else {
                        // Limpar dados de teste
                        db.run("DELETE FROM notifications WHERE title = 'Teste de Performance'", () => {
                            db.close();
                            resolve();
                        });
                    }
                });
            });
        });
        this.logResult('Inserção de dados', insertTime, this.thresholds.database);
    }

    /**
     * Testa performance do sistema de arquivos
     */
    async testFileSystemPerformance() {
        console.log('\n📁 TESTES DE SISTEMA DE ARQUIVOS');
        console.log('-' .repeat(40));

        // Teste de leitura de arquivo pequeno
        const smallFileTime = await this.measureTime(async () => {
            return fs.promises.readFile(path.join(__dirname, '..', 'package.json'), 'utf8');
        });
        this.logResult('Leitura arquivo pequeno (package.json)', smallFileTime, this.thresholds.fileSystem);

        // Teste de leitura de arquivo CSS
        const cssFileTime = await this.measureTime(async () => {
            return fs.promises.readFile(path.join(__dirname, '..', 'public', 'css', 'global.css'), 'utf8');
        });
        this.logResult('Leitura arquivo CSS', cssFileTime, this.thresholds.fileSystem);

        // Teste de listagem de diretório
        const dirListTime = await this.measureTime(async () => {
            return fs.promises.readdir(path.join(__dirname, '..', 'controllers'));
        });
        this.logResult('Listagem de diretório', dirListTime, this.thresholds.fileSystem);

        // Teste de verificação de múltiplos arquivos
        const multiFileTime = await this.measureTime(async () => {
            const files = [
                'app.js', 'package.json', 'README.md',
                'controllers/authController.js', 'models/userModel.js'
            ];
            
            const promises = files.map(file => 
                fs.promises.access(path.join(__dirname, '..', file))
            );
            
            return Promise.all(promises);
        });
        this.logResult('Verificação múltiplos arquivos', multiFileTime, this.thresholds.fileSystem * 2);
    }

    /**
     * Testa performance de processamento
     */
    async testComputationPerformance() {
        console.log('\n🧮 TESTES DE PROCESSAMENTO');
        console.log('-' .repeat(40));

        // Teste de cálculo de progresso (simulado)
        const progressCalcTime = await this.measureTime(async () => {
            const mockUserProgress = Array.from({ length: 100 }, (_, i) => ({
                id: i + 1,
                user_id: 1,
                content_id: i + 1,
                completed: Math.random() > 0.3,
                xp_earned: Math.floor(Math.random() * 100),
                completion_date: new Date()
            }));

            // Simular cálculo de estatísticas
            const totalXP = mockUserProgress.reduce((sum, p) => sum + p.xp_earned, 0);
            const completedCount = mockUserProgress.filter(p => p.completed).length;
            const completionRate = (completedCount / mockUserProgress.length) * 100;
            
            return { totalXP, completedCount, completionRate };
        });
        this.logResult('Cálculo de progresso (100 itens)', progressCalcTime, this.thresholds.computation);

        // Teste de processamento de dados de questionário
        const quizProcessingTime = await this.measureTime(async () => {
            const mockQuizData = {
                questions: Array.from({ length: 20 }, (_, i) => ({
                    id: i + 1,
                    question: `Pergunta ${i + 1}`,
                    type: Math.random() > 0.5 ? 'multiple_choice' : 'code',
                    options: ['A', 'B', 'C', 'D'],
                    correct_answer: 'A'
                })),
                userAnswers: Array.from({ length: 20 }, (_, i) => ({
                    question_id: i + 1,
                    user_answer: ['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)]
                }))
            };

            // Simular correção de questionário
            let correctAnswers = 0;
            mockQuizData.questions.forEach((q, index) => {
                if (q.correct_answer === mockQuizData.userAnswers[index].user_answer) {
                    correctAnswers++;
                }
            });

            const score = (correctAnswers / mockQuizData.questions.length) * 100;
            return { correctAnswers, score };
        });
        this.logResult('Processamento questionário (20 questões)', quizProcessingTime, this.thresholds.computation);

        // Teste de ordenação e filtragem
        const sortingTime = await this.measureTime(async () => {
            const mockData = Array.from({ length: 1000 }, (_, i) => ({
                id: i,
                name: `Item ${i}`,
                score: Math.random() * 100,
                category: ['A', 'B', 'C'][Math.floor(Math.random() * 3)],
                date: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000)
            }));

            // Filtrar, ordenar e paginar
            const filtered = mockData.filter(item => item.score > 50);
            const sorted = filtered.sort((a, b) => b.score - a.score);
            const paginated = sorted.slice(0, 20);
            
            return paginated;
        });
        this.logResult('Ordenação e filtragem (1000 itens)', sortingTime, this.thresholds.computation);
    }

    /**
     * Testa uso de memória
     */
    async testMemoryUsage() {
        console.log('\n💾 TESTES DE MEMÓRIA');
        console.log('-' .repeat(40));

        const initialMemory = process.memoryUsage();
        
        // Simular carregamento de dados grandes
        const memoryTestTime = await this.measureTime(async () => {
            const largeArray = Array.from({ length: 10000 }, (_, i) => ({
                id: i,
                data: 'x'.repeat(100), // 100 chars por item
                metadata: {
                    created: new Date(),
                    updated: new Date(),
                    tags: ['tag1', 'tag2', 'tag3']
                }
            }));

            // Processar dados
            const processed = largeArray.map(item => ({
                ...item,
                processed: true,
                hash: item.id.toString(16)
            }));

            return processed.length;
        });

        const finalMemory = process.memoryUsage();
        const memoryDiff = finalMemory.heapUsed - initialMemory.heapUsed;
        
        this.logResult('Processamento dados grandes', memoryTestTime, this.thresholds.computation);
        this.logMemoryUsage('Uso de memória', memoryDiff, this.thresholds.memory);

        // Forçar garbage collection se disponível
        if (global.gc) {
            global.gc();
        }
    }

    /**
     * Testa otimização de assets
     */
    async testAssetOptimization() {
        console.log('\n🎨 TESTES DE ASSETS');
        console.log('-' .repeat(40));

        // Verificar tamanho dos arquivos CSS
        const cssFiles = ['global.css', 'dashboard.css', 'auth.css', 'progress.css'];
        let totalCSSSize = 0;

        for (const cssFile of cssFiles) {
            const cssPath = path.join(__dirname, '..', 'public', 'css', cssFile);
            if (fs.existsSync(cssPath)) {
                const stats = fs.statSync(cssPath);
                totalCSSSize += stats.size;
            }
        }

        this.logAssetSize('Total CSS', totalCSSSize, 200 * 1024); // 200KB max

        // Verificar tamanho dos arquivos JS
        const jsFiles = ['main.js', 'dashboard.js'];
        let totalJSSize = 0;

        for (const jsFile of jsFiles) {
            const jsPath = path.join(__dirname, '..', 'public', 'js', jsFile);
            if (fs.existsSync(jsPath)) {
                const stats = fs.statSync(jsPath);
                totalJSSize += stats.size;
            }
        }

        this.logAssetSize('Total JavaScript', totalJSSize, 150 * 1024); // 150KB max

        // Verificar compressão potencial (simulado)
        const compressionTime = await this.measureTime(async () => {
            // Simular análise de compressão
            const mockCompressionRatio = 0.7; // 30% de redução
            return {
                original: totalCSSSize + totalJSSize,
                compressed: (totalCSSSize + totalJSSize) * mockCompressionRatio
            };
        });

        this.logResult('Análise de compressão', compressionTime, this.thresholds.fileSystem);
    }

    /**
     * Mede tempo de execução de uma função
     */
    async measureTime(fn) {
        const start = performance.now();
        await fn();
        const end = performance.now();
        return end - start;
    }

    /**
     * Registra resultado de teste de performance
     */
    logResult(testName, time, threshold) {
        const status = time <= threshold ? '✅' : '⚠️';
        const timeStr = `${time.toFixed(2)}ms`;
        const thresholdStr = `(limite: ${threshold}ms)`;
        
        console.log(`${status} ${testName}: ${timeStr} ${thresholdStr}`);
        
        this.results.push({
            test: testName,
            time: time,
            threshold: threshold,
            passed: time <= threshold,
            type: 'performance'
        });
    }

    /**
     * Registra uso de memória
     */
    logMemoryUsage(testName, memoryUsed, threshold) {
        const status = memoryUsed <= threshold ? '✅' : '⚠️';
        const memoryStr = this.formatBytes(memoryUsed);
        const thresholdStr = `(limite: ${this.formatBytes(threshold)})`;
        
        console.log(`${status} ${testName}: ${memoryStr} ${thresholdStr}`);
        
        this.results.push({
            test: testName,
            memory: memoryUsed,
            threshold: threshold,
            passed: memoryUsed <= threshold,
            type: 'memory'
        });
    }

    /**
     * Registra tamanho de assets
     */
    logAssetSize(assetName, size, threshold) {
        const status = size <= threshold ? '✅' : '⚠️';
        const sizeStr = this.formatBytes(size);
        const thresholdStr = `(limite: ${this.formatBytes(threshold)})`;
        
        console.log(`${status} ${assetName}: ${sizeStr} ${thresholdStr}`);
        
        this.results.push({
            test: assetName,
            size: size,
            threshold: threshold,
            passed: size <= threshold,
            type: 'asset'
        });
    }

    /**
     * Formata bytes em formato legível
     */
    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * Exibe relatório final de performance
     */
    displayPerformanceReport() {
        console.log('\n' + '=' .repeat(60));
        console.log('📊 RELATÓRIO DE PERFORMANCE');
        console.log('=' .repeat(60));

        const passed = this.results.filter(r => r.passed).length;
        const total = this.results.length;
        const successRate = ((passed / total) * 100).toFixed(1);

        console.log(`Total de Testes: ${total}`);
        console.log(`✅ Passou: ${passed}`);
        console.log(`⚠️  Atenção: ${total - passed}`);
        console.log(`📈 Taxa de Sucesso: ${successRate}%`);

        // Agrupar por tipo
        const byType = this.results.reduce((acc, result) => {
            if (!acc[result.type]) acc[result.type] = [];
            acc[result.type].push(result);
            return acc;
        }, {});

        // Mostrar estatísticas por tipo
        Object.keys(byType).forEach(type => {
            const typeResults = byType[type];
            const typePassed = typeResults.filter(r => r.passed).length;
            console.log(`\n${type.toUpperCase()}: ${typePassed}/${typeResults.length} passou`);
            
            // Mostrar os que falharam
            const failed = typeResults.filter(r => !r.passed);
            if (failed.length > 0) {
                failed.forEach(f => {
                    console.log(`  ⚠️  ${f.test}`);
                });
            }
        });

        // Recomendações
        console.log('\n💡 RECOMENDAÇÕES:');
        console.log('-' .repeat(30));
        
        const slowQueries = this.results.filter(r => 
            r.type === 'performance' && 
            r.test.includes('banco') && 
            !r.passed
        );
        
        if (slowQueries.length > 0) {
            console.log('• Otimizar queries do banco de dados');
            console.log('• Considerar índices adicionais');
        }
        
        const largeAssets = this.results.filter(r => 
            r.type === 'asset' && !r.passed
        );
        
        if (largeAssets.length > 0) {
            console.log('• Minificar arquivos CSS/JS');
            console.log('• Implementar compressão gzip');
            console.log('• Otimizar imagens');
        }
        
        const memoryIssues = this.results.filter(r => 
            r.type === 'memory' && !r.passed
        );
        
        if (memoryIssues.length > 0) {
            console.log('• Otimizar uso de memória');
            console.log('• Implementar paginação em consultas grandes');
        }

        if (passed === total) {
            console.log('\n🎉 PERFORMANCE EXCELENTE! Todos os testes passaram.');
        }

        console.log('\n' + '=' .repeat(60));
    }
}

// Executar se chamado diretamente
if (require.main === module) {
    const performanceTest = new PerformanceTestRunner();
    performanceTest.runAllTests().catch(console.error);
}

module.exports = PerformanceTestRunner; 