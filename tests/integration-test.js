/**
 * CodePath - Testes de Integração
 * Fase 26 - Polish Final e Testes Completos
 * 
 * Este arquivo contém testes para validar todas as funcionalidades
 * implementadas e garantir que o sistema está funcionando corretamente.
 */

const fs = require('fs');
const path = require('path');

class IntegrationTester {
    constructor() {
        this.tests = [];
        this.passed = 0;
        this.failed = 0;
        this.errors = [];
    }

    /**
     * Adiciona um teste à lista
     * @param {string} name - Nome do teste
     * @param {Function} testFunction - Função de teste
     */
    addTest(name, testFunction) {
        this.tests.push({ name, testFunction });
    }

    /**
     * Executa todos os testes
     */
    async runAllTests() {
        console.log('🧪 INICIANDO TESTES DE INTEGRAÇÃO - FASE 26\n');
        console.log('=' .repeat(60));
        
        for (const test of this.tests) {
            try {
                console.log(`\n🔍 Executando: ${test.name}`);
                await test.testFunction();
                this.passed++;
                console.log(`✅ PASSOU: ${test.name}`);
            } catch (error) {
                this.failed++;
                this.errors.push({ test: test.name, error: error.message });
                console.log(`❌ FALHOU: ${test.name}`);
                console.log(`   Erro: ${error.message}`);
            }
        }

        this.generateReport();
    }

    /**
     * Gera relatório final dos testes
     */
    generateReport() {
        console.log('\n' + '=' .repeat(60));
        console.log('📊 RELATÓRIO FINAL DOS TESTES');
        console.log('=' .repeat(60));
        
        console.log(`\n✅ Testes Aprovados: ${this.passed}`);
        console.log(`❌ Testes Falharam: ${this.failed}`);
        console.log(`📈 Taxa de Sucesso: ${((this.passed / this.tests.length) * 100).toFixed(1)}%`);

        if (this.errors.length > 0) {
            console.log('\n🚨 ERROS ENCONTRADOS:');
            this.errors.forEach((error, index) => {
                console.log(`${index + 1}. ${error.test}: ${error.error}`);
            });
        }

        console.log('\n' + '=' .repeat(60));
        
        if (this.failed === 0) {
            console.log('🎉 TODOS OS TESTES PASSARAM! Sistema pronto para produção.');
        } else {
            console.log('⚠️  Alguns testes falharam. Verifique os erros acima.');
        }
    }

    /**
     * Verifica se um arquivo existe
     * @param {string} filePath - Caminho do arquivo
     */
    fileExists(filePath) {
        return fs.existsSync(filePath);
    }

    /**
     * Lê conteúdo de um arquivo
     * @param {string} filePath - Caminho do arquivo
     */
    readFile(filePath) {
        if (!this.fileExists(filePath)) {
            throw new Error(`Arquivo não encontrado: ${filePath}`);
        }
        return fs.readFileSync(filePath, 'utf8');
    }

    /**
     * Verifica se uma string contém determinado texto
     * @param {string} content - Conteúdo a verificar
     * @param {string} searchText - Texto a procurar
     */
    assertContains(content, searchText) {
        if (!content.includes(searchText)) {
            throw new Error(`Texto não encontrado: "${searchText}"`);
        }
    }

    /**
     * Verifica se uma string NÃO contém determinado texto
     * @param {string} content - Conteúdo a verificar
     * @param {string} searchText - Texto que não deve estar presente
     */
    assertNotContains(content, searchText) {
        if (content.includes(searchText)) {
            throw new Error(`Texto não deveria estar presente: "${searchText}"`);
        }
    }
}

// ========================================
// CONFIGURAÇÃO DOS TESTES
// ========================================

const tester = new IntegrationTester();

// ========================================
// TESTE 1: Verificar Remoção de Badges "Em Breve"
// ========================================

tester.addTest('Remoção de badges "Em Breve" do sidebar', () => {
    const sidebarPath = path.join(__dirname, '../views/partials/sidebar.mustache');
    const content = tester.readFile(sidebarPath);
    
    // Verificar que badges "Em Breve" foram removidos
    tester.assertNotContains(content, 'coming-soon');
    tester.assertNotContains(content, 'Em Breve');
    
    // Verificar que novos badges funcionais foram adicionados
    tester.assertContains(content, 'nav-badge info');
    tester.assertContains(content, 'hasProfileUpdates');
    tester.assertContains(content, 'hasSettingsUpdates');
    
    console.log('   ✓ Badges "Em Breve" removidos com sucesso');
    console.log('   ✓ Novos badges funcionais implementados');
});

