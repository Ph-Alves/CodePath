#!/usr/bin/env node

/**
 * Script de Minificação de Assets - CodePath
 * Fase 24 - Otimização de Performance
 * 
 * Minifica arquivos CSS e JavaScript para reduzir tamanho e melhorar carregamento
 */

const fs = require('fs');
const path = require('path');

/**
 * Minificador simples de CSS
 */
class CSSMinifier {
    /**
     * Minifica código CSS removendo espaços, comentários e otimizando
     */
    static minify(css) {
        return css
            // Remover comentários CSS
            .replace(/\/\*[\s\S]*?\*\//g, '')
            // Remover espaços em branco desnecessários
            .replace(/\s+/g, ' ')
            // Remover espaços ao redor de caracteres especiais
            .replace(/\s*([{}:;,>+~])\s*/g, '$1')
            // Remover última semicolon antes de }
            .replace(/;}/g, '}')
            // Remover espaços no início e fim
            .trim()
            // Otimizar cores hex
            .replace(/#([a-f0-9])\1([a-f0-9])\2([a-f0-9])\3/gi, '#$1$2$3')
            // Otimizar valores zero
            .replace(/\b0px\b/g, '0')
            .replace(/\b0em\b/g, '0')
            .replace(/\b0rem\b/g, '0')
            .replace(/\b0%\b/g, '0')
            // Remover zeros desnecessários
            .replace(/\b0\.(\d+)/g, '.$1')
            // Otimizar margin/padding
            .replace(/margin:0 0 0 0/g, 'margin:0')
            .replace(/padding:0 0 0 0/g, 'padding:0');
    }
    
    static calculateSavings(original, minified) {
        const originalSize = Buffer.byteLength(original, 'utf8');
        const minifiedSize = Buffer.byteLength(minified, 'utf8');
        const savings = originalSize - minifiedSize;
        const percentage = ((savings / originalSize) * 100).toFixed(2);
        
        return {
            originalSize,
            minifiedSize,
            savings,
            percentage
        };
    }
}

/**
 * Minificador simples de JavaScript
 */
class JSMinifier {
    /**
     * Minifica código JavaScript removendo espaços e comentários
     */
    static minify(js) {
        return js
            // Remover comentários de linha
            .replace(/\/\/.*$/gm, '')
            // Remover comentários de bloco
            .replace(/\/\*[\s\S]*?\*\//g, '')
            // Remover espaços múltiplos
            .replace(/\s+/g, ' ')
            // Remover espaços ao redor de operadores
            .replace(/\s*([=+\-*/%<>!&|^~?:;,(){}[\]])\s*/g, '$1')
            // Remover espaços no início e fim de linhas
            .replace(/^\s+|\s+$/gm, '')
            // Remover linhas vazias
            .replace(/\n\s*\n/g, '\n')
            // Otimizar true/false
            .replace(/\btrue\b/g, '!0')
            .replace(/\bfalse\b/g, '!1')
            // Remover espaços finais
            .trim();
    }
    
    static calculateSavings(original, minified) {
        const originalSize = Buffer.byteLength(original, 'utf8');
        const minifiedSize = Buffer.byteLength(minified, 'utf8');
        const savings = originalSize - minifiedSize;
        const percentage = ((savings / originalSize) * 100).toFixed(2);
        
        return {
            originalSize,
            minifiedSize,
            savings,
            percentage
        };
    }
}

/**
 * Classe principal para minificação
 */
class AssetMinifier {
    constructor() {
        this.stats = {
            totalFiles: 0,
            totalOriginalSize: 0,
            totalMinifiedSize: 0,
            cssFiles: 0,
            jsFiles: 0,
            errors: []
        };
        
        this.config = {
            cssDir: path.join(__dirname, '../public/css'),
            jsDir: path.join(__dirname, '../public/js'),
            outputSuffix: '.min',
            preserveOriginal: true,
            verbose: true
        };
    }

    /**
     * Executa a minificação completa
     */
    async run() {
        console.log('🚀 Iniciando minificação de assets...\n');
        
        try {
            await this.minifyCSS();
            await this.minifyJS();
            this.showResults();
        } catch (error) {
            console.error('❌ Erro durante minificação:', error);
            process.exit(1);
        }
    }

    /**
     * Minifica todos os arquivos CSS
     */
    async minifyCSS() {
        console.log('📝 Minificando arquivos CSS...');
        
        if (!fs.existsSync(this.config.cssDir)) {
            console.warn('⚠️ Diretório CSS não encontrado:', this.config.cssDir);
            return;
        }

        const cssFiles = fs.readdirSync(this.config.cssDir)
            .filter(file => file.endsWith('.css') && !file.includes('.min.'));

        for (const file of cssFiles) {
            try {
                const filePath = path.join(this.config.cssDir, file);
                const originalContent = fs.readFileSync(filePath, 'utf8');
                const minifiedContent = CSSMinifier.minify(originalContent);
                
                const savings = CSSMinifier.calculateSavings(originalContent, minifiedContent);
                
                // Salvar arquivo minificado
                const minFileName = file.replace('.css', `${this.config.outputSuffix}.css`);
                const minFilePath = path.join(this.config.cssDir, minFileName);
                fs.writeFileSync(minFilePath, minifiedContent, 'utf8');
                
                // Atualizar estatísticas
                this.stats.cssFiles++;
                this.stats.totalFiles++;
                this.stats.totalOriginalSize += savings.originalSize;
                this.stats.totalMinifiedSize += savings.minifiedSize;
                
                if (this.config.verbose) {
                    console.log(`  ✅ ${file} → ${minFileName}`);
                    console.log(`     ${this.formatBytes(savings.originalSize)} → ${this.formatBytes(savings.minifiedSize)} (${savings.percentage}% redução)`);
                }
                
            } catch (error) {
                const errorMsg = `Erro ao minificar ${file}: ${error.message}`;
                this.stats.errors.push(errorMsg);
                console.error(`  ❌ ${errorMsg}`);
            }
        }
        
        console.log(`📝 CSS: ${this.stats.cssFiles} arquivos processados\n`);
    }

