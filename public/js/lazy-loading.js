/**
 * Sistema de Lazy Loading Avançado - CodePath
 * Otimiza carregamento de imagens, vídeos e conteúdo dinâmico
 */

class LazyLoadingManager {
    constructor() {
        this.imageObserver = null;
        this.contentObserver = null;
        this.videoObserver = null;
        this.apiObserver = null;
        this.loadedElements = new Set();
        this.errorElements = new Set();
        
        this.init();
    }

    /**
     * Inicializa o sistema de lazy loading
     */
    init() {
        // Verificar suporte ao Intersection Observer
        if (!('IntersectionObserver' in window)) {
            console.warn('🔄 Lazy Loading: IntersectionObserver não suportado, carregando fallback');
            this.loadAllElements();
            return;
        }

        this.setupImageLazyLoading();
        this.setupVideoLazyLoading();
        this.setupContentLazyLoading();
        this.setupDataLazyLoading();
        
        console.log('✅ Lazy Loading: Sistema inicializado');
    }

    /**
     * Configura lazy loading para imagens
     */
    setupImageLazyLoading() {
        const imageOptions = {
            root: null,
            rootMargin: '50px',
            threshold: 0.1
        };

        this.imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadImage(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, imageOptions);

        // Observar todas as imagens com data-src
        document.querySelectorAll('img[data-src]').forEach(img => {
            this.imageObserver.observe(img);
            this.addPlaceholder(img, 'image');
        });
    }

    /**
     * Configura lazy loading para vídeos
     */
    setupVideoLazyLoading() {
        const videoOptions = {
            root: null,
            rootMargin: '100px',
            threshold: 0.1
        };

        this.videoObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadVideo(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, videoOptions);

        // Observar todos os vídeos com data-src
        document.querySelectorAll('video[data-src], iframe[data-src]').forEach(video => {
            this.videoObserver.observe(video);
            this.addPlaceholder(video, 'video');
        });
    }

    /**
     * Configura lazy loading para conteúdo dinâmico
     */
    setupContentLazyLoading() {
        const contentOptions = {
            root: null,
            rootMargin: '100px',
            threshold: 0.1
        };

        this.contentObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadContent(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, contentOptions);

        // Observar elementos com data-lazy-content
        document.querySelectorAll('[data-lazy-content]').forEach(element => {
            this.contentObserver.observe(element);
            this.addPlaceholder(element, 'content');
        });
    }

    /**
     * Configura lazy loading para dados via API
     */
    setupDataLazyLoading() {
        const dataOptions = {
            root: null,
            rootMargin: '200px',
            threshold: 0.1
        };

        const dataObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadData(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, dataOptions);

        // Observar elementos com data-lazy-load
        document.querySelectorAll('[data-lazy-load]').forEach(element => {
            dataObserver.observe(element);
            this.addPlaceholder(element, 'data');
        });
    }

    /**
     * Carrega uma imagem
     */
    loadImage(img) {
        const src = img.dataset.src;
        const srcset = img.dataset.srcset;
        
        if (!src) return;

        // Mostrar indicador de carregamento
        this.showLoadingIndicator(img);

        const imageLoader = new Image();
        
        imageLoader.onload = () => {
            img.src = src;
            if (srcset) {
                img.srcset = srcset;
            }
            
            img.classList.remove('lazy-loading');
            img.classList.add('lazy-loaded');
            this.hideLoadingIndicator(img);
            this.loadedElements.add(img);
            
            console.log(`🖼️ Lazy Loading: Imagem carregada - ${src.substring(0, 50)}...`);
        };

        imageLoader.onerror = () => {
            this.handleLoadError(img, 'image');
        };

        imageLoader.src = src;
    }

    /**
     * Carrega um vídeo
     */
    loadVideo(video) {
        const src = video.dataset.src;
        
        if (!src) return;

        this.showLoadingIndicator(video);

        if (video.tagName === 'VIDEO') {
            video.src = src;
            video.load();
        } else if (video.tagName === 'IFRAME') {
            video.src = src;
        }

        video.classList.remove('lazy-loading');
        video.classList.add('lazy-loaded');
        this.hideLoadingIndicator(video);
        this.loadedElements.add(video);
        
        console.log(`🎥 Lazy Loading: Vídeo carregado - ${src.substring(0, 50)}...`);
    }