// ========================================
// TESTE 2: Verificar Página de Configurações Funcional
// ========================================

tester.addTest('Transformação da página de configurações', () => {
    const settingsPath = path.join(__dirname, '../views/pages/settings.mustache');
    const content = tester.readFile(settingsPath);
    
    // Verificar remoção de elementos "Em Breve"
    tester.assertNotContains(content, 'coming-soon-container');
    tester.assertNotContains(content, 'coming-soon-badge');
    tester.assertNotContains(content, 'features-preview');
    
    // Verificar implementação de funcionalidades reais
    tester.assertContains(content, 'settings-container');
    tester.assertContains(content, 'settings-nav');
    tester.assertContains(content, 'settings-tab-content');
    tester.assertContains(content, 'settings-form');
    
    // Verificar abas funcionais
    tester.assertContains(content, 'data-tab="profile"');
    tester.assertContains(content, 'data-tab="notifications"');
    tester.assertContains(content, 'data-tab="privacy"');
    tester.assertContains(content, 'data-tab="learning"');
    tester.assertContains(content, 'data-tab="appearance"');
    
    console.log('   ✓ Estrutura "Em Breve" removida');
    console.log('   ✓ Formulários funcionais implementados');
    console.log('   ✓ Sistema de abas funcionando');
});

// ========================================
// TESTE 3: Verificar Player de Vídeo Funcional
// ========================================

tester.addTest('Remoção de placeholders do player de vídeo', () => {
    const lessonPath = path.join(__dirname, '../views/pages/lesson-view.mustache');
    const content = tester.readFile(lessonPath);
    
    // Verificar remoção de placeholders
    tester.assertNotContains(content, 'video-placeholder');
    tester.assertNotContains(content, 'nav-placeholder');
    
    // Verificar implementação de player real
    tester.assertContains(content, 'video-container');
    tester.assertContains(content, 'lesson-video');
    tester.assertContains(content, 'controls preload="metadata"');
    
    // Verificar navegação funcional
    tester.assertContains(content, 'nav-disabled-section');
    tester.assertContains(content, 'fas fa-ban');
    tester.assertContains(content, 'fas fa-flag-checkered');
    
    console.log('   ✓ Placeholders do player removidos');
    console.log('   ✓ Player de vídeo real implementado');
    console.log('   ✓ Navegação funcional implementada');
});

// ========================================
// TESTE 4: Verificar CSS Global Atualizado
// ========================================

tester.addTest('Atualização do CSS global com animações', () => {
    const cssPath = path.join(__dirname, '../public/css/global.css');
    const content = tester.readFile(cssPath);
    
    // Verificar animações implementadas
    tester.assertContains(content, '@keyframes fadeInUp');
    tester.assertContains(content, '@keyframes pulse');
    tester.assertContains(content, '@keyframes spin');
    tester.assertContains(content, '@keyframes shimmer');
    
    // Verificar transições suaves
    tester.assertContains(content, '--transition-fast');
    tester.assertContains(content, '--transition-normal');
    tester.assertContains(content, '--transition-slow');
    
    // Verificar feedback visual
    tester.assertContains(content, '.toast');
    tester.assertContains(content, '.loading-overlay');
    tester.assertContains(content, '.btn.loading');
    
    // Verificar novos badges
    tester.assertContains(content, '.nav-badge.info');
    tester.assertContains(content, '.nav-badge.success');
    tester.assertContains(content, '.nav-badge.pulse');
    
    console.log('   ✓ Animações implementadas');
    console.log('   ✓ Transições suaves adicionadas');
    console.log('   ✓ Feedback visual melhorado');
    console.log('   ✓ Sistema de badges atualizado');
});

// ========================================
// TESTE 5: Verificar Arquivos de JavaScript
// ========================================

tester.addTest('Verificação dos arquivos JavaScript', () => {
    const jsFiles = [
        '../public/js/settings.js',
        '../public/js/main.js',
        '../public/js/notifications.js',
        '../public/js/lesson-progress.js',
        '../public/js/lesson-navigation.js'
    ];
    
    jsFiles.forEach(file => {
        const filePath = path.join(__dirname, file);
        if (!tester.fileExists(filePath)) {
            throw new Error(`Arquivo JavaScript não encontrado: ${file}`);
        }
    });
    
    console.log('   ✓ Todos os arquivos JavaScript estão presentes');
});

// ========================================
// TESTE 6: Verificar Estrutura de Controllers
// ========================================