    /**
     * Minifica todos os arquivos JavaScript
     */
    async minifyJS() {
        console.log('⚡ Minificando arquivos JavaScript...');
        
        if (!fs.existsSync(this.config.jsDir)) {
            console.warn('⚠️ Diretório JS não encontrado:', this.config.jsDir);
            return;
        }

        const jsFiles = fs.readdirSync(this.config.jsDir)
            .filter(file => file.endsWith('.js') && !file.includes('.min.'));

        for (const file of jsFiles) {
            try {
                const filePath = path.join(this.config.jsDir, file);
                const originalContent = fs.readFileSync(filePath, 'utf8');
                const minifiedContent = JSMinifier.minify(originalContent);
                
                const savings = JSMinifier.calculateSavings(originalContent, minifiedContent);
                
                // Salvar arquivo minificado
                const minFileName = file.replace('.js', `${this.config.outputSuffix}.js`);
                const minFilePath = path.join(this.config.jsDir, minFileName);
                fs.writeFileSync(minFilePath, minifiedContent, 'utf8');
                
                // Atualizar estatísticas
                this.stats.jsFiles++;
                this.stats.totalFiles++;
                this.stats.totalOriginalSize += savings.originalSize;
                this.stats.totalMinifiedSize += savings.minifiedSize;
                
                if (this.config.verbose) {
                    console.log(`  ✅ ${file} → ${minFileName}`);
                    console.log(`     ${this.formatBytes(savings.originalSize)} → ${this.formatBytes(savings.minifiedSize)} (${savings.percentage}% redução)`);
                }
                
            } catch (error) {
                const errorMsg = `Erro ao minificar ${file}: ${error.message}`;
                this.stats.errors.push(errorMsg);
                console.error(`  ❌ ${errorMsg}`);
            }
        }
        
        console.log(`⚡ JavaScript: ${this.stats.jsFiles} arquivos processados\n`);
    }

    /**
     * Exibe resultados finais da minificação
     */
    showResults() {
        const totalSavings = this.stats.totalOriginalSize - this.stats.totalMinifiedSize;
        const totalPercentage = ((totalSavings / this.stats.totalOriginalSize) * 100).toFixed(2);

        console.log('📊 RESULTADOS DA MINIFICAÇÃO');
        console.log('='.repeat(50));
        console.log(`📁 Total de arquivos processados: ${this.stats.totalFiles}`);
        console.log(`📝 Arquivos CSS: ${this.stats.cssFiles}`);
        console.log(`⚡ Arquivos JavaScript: ${this.stats.jsFiles}`);
        console.log(`📏 Tamanho original: ${this.formatBytes(this.stats.totalOriginalSize)}`);
        console.log(`📦 Tamanho minificado: ${this.formatBytes(this.stats.totalMinifiedSize)}`);
        console.log(`💾 Economia total: ${this.formatBytes(totalSavings)} (${totalPercentage}%)`);
        
        if (this.stats.errors.length > 0) {
            console.log(`\n⚠️ Erros encontrados: ${this.stats.errors.length}`);
            this.stats.errors.forEach(error => console.log(`  - ${error}`));
        }
        
        console.log('\n✅ Minificação concluída com sucesso!');
        
        // Sugestões de otimização
        if (totalPercentage < 20) {
            console.log('\n💡 SUGESTÕES:');
            console.log('  - Considere usar ferramentas mais avançadas como Terser ou cssnano');
            console.log('  - Remova código não utilizado');
            console.log('  - Use compressão gzip no servidor');
        }
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
     * Minifica apenas arquivos CSS
     */
    async minifyOnlyCSS() {
        console.log('🎨 Minificando apenas arquivos CSS...\n');
        await this.minifyCSS();
        this.showResults();
    }

    /**
     * Minifica apenas arquivos JavaScript
     */
    async minifyOnlyJS() {
        console.log('⚡ Minificando apenas arquivos JavaScript...\n');
        await this.minifyJS();
        this.showResults();
    }
}

// Executar se chamado diretamente
if (require.main === module) {
    const args = process.argv.slice(2);
    const minifier = new AssetMinifier();
    
    switch (args[0]) {
        case '--css':
        case '-c':
            minifier.minifyOnlyCSS();
            break;
        case '--js':
        case '-j':
            minifier.minifyOnlyJS();
            break;
        case '--help':
        case '-h':
            console.log(`
🚀 Asset Minifier - CodePath

USO:
  node scripts/minify-assets.js [opções]

OPÇÕES:
  --css, -c     Minificar apenas arquivos CSS
  --js, -j      Minificar apenas arquivos JavaScript
  --help, -h    Mostrar esta ajuda

EXEMPLOS:
  node scripts/minify-assets.js           # Minificar tudo
  node scripts/minify-assets.js --css     # Apenas CSS
  node scripts/minify-assets.js --js      # Apenas JavaScript

Os arquivos minificados são salvos com sufixo .min (ex: style.css → style.min.css)
            `);
            break;
        default:
            minifier.run();
    }
}

module.exports = AssetMinifier; 
module.exports = { AssetMinifier, CSSMinifier, JSMinifier }; 