    /**
     * Carrega conteúdo dinâmico
     */
    loadContent(element) {
        const content = element.dataset.lazyContent;
        
        if (!content) return;

        this.showLoadingIndicator(element);

        try {
            // Se for HTML, inserir diretamente
            if (content.startsWith('<')) {
                element.innerHTML = content;
            } else {
                // Se for texto, inserir como texto
                element.textContent = content;
            }

            element.classList.remove('lazy-loading');
            element.classList.add('lazy-loaded');
            this.hideLoadingIndicator(element);
            this.loadedElements.add(element);
            
            console.log(`📄 Lazy Loading: Conteúdo carregado para elemento ${element.tagName}`);
        } catch (error) {
            this.handleLoadError(element, 'content');
        }
    }

    /**
     * Carrega dados via API
     */
    async loadData(element) {
        const url = element.dataset.lazyLoad;
        const method = element.dataset.lazyMethod || 'GET';
        
        if (!url) return;

        this.showLoadingIndicator(element);

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            
            // Processar dados baseado no tipo de elemento
            this.processApiData(element, data);
            
            element.classList.remove('lazy-loading');
            element.classList.add('lazy-loaded');
            this.hideLoadingIndicator(element);
            this.loadedElements.add(element);
            
            console.log(`📡 Lazy Loading: Dados carregados via API - ${url}`);
        } catch (error) {
            console.error(`❌ Lazy Loading: Erro ao carregar dados de ${url}:`, error);
            this.handleLoadError(element, 'data');
        }
    }

    /**
     * Processa dados da API baseado no tipo de elemento
     */
    processApiData(element, data) {
        const dataType = element.dataset.lazyType;
        
        switch (dataType) {
            case 'progress':
                this.renderProgressData(element, data);
                break;
            case 'stats':
                this.renderStatsData(element, data);
                break;
            case 'notifications':
                this.renderNotificationsData(element, data);
                break;
            case 'achievements':
                this.renderAchievementsData(element, data);
                break;
            default:
                // Renderização genérica
                if (Array.isArray(data)) {
                    element.innerHTML = data.map(item => `<div class="lazy-item">${JSON.stringify(item)}</div>`).join('');
                } else {
                    element.innerHTML = `<div class="lazy-data">${JSON.stringify(data)}</div>`;
                }
        }
    }

    /**
     * Renderiza dados de progresso
     */
    renderProgressData(element, data) {
        const progressHtml = `
            <div class="progress-summary">
                <div class="progress-stat">
                    <span class="stat-label">Aulas Concluídas</span>
                    <span class="stat-value">${data.completedLessons || 0}</span>
                </div>
                <div class="progress-stat">
                    <span class="stat-label">XP Total</span>
                    <span class="stat-value">${data.totalXp || 0}</span>
                </div>
                <div class="progress-stat">
                    <span class="stat-label">Nível</span>
                    <span class="stat-value">${data.level || 1}</span>
                </div>
            </div>
        `;
        element.innerHTML = progressHtml;
    }

    /**
     * Renderiza dados de estatísticas
     */
    renderStatsData(element, data) {
        const statsHtml = `
            <div class="stats-grid">
                ${Object.entries(data).map(([key, value]) => `
                    <div class="stat-card">
                        <div class="stat-value">${value}</div>
                        <div class="stat-label">${key}</div>
                    </div>
                `).join('')}
            </div>
        `;
        element.innerHTML = statsHtml;
    }

    /**
     * Adiciona placeholder de carregamento
     */
    addPlaceholder(element, type) {
        element.classList.add('lazy-loading');
        
        const placeholder = document.createElement('div');
        placeholder.className = `lazy-placeholder lazy-placeholder-${type}`;
        
        switch (type) {
            case 'image':
                placeholder.innerHTML = '<div class="placeholder-shimmer"></div>';
                break;
            case 'video':
                placeholder.innerHTML = '<div class="placeholder-video"><i class="icon-play"></i></div>';
                break;
            case 'content':
                placeholder.innerHTML = '<div class="placeholder-text"><div class="placeholder-line"></div><div class="placeholder-line"></div></div>';
                break;
            case 'data':
                placeholder.innerHTML = '<div class="placeholder-spinner"></div>';
                break;
        }
        
        element.parentNode.insertBefore(placeholder, element);
        element.style.display = 'none';
    }

    /**
     * Mostra indicador de carregamento
     */
    showLoadingIndicator(element) {
        const indicator = element.parentNode.querySelector('.lazy-placeholder');
        if (indicator) {
            indicator.classList.add('loading');
        }
    }

    /**
     * Esconde indicador de carregamento
     */
    hideLoadingIndicator(element) {
        const indicator = element.parentNode.querySelector('.lazy-placeholder');
        if (indicator) {
            indicator.remove();
        }
        element.style.display = '';
    }

    /**
     * Trata erros de carregamento
     */
    handleLoadError(element, type) {
        element.classList.remove('lazy-loading');
        element.classList.add('lazy-error');
        this.errorElements.add(element);
        
        const errorPlaceholder = document.createElement('div');
        errorPlaceholder.className = `lazy-error-placeholder lazy-error-${type}`;
        errorPlaceholder.innerHTML = `
            <div class="error-content">
                <i class="icon-alert-triangle"></i>
                <span>Erro ao carregar ${type}</span>
                <button class="retry-btn" onclick="lazyLoader.retryLoad(this.parentNode.parentNode)">
                    Tentar novamente
                </button>
            </div>
        `;
        
        this.hideLoadingIndicator(element);
        element.parentNode.insertBefore(errorPlaceholder, element);
        element.style.display = 'none';
        
        console.warn(`⚠️ Lazy Loading: Erro ao carregar ${type}`);
    }

    /**
     * Tenta carregar novamente um elemento com erro
     */
    retryLoad(element) {
        this.errorElements.delete(element);
        element.classList.remove('lazy-error');
        
        const errorPlaceholder = element.parentNode.querySelector('.lazy-error-placeholder');
        if (errorPlaceholder) {
            errorPlaceholder.remove();
        }
        
        // Reobservar o elemento
        if (element.tagName === 'IMG') {
            this.imageObserver.observe(element);
        } else if (element.tagName === 'VIDEO' || element.tagName === 'IFRAME') {
            this.videoObserver.observe(element);
        } else if (element.dataset.lazyContent) {
            this.contentObserver.observe(element);
        } else if (element.dataset.lazyLoad) {
            this.setupDataLazyLoading();
        }
    }

    /**
     * Carrega todos os elementos (fallback para navegadores sem suporte)
     */
    loadAllElements() {
        // Carregar todas as imagens
        document.querySelectorAll('img[data-src]').forEach(img => {
            img.src = img.dataset.src;
            if (img.dataset.srcset) {
                img.srcset = img.dataset.srcset;
            }
        });

        // Carregar todos os vídeos
        document.querySelectorAll('video[data-src], iframe[data-src]').forEach(video => {
            video.src = video.dataset.src;
        });

        // Carregar todo o conteúdo
        document.querySelectorAll('[data-lazy-content]').forEach(element => {
            element.innerHTML = element.dataset.lazyContent;
        });

        console.log('📦 Lazy Loading: Todos os elementos carregados (modo fallback)');
    }

    /**
     * Obtém estatísticas do lazy loading
     */
    getStats() {
        return {
            loadedElements: this.loadedElements.size,
            errorElements: this.errorElements.size,
            totalElements: document.querySelectorAll('[data-src], [data-lazy-content], [data-lazy-load]').length
        };
    }

    /**
     * Limpa recursos e observers
     */
    destroy() {
        if (this.imageObserver) this.imageObserver.disconnect();
        if (this.contentObserver) this.contentObserver.disconnect();
        if (this.videoObserver) this.videoObserver.disconnect();
        
        this.loadedElements.clear();
        this.errorElements.clear();
        
        console.log('🗑️ Lazy Loading: Sistema destruído');
    }
}