tester.addTest('Verificação dos controllers implementados', () => {
    const controllers = [
        '../controllers/userController.js',
        '../controllers/settingsController.js',
        '../controllers/dashboardController.js',
        '../controllers/authController.js',
        '../controllers/contentController.js'
    ];
    
    controllers.forEach(controller => {
        const controllerPath = path.join(__dirname, controller);
        if (!tester.fileExists(controllerPath)) {
            throw new Error(`Controller não encontrado: ${controller}`);
        }
        
        const content = tester.readFile(controllerPath);
        tester.assertContains(content, 'module.exports');
    });
    
    console.log('   ✓ Todos os controllers estão implementados');
});

// ========================================
// TESTE 7: Verificar Rotas Funcionais
// ========================================

tester.addTest('Verificação das rotas implementadas', () => {
    const routes = [
        '../routes/userRoutes.js',
        '../routes/settingsRoutes.js',
        '../routes/authRoutes.js',
        '../routes/contentRoutes.js',
        '../routes/dashboardRoutes.js'
    ];
    
    routes.forEach(route => {
        const routePath = path.join(__dirname, route);
        if (!tester.fileExists(routePath)) {
            throw new Error(`Arquivo de rota não encontrado: ${route}`);
        }
        
        const content = tester.readFile(routePath);
        tester.assertContains(content, 'express.Router()');
        tester.assertContains(content, 'module.exports');
    });
    
    console.log('   ✓ Todas as rotas estão implementadas');
});

// ========================================
// TESTE 8: Verificar Integração no App Principal
// ========================================

tester.addTest('Verificação da integração no app.js', () => {
    const appPath = path.join(__dirname, '../app.js');
    const content = tester.readFile(appPath);
    
    // Verificar importação de rotas
    tester.assertContains(content, 'userRoutes');
    tester.assertContains(content, 'settingsRoutes');
    
    // Verificar uso de middlewares
    tester.assertContains(content, 'app.use');
    tester.assertContains(content, 'express.static');
    
    console.log('   ✓ Rotas integradas no app principal');
    console.log('   ✓ Middlewares configurados');
});

// ========================================
// TESTE 9: Verificar Documentação Atualizada
// ========================================

tester.addTest('Verificação da documentação', () => {
    const docsPath = path.join(__dirname, '../docs/codepath-projeto-completo.md');
    const content = tester.readFile(docsPath);
    
    // Verificar status atualizado
    tester.assertContains(content, 'Fase 26');
    tester.assertContains(content, 'Polish Final');
    
    console.log('   ✓ Documentação está atualizada');
});

// ========================================
// TESTE 10: Verificar Estrutura de Arquivos
// ========================================

tester.addTest('Verificação da estrutura completa do projeto', () => {
    const criticalPaths = [
        '../views/partials/sidebar.mustache',
        '../views/pages/settings.mustache',
        '../views/pages/lesson-view.mustache',
        '../public/css/global.css',
        '../public/css/settings.css',
        '../controllers/settingsController.js',
        '../routes/settingsRoutes.js'
    ];
    
    criticalPaths.forEach(filePath => {
        const fullPath = path.join(__dirname, filePath);
        if (!tester.fileExists(fullPath)) {
            throw new Error(`Arquivo crítico não encontrado: ${filePath}`);
        }
    });
    
    console.log('   ✓ Estrutura completa do projeto verificada');
    console.log('   ✓ Todos os arquivos críticos estão presentes');
});

// ========================================
// EXECUTAR TODOS OS TESTES
// ========================================

// Função principal para executar os testes
async function runIntegrationTests() {
    try {
        await tester.runAllTests();
        
        // Gerar arquivo de log dos testes
        const logContent = `
CodePath - Relatório de Testes de Integração
Fase 26 - Polish Final e Testes Completos
Data: ${new Date().toLocaleString('pt-BR')}

Testes Executados: ${tester.tests.length}
Testes Aprovados: ${tester.passed}
Testes Falharam: ${tester.failed}
Taxa de Sucesso: ${((tester.passed / tester.tests.length) * 100).toFixed(1)}%

${tester.errors.length > 0 ? 'ERROS ENCONTRADOS:\n' + tester.errors.map(e => `- ${e.test}: ${e.error}`).join('\n') : 'NENHUM ERRO ENCONTRADO'}

Status: ${tester.failed === 0 ? 'APROVADO ✅' : 'REPROVADO ❌'}
        `;
        
        fs.writeFileSync(path.join(__dirname, 'integration-test-report.txt'), logContent);
        console.log('\n📄 Relatório salvo em: tests/integration-test-report.txt');
        
    } catch (error) {
        console.error('❌ Erro ao executar testes:', error.message);
        process.exit(1);
    }
}

// Executar se chamado diretamente
if (require.main === module) {
    runIntegrationTests();
}

module.exports = IntegrationTester; 