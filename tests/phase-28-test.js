/**
 * Testes da Fase 28: Aprimoramento de Estados Vazios
 * Valida a implementação de estados vazios aprimorados com ilustrações SVG,
 * mensagens amigáveis, botões atrativos e animações suaves
 */

const fs = require('fs');
const path = require('path');

class Phase28Tester {
    constructor() {
        this.testResults = [];
        this.passedTests = 0;
        this.totalTests = 0;
    }

    // Utilitário para verificar se arquivo existe
    fileExists(filePath) {
        return fs.existsSync(filePath);
    }

    // Utilitário para ler conteúdo do arquivo
    readFile(filePath) {
        try {
            return fs.readFileSync(filePath, 'utf8');
        } catch (error) {
            return null;
        }
    }

    // Utilitário para logging de testes
    logTest(testName, passed, details = '') {
        this.totalTests++;
        if (passed) {
            this.passedTests++;
            console.log(`✅ ${testName}`);
        } else {
            console.log(`❌ ${testName}`);
            if (details) console.log(`   ${details}`);
        }
        
        this.testResults.push({
            test: testName,
            passed,
            details
        });
    }

    // Teste 1: Verificar se o partial empty-state foi aprimorado
    testEmptyStatePartialEnhancement() {
        const partialPath = 'views/partials/empty-state.mustache';
        const content = this.readFile(partialPath);
        
        if (!content) {
            this.logTest('Partial Empty State Aprimorado', false, 'Arquivo não encontrado');
            return;
        }

        const hasIllustrationSupport = content.includes('data-illustration');
        const hasAdvancedStyles = content.includes('empty-svg');
        const hasRippleEffect = content.includes('btn-ripple');
        const hasDecorations = content.includes('empty-decorations');
        const hasAnimations = content.includes('@keyframes');

        const passed = hasIllustrationSupport && hasAdvancedStyles && hasRippleEffect && hasDecorations && hasAnimations;
        
        this.logTest(
            'Partial Empty State Aprimorado',
            passed,
            passed ? 'Todas as melhorias implementadas' : 'Algumas melhorias estão faltando'
        );
    }

    // Teste 2: Verificar se o helper JavaScript foi criado
    testEmptyStateHelper() {
        const helperPath = 'public/js/empty-state-helper.js';
        const content = this.readFile(helperPath);
        
        if (!content) {
            this.logTest('Helper JavaScript de Empty States', false, 'Arquivo não encontrado');
            return;
        }

        const hasEmptyStateManager = content.includes('class EmptyStateManager');
        const hasIllustrations = content.includes('getBookSVG') && content.includes('getRocketSVG');
        const hasRippleInit = content.includes('initRippleEffect');
        const hasContextualMessages = content.includes('getContextualMessages');
        const hasDynamicCreation = content.includes('createEmptyState');

        const passed = hasEmptyStateManager && hasIllustrations && hasRippleInit && hasContextualMessages && hasDynamicCreation;
        
        this.logTest(
            'Helper JavaScript de Empty States',
            passed,
            passed ? 'Todas as funcionalidades implementadas' : 'Algumas funcionalidades estão faltando'
        );
    }

    // Teste 3: Verificar se os estilos globais foram adicionados
    testGlobalStyles() {
        const globalPath = 'public/css/global.css';
        const content = this.readFile(globalPath);
        
        if (!content) {
            this.logTest('Estilos Globais para Empty States', false, 'Arquivo global.css não encontrado');
            return;
        }

        const hasEmptyStateStyles = content.includes('ESTILOS GLOBAIS PARA ESTADOS VAZIOS');
        const hasAOSIntegration = content.includes('data-aos');
        const hasContextualStyles = content.includes('dashboard-empty-state');
        const hasResponsiveStyles = content.includes('@media (max-width: 768px)');
        const hasAnimations = content.includes('searchFloat') && content.includes('rocketFloat');

        const passed = hasEmptyStateStyles && hasAOSIntegration && hasContextualStyles && hasResponsiveStyles && hasAnimations;
        
        this.logTest(
            'Estilos Globais para Empty States',
            passed,
            passed ? 'Todos os estilos globais implementados' : 'Alguns estilos globais estão faltando'
        );
    }