// Inicializar lazy loading quando o DOM estiver pronto
let lazyLoader;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        lazyLoader = new LazyLoadingManager();
    });
} else {
    lazyLoader = new LazyLoadingManager();
}

// Expor globalmente para uso em outros scripts
window.lazyLoader = lazyLoader;

// Auto-reinicializar quando novo conteúdo for adicionado
const reinitializeLazyLoading = () => {
    if (lazyLoader) {
        lazyLoader.destroy();
        lazyLoader = new LazyLoadingManager();
    }
};

// Observar mudanças no DOM para reinicializar lazy loading
if ('MutationObserver' in window) {
    const mutationObserver = new MutationObserver((mutations) => {
        let shouldReinit = false;
        
        mutations.forEach(mutation => {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1) { // Element node
                        if (node.querySelector && node.querySelector('[data-src], [data-lazy-content], [data-lazy-load]')) {
                            shouldReinit = true;
                        }
                    }
                });
            }
        });
        
        if (shouldReinit) {
            console.log('🔄 Lazy Loading: Reinicializando devido a mudanças no DOM');
            reinitializeLazyLoading();
        }
    });
    
    mutationObserver.observe(document.body, {
        childList: true,
        subtree: true
    });
}

console.log('✅ Lazy Loading: Script carregado e pronto'); 