const fs = require('fs');
const path = require('path');

/**
 * Script de Validação de Vínculos - CodePath
 * Verifica compatibilidades entre templates, CSS, JS e controllers
 */

class LinkValidator {
    constructor() {
        this.errors = [];
        this.warnings = [];
        this.info = [];
    }

    /**
     * Executa todas as validações
     */
    validate() {
        console.log('🔍 Iniciando validação de vínculos...\n');
        
        this.validateTemplateStructure();
        this.validateControllerBindings();
        this.validateCSSJSLinks();
        this.validateFileExistence();
        
        this.printResults();
    }

    /**
     * Valida estrutura dos templates
     */
    validateTemplateStructure() {
        console.log('📄 Validando estrutura de templates...');
        
        const templatesDir = path.join(__dirname, '..', 'views', 'pages');
        const templates = fs.readdirSync(templatesDir);
        
        templates.forEach(template => {
            const templatePath = path.join(templatesDir, template);
            const content = fs.readFileSync(templatePath, 'utf8');
            
            // Verificar se tem HTML completo (incorreto)
            if (content.includes('<!DOCTYPE html>') || content.includes('<html')) {
                this.errors.push(`❌ ${template}: Contém estrutura HTML completa (deve usar layout)`);
            }
            
            // Verificar se inclui CSS/JS depois do footer (incorreto)
            if (content.includes('{{>footer}}') && 
                (content.includes('<link rel="stylesheet"') || content.includes('<script src='))) {
                this.errors.push(`❌ ${template}: Inclui CSS/JS após footer (deve usar additionalCSS/JS)`);
            }
            
            // Verificar templates que usam layout corretamente
            if (!content.includes('<!DOCTYPE html>') && !content.includes('<html')) {
                this.info.push(`✅ ${template}: Estrutura correta`);
            }
        });
    }

    /**
     * Valida vínculos entre controllers e templates
     */
    validateControllerBindings() {
        console.log('🎮 Validando vínculos de controllers...');
        
        // Verificar adminController
        const adminControllerPath = path.join(__dirname, '..', 'controllers', 'adminController.js');
        const adminContent = fs.readFileSync(adminControllerPath, 'utf8');
        
        // Extrair templates renderizados
        const templateMatches = adminContent.match(/res\.render\(['"`]([^'"`]+)['"`]/g) || [];
        
        templateMatches.forEach(match => {
            const templateName = match.match(/['"`]([^'"`]+)['"`]/)[1];
            const templateFile = templateName.replace('pages/', '') + '.mustache';
            const templatePath = path.join(__dirname, '..', 'views', 'pages', templateFile);
            
            if (!fs.existsSync(templatePath)) {
                this.errors.push(`❌ Template não encontrado: ${templateFile} (referenciado em adminController)`);
            } else {
                this.info.push(`✅ Template encontrado: ${templateFile}`);
            }
        });

        // Verificar se controllers passam additionalCSS/JS
        const renderMatches = adminContent.match(/res\.render\([^}]+\}/gs) || [];
        
        renderMatches.forEach(match => {
            if (!match.includes('additionalCSS') || !match.includes('additionalJS')) {
                const templateName = match.match(/['"`]([^'"`]+)['"`]/)[1];
                this.warnings.push(`⚠️  ${templateName}: Controller não passa additionalCSS/JS`);
            }
        });
    }

    /**
     * Valida existência de arquivos CSS e JS
     */
    validateCSSJSLinks() {
        console.log('🎨 Validando arquivos CSS e JS...');
        
        const cssDir = path.join(__dirname, '..', 'public', 'css');
        const jsDir = path.join(__dirname, '..', 'public', 'js');
        
        // Arquivos CSS que devem existir
        const requiredCSS = [
            'admin.css',
            'global.css',
            'responsive.css',
            'notifications.css',
            'dashboard.css'
        ];
        
        // Arquivos JS que devem existir  
        const requiredJS = [
            'admin-packages.js',
            'admin-lessons.js', 
            'admin-quizzes.js',
            'main.js',
            'notifications.js'
        ];
        
        requiredCSS.forEach(file => {
            const filePath = path.join(cssDir, file);
            if (!fs.existsSync(filePath)) {
                this.errors.push(`❌ CSS não encontrado: ${file}`);
            } else {
                this.info.push(`✅ CSS encontrado: ${file}`);
            }
        });
        
        requiredJS.forEach(file => {
            const filePath = path.join(jsDir, file);
            if (!fs.existsSync(filePath)) {
                this.errors.push(`❌ JS não encontrado: ${file}`);
            } else {
                this.info.push(`✅ JS encontrado: ${file}`);
            }
        });
    }

    /**
     * Valida existência de arquivos importantes
     */
    validateFileExistence() {
        console.log('📁 Validando arquivos importantes...');
        
        const importantFiles = [
            'views/layouts/main.mustache',
            'views/partials/header.mustache',
            'views/partials/footer.mustache',
            'views/partials/sidebar.mustache',
            'models/database.js',
            'models/packageModel.js',
            'models/lessonModel.js',
            'app.js'
        ];
        
        importantFiles.forEach(file => {
            const filePath = path.join(__dirname, '..', file);
            if (!fs.existsSync(filePath)) {
                this.errors.push(`❌ Arquivo importante não encontrado: ${file}`);
            } else {
                this.info.push(`✅ Arquivo importante encontrado: ${file}`);
            }
        });
    }

    /**
     * Exibe resultados da validação
     */
    printResults() {
        console.log('\n' + '='.repeat(60));
        console.log('📊 RESULTADOS DA VALIDAÇÃO');
        console.log('='.repeat(60));
        
        if (this.errors.length > 0) {
            console.log(`\n🚨 ERROS CRÍTICOS (${this.errors.length}):`);
            this.errors.forEach(error => console.log(error));
        }
        
        if (this.warnings.length > 0) {
            console.log(`\n⚠️  AVISOS (${this.warnings.length}):`);
            this.warnings.forEach(warning => console.log(warning));
        }
        
        console.log(`\n✅ ITENS VÁLIDOS (${this.info.length}):`);
        this.info.slice(0, 10).forEach(info => console.log(info));
        if (this.info.length > 10) {
            console.log(`   ... e mais ${this.info.length - 10} itens válidos`);
        }
        
        console.log('\n' + '='.repeat(60));
        console.log(`📈 RESUMO: ${this.errors.length} erros, ${this.warnings.length} avisos, ${this.info.length} válidos`);
        
        if (this.errors.length === 0) {
            console.log('🎉 VALIDAÇÃO CONCLUÍDA COM SUCESSO!');
        } else {
            console.log('❌ VALIDAÇÃO FALHOU - Corrija os erros acima');
        }
        console.log('='.repeat(60));
    }
}

// Executar validação
const validator = new LinkValidator();
validator.validate(); 