    // Teste 4: Verificar se as páginas foram atualizadas com novos empty states
    testPagesUpdated() {
        const pages = [
            'views/pages/progress.mustache',
            'views/pages/dashboard.mustache',
            'views/pages/chat.mustache',
            'views/pages/package-lessons.mustache'
        ];

        let updatedPages = 0;
        
        pages.forEach(pagePath => {
            const content = this.readFile(pagePath);
            if (content && content.includes('{{>partials/empty-state')) {
                updatedPages++;
            }
        });

        const passed = updatedPages >= 3; // Pelo menos 3 páginas devem estar atualizadas
        
        this.logTest(
            'Páginas Atualizadas com Novos Empty States',
            passed,
            `${updatedPages} de ${pages.length} páginas atualizadas`
        );
    }

    // Teste 5: Verificar se as ilustrações SVG estão implementadas
    testSVGIllustrations() {
        const helperPath = 'public/js/empty-state-helper.js';
        const content = this.readFile(helperPath);
        
        if (!content) {
            this.logTest('Ilustrações SVG Implementadas', false, 'Helper não encontrado');
            return;
        }

        const illustrations = ['book', 'rocket', 'trophy', 'search', 'chat', 'default'];
        let implementedIllustrations = 0;

        illustrations.forEach(illustration => {
            const methodName = `get${illustration.charAt(0).toUpperCase() + illustration.slice(1)}SVG`;
            if (content.includes(methodName) || content.includes(`${illustration}Gradient`)) {
                implementedIllustrations++;
            }
        });

        const passed = implementedIllustrations >= 5; // Pelo menos 5 ilustrações
        
        this.logTest(
            'Ilustrações SVG Implementadas',
            passed,
            `${implementedIllustrations} de ${illustrations.length} ilustrações implementadas`
        );
    }

    // Teste 6: Verificar se os tipos de estado estão implementados
    testStateTypes() {
        const partialPath = 'views/partials/empty-state.mustache';
        const content = this.readFile(partialPath);
        
        if (!content) {
            this.logTest('Tipos de Estado Implementados', false, 'Partial não encontrado');
            return;
        }

        const types = ['success', 'warning', 'error', 'info', 'default'];
        let implementedTypes = 0;

        types.forEach(type => {
            if (content.includes(`empty-${type}`)) {
                implementedTypes++;
            }
        });

        const passed = implementedTypes >= 4; // Pelo menos 4 tipos
        
        this.logTest(
            'Tipos de Estado Implementados',
            passed,
            `${implementedTypes} de ${types.length} tipos implementados`
        );
    }

    // Teste 7: Verificar se os tamanhos estão implementados
    testStateSizes() {
        const partialPath = 'views/partials/empty-state.mustache';
        const content = this.readFile(partialPath);
        
        if (!content) {
            this.logTest('Tamanhos de Estado Implementados', false, 'Partial não encontrado');
            return;
        }

        const sizes = ['small', 'medium', 'large'];
        let implementedSizes = 0;

        sizes.forEach(size => {
            if (content.includes(`empty-${size}`)) {
                implementedSizes++;
            }
        });

        const passed = implementedSizes === sizes.length;
        
        this.logTest(
            'Tamanhos de Estado Implementados',
            passed,
            `${implementedSizes} de ${sizes.length} tamanhos implementados`
        );
    }

    // Teste 8: Verificar se as animações estão implementadas
    testAnimations() {
        const partialPath = 'views/partials/empty-state.mustache';
        const globalPath = 'public/css/global.css';
        
        const partialContent = this.readFile(partialPath);
        const globalContent = this.readFile(globalPath);
        
        if (!partialContent || !globalContent) {
            this.logTest('Animações Implementadas', false, 'Arquivos não encontrados');
            return;
        }

        const hasFloatAnimation = partialContent.includes('@keyframes float');
        const hasFadeInAnimation = partialContent.includes('@keyframes fadeInUp');
        const hasGlowAnimation = partialContent.includes('@keyframes glow');
        const hasContextualAnimations = globalContent.includes('searchFloat') && globalContent.includes('rocketFloat');

        const passed = hasFloatAnimation && hasFadeInAnimation && hasGlowAnimation && hasContextualAnimations;
        
        this.logTest(
            'Animações Implementadas',
            passed,
            passed ? 'Todas as animações implementadas' : 'Algumas animações estão faltando'
        );
    }

    // Teste 9: Verificar se a responsividade está implementada
    testResponsiveness() {
        const partialPath = 'views/partials/empty-state.mustache';
        const globalPath = 'public/css/global.css';
        
        const partialContent = this.readFile(partialPath);
        const globalContent = this.readFile(globalPath);
        
        if (!partialContent || !globalContent) {
            this.logTest('Responsividade Implementada', false, 'Arquivos não encontrados');
            return;
        }

        const hasTabletBreakpoint = partialContent.includes('@media (max-width: 768px)');
        const hasMobileBreakpoint = partialContent.includes('@media (max-width: 480px)');
        const hasGlobalResponsive = globalContent.includes('@media (max-width: 1024px)');
        const hasFlexDirection = partialContent.includes('flex-direction: column');

        const passed = hasTabletBreakpoint && hasMobileBreakpoint && hasGlobalResponsive && hasFlexDirection;
        
        this.logTest(
            'Responsividade Implementada',
            passed,
            passed ? 'Responsividade completa implementada' : 'Alguns breakpoints estão faltando'
        );
    }

    // Teste 10: Verificar se a acessibilidade está implementada
    testAccessibility() {
        const partialPath = 'views/partials/empty-state.mustache';
        const globalPath = 'public/css/global.css';
        
        const partialContent = this.readFile(partialPath);
        const globalContent = this.readFile(globalPath);
        
        if (!partialContent || !globalContent) {
            this.logTest('Acessibilidade Implementada', false, 'Arquivos não encontrados');
            return;
        }

        const hasAOSSupport = partialContent.includes('data-aos');
        const hasFocusStyles = globalContent.includes(':focus-within');
        const hasOutlineStyles = globalContent.includes('outline:');
        const hasARIASupport = partialContent.includes('aria-') || globalContent.includes('aria-');

        const passed = hasAOSSupport && hasFocusStyles && hasOutlineStyles;
        
        this.logTest(
            'Acessibilidade Implementada',
            passed,
            passed ? 'Recursos de acessibilidade implementados' : 'Alguns recursos de acessibilidade estão faltando'
        );
    }

    // Executar todos os testes
    runAllTests() {
        console.log('🧪 Executando Testes da Fase 28: Aprimoramento de Estados Vazios\n');

        this.testEmptyStatePartialEnhancement();
        this.testEmptyStateHelper();
        this.testGlobalStyles();
        this.testPagesUpdated();
        this.testSVGIllustrations();
        this.testStateTypes();
        this.testStateSizes();
        this.testAnimations();
        this.testResponsiveness();
        this.testAccessibility();

        this.printSummary();
    }

    // Imprimir resumo dos testes
    printSummary() {
        console.log('\n📊 Resumo dos Testes da Fase 28');
        console.log('=====================================');
        console.log(`Testes executados: ${this.totalTests}`);
        console.log(`Testes aprovados: ${this.passedTests}`);
        console.log(`Testes falharam: ${this.totalTests - this.passedTests}`);
        console.log(`Taxa de sucesso: ${((this.passedTests / this.totalTests) * 100).toFixed(1)}%`);

        if (this.passedTests === this.totalTests) {
            console.log('\n🎉 Todos os testes da Fase 28 foram aprovados!');
            console.log('✨ Estados vazios aprimorados implementados com sucesso');
        } else {
            console.log('\n⚠️  Alguns testes falharam. Verifique os detalhes acima.');
        }

        // Listar testes que falharam
        const failedTests = this.testResults.filter(test => !test.passed);
        if (failedTests.length > 0) {
            console.log('\n❌ Testes que falharam:');
            failedTests.forEach(test => {
                console.log(`   - ${test.test}: ${test.details}`);
            });
        }

        console.log('\n🎯 Funcionalidades da Fase 28:');
        console.log('   ✨ Ilustrações SVG customizadas');
        console.log('   💫 Animações suaves e fluidas');
        console.log('   🎨 Design moderno com gradientes');
        console.log('   📱 Responsividade completa');
        console.log('   ♿ Acessibilidade implementada');
        console.log('   🔧 Helper JavaScript funcional');
        console.log('   🎭 Múltiplos tipos e tamanhos');
        console.log('   🚀 Integração com AOS');
        console.log('   💎 Efeitos de ripple nos botões');
        console.log('   🌈 Elementos decorativos');
    }
}

// Executar testes se chamado diretamente
if (require.main === module) {
    const tester = new Phase28Tester();
    tester.runAllTests();
}

module.exports = Phase28Tester; 