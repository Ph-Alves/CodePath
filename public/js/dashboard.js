/* ===================================
   DASHBOARD JAVASCRIPT - CODEPATH
   Funcionalidades específicas do dashboard
   =================================== */

/**
 * Classe para gerenciar funcionalidades do Dashboard
 */
class DashboardManager {
    constructor() {
        this.progressModal = null;
        this.currentPackageId = null;
        this.init();
    }
    
    /**
     * Inicializa o dashboard
     */
    init() {
        this.cacheElements();
        this.bindEvents();
        this.setupAnimations();
        this.loadDashboardData();
        
        console.log('Dashboard initialized successfully');
    }
    
    /**
     * Cacheia elementos DOM
     */
    cacheElements() {
        this.progressModal = document.getElementById('progressModal');
        this.metricCards = document.querySelectorAll('.metric-card');
        this.packageCards = document.querySelectorAll('.package-card');
        this.actionCards = document.querySelectorAll('.action-card');
        this.progressBars = document.querySelectorAll('.progress-fill');
    }
    
    /**
     * Vincula eventos
     */
    bindEvents() {
        // Eventos dos cards de pacotes
        this.packageCards.forEach(card => {
            const continueBtn = card.querySelector('.btn-primary');
            const progressBtn = card.querySelector('.btn-secondary');
            
            if (continueBtn) {
                continueBtn.addEventListener('click', (e) => {
                    this.handleContinuePackage(e, card);
                });
            }
            
            if (progressBtn) {
                progressBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    const packageId = this.getPackageIdFromCard(card);
                    this.showProgressModal(packageId);
                });
            }
        });
        
        // Eventos dos cards de métricas
        this.metricCards.forEach(card => {
            card.addEventListener('click', () => {
                this.handleMetricCardClick(card);
            });
        });
        
        // Eventos dos cards de ação rápida
        this.actionCards.forEach(card => {
            card.addEventListener('click', (e) => {
                this.handleActionCardClick(e, card);
            });
        });
        
        // Evento para fechar modal
        if (this.progressModal) {
            const closeBtn = this.progressModal.querySelector('.modal-close');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    this.closeProgressModal();
                });
            }
            
            // Fechar modal clicando fora
            this.progressModal.addEventListener('click', (e) => {
                if (e.target === this.progressModal) {
                    this.closeProgressModal();
                }
            });
        }
    }
    
    /**
     * Configura animações
     */
    setupAnimations() {
        // Animar barras de progresso
        this.animateProgressBars();
        
        // Animar entrada dos cards
        this.animateCardsEntrance();
        
        // Configurar observer para animações em scroll
        this.setupScrollAnimations();
    }
    
    /**
     * Anima as barras de progresso
     */
    animateProgressBars() {
        this.progressBars.forEach((bar, index) => {
            const targetWidth = bar.style.width;
            bar.style.width = '0%';
            
            setTimeout(() => {
                bar.style.width = targetWidth;
            }, 500 + (index * 200));
        });
    }
    
    /**
     * Anima entrada dos cards
     */
    animateCardsEntrance() {
        const cards = [
            ...this.metricCards,
            ...this.packageCards,
            ...this.actionCards
        ];
        
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                card.style.transition = 'all 0.5s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 100 + (index * 100));
        });
    }
    
    /**
     * Configura animações em scroll
     */
    setupScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);
        
        // Observar seções
        const sections = document.querySelectorAll('.metrics-section, .continue-section, .activity-section, .quick-actions');
        sections.forEach(section => {
            observer.observe(section);
        });
    }
    
    /**
     * Carrega dados do dashboard
     */
    async loadDashboardData() {
        try {
            // Simular carregamento de dados (será substituído por chamadas reais)
            await this.loadMetrics();
            await this.loadRecentActivity();
            await this.updateNotifications();
        } catch (error) {
            console.error('Erro ao carregar dados do dashboard:', error);
            window.showToast('Erro ao carregar dados', 'error');
        }
    }
    
    /**
     * Carrega métricas do usuário
     */
    async loadMetrics() {
        // Simular delay de carregamento
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Atualizar contadores com animação
        this.animateCounters();
    }
    
    /**
     * Anima contadores de métricas
     */
    animateCounters() {
        const counters = document.querySelectorAll('.metric-value');
        
        counters.forEach(counter => {
            const target = parseInt(counter.textContent);
            const duration = 1000;
            const increment = target / (duration / 16);
            let current = 0;
            
            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    counter.textContent = target;
                    clearInterval(timer);
                } else {
                    counter.textContent = Math.floor(current);
                }
            }, 16);
        });
    }
    
    /**
     * Carrega atividade recente
     */
    async loadRecentActivity() {
        // Placeholder para carregamento de atividade recente
        console.log('Loading recent activity...');
    }
    
    /**
     * Atualiza notificações
     */
    async updateNotifications() {
        // Placeholder para atualização de notificações
        console.log('Updating notifications...');
    }
    
    /**
     * Manipula clique em continuar pacote
     */
    handleContinuePackage(event, card) {
        const packageId = this.getPackageIdFromCard(card);
        const packageName = card.querySelector('.package-name').textContent;
        
        // Mostrar loading
        const btn = event.target;
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Carregando...';
        btn.disabled = true;
        
        // Simular navegação (será substituído por navegação real)
        setTimeout(() => {
            window.showToast(`Continuando ${packageName}...`, 'info');
            btn.innerHTML = originalText;
            btn.disabled = false;
            
            // Aqui será implementada a navegação real
            // window.location.href = `/packages/${packageId}/continue`;
        }, 1000);
    }
    
    /**
     * Mostra modal de progresso
     */
    showProgressModal(packageId) {
        if (!this.progressModal) return;
        
        this.currentPackageId = packageId;
        
        // Carregar dados do progresso
        this.loadProgressData(packageId);
        
        // Mostrar modal
        this.progressModal.style.display = 'flex';
        this.progressModal.classList.add('active');
        
        // Prevenir scroll do body
        document.body.style.overflow = 'hidden';
        
        // Focus no botão de fechar
        const closeBtn = this.progressModal.querySelector('.modal-close');
        if (closeBtn) {
            setTimeout(() => closeBtn.focus(), 100);
        }
    }
    
    /**
     * Fecha modal de progresso
     */
    closeProgressModal() {
        if (!this.progressModal) return;
        
        this.progressModal.style.display = 'none';
        this.progressModal.classList.remove('active');
        
        // Restaurar scroll do body
        document.body.style.overflow = '';
        
        this.currentPackageId = null;
    }
    
    /**
     * Carrega dados de progresso do pacote
     */
    async loadProgressData(packageId) {
        const modalBody = this.progressModal.querySelector('.modal-body');
        
        // Mostrar loading
        modalBody.innerHTML = `
            <div class="loading-state">
                <div class="spinner"></div>
                <p>Carregando progresso...</p>
            </div>
        `;
        
        try {
            // Simular carregamento (será substituído por chamada real)
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Dados mockados de progresso
            const progressData = {
                packageName: packageId === '1' ? 'Pacote C' : 'Pacote Python',
                totalLessons: 15,
                completedLessons: packageId === '1' ? 7 : 11,
                currentLesson: packageId === '1' ? 'C - Operações' : 'Python - Estruturas de Dados',
                progressPercentage: packageId === '1' ? 45 : 72,
                estimatedTime: packageId === '1' ? '8 horas restantes' : '3 horas restantes'
            };
            
            // Renderizar dados de progresso
            modalBody.innerHTML = this.renderProgressContent(progressData);
            
        } catch (error) {
            console.error('Erro ao carregar progresso:', error);
            modalBody.innerHTML = `
                <div class="error-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Erro ao carregar progresso. Tente novamente.</p>
                </div>
            `;
        }
    }
    
    /**
     * Renderiza conteúdo do modal de progresso
     */
    renderProgressContent(data) {
        return `
            <div class="progress-details">
                <div class="progress-header">
                    <h4>${data.packageName}</h4>
                    <span class="progress-badge">${data.progressPercentage}% Concluído</span>
                </div>
                
                <div class="progress-stats">
                    <div class="progress-stat">
                        <span class="stat-label">Aulas Concluídas</span>
                        <span class="stat-value">${data.completedLessons}/${data.totalLessons}</span>
                    </div>
                    <div class="progress-stat">
                        <span class="stat-label">Aula Atual</span>
                        <span class="stat-value">${data.currentLesson}</span>
                    </div>
                    <div class="progress-stat">
                        <span class="stat-label">Tempo Estimado</span>
                        <span class="stat-value">${data.estimatedTime}</span>
                    </div>
                </div>
                
                <div class="progress-bar-container">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${data.progressPercentage}%"></div>
                    </div>
                </div>
                
                <div class="progress-actions">
                    <button class="btn btn-primary" onclick="continuePackage('${this.currentPackageId}')">
                        <i class="fas fa-play"></i>
                        Continuar Estudando
                    </button>
                    <button class="btn btn-secondary" onclick="viewPackageDetails('${this.currentPackageId}')">
                        <i class="fas fa-info-circle"></i>
                        Ver Detalhes
                    </button>
                </div>
            </div>
        `;
    }
    
    /**
     * Manipula clique em card de métrica
     */
    handleMetricCardClick(card) {
        const metricTitle = card.querySelector('.metric-title').textContent;
        
        // Adicionar efeito visual
        card.style.transform = 'scale(0.95)';
        setTimeout(() => {
            card.style.transform = '';
        }, 150);
        
        window.showToast(`Visualizando ${metricTitle}`, 'info');
        
        // Aqui será implementada a navegação para página de detalhes
        console.log('Navigating to metric details:', metricTitle);
    }
    
    /**
     * Manipula clique em card de ação
     */
    handleActionCardClick(event, card) {
        // Adicionar efeito de loading se necessário
        const actionTitle = card.querySelector('h3').textContent;
        
        // Para algumas ações, mostrar loading
        if (actionTitle.includes('Explorar') || actionTitle.includes('Desempenho')) {
            event.preventDefault();
            
            window.showLoading(card);
            
            setTimeout(() => {
                window.hideLoading(card);
                window.location.href = card.href;
            }, 500);
        }
    }
    
    /**
     * Obtém ID do pacote a partir do card
     */
    getPackageIdFromCard(card) {
        const continueBtn = card.querySelector('a[href*="/packages/"]');
        if (continueBtn) {
            const match = continueBtn.href.match(/\/packages\/(\d+)\//);
            return match ? match[1] : '1';
        }
        return '1';
    }
    
    /**
     * Atualiza dados do dashboard
     */
    async refreshDashboard() {
        window.showToast('Atualizando dashboard...', 'info');
        
        try {
            await this.loadDashboardData();
            window.showToast('Dashboard atualizado!', 'success');
        } catch (error) {
            console.error('Erro ao atualizar dashboard:', error);
            window.showToast('Erro ao atualizar dashboard', 'error');
        }
    }
}

// Funções globais para uso nos templates
window.showProgressModal = function(packageId) {
    if (window.dashboardManager) {
        window.dashboardManager.showProgressModal(packageId);
    }
};

window.closeProgressModal = function() {
    if (window.dashboardManager) {
        window.dashboardManager.closeProgressModal();
    }
};

window.continuePackage = function(packageId) {
    window.showToast('Redirecionando para o pacote...', 'info');
    // Implementar navegação real
    console.log('Continue package:', packageId);
};

window.viewPackageDetails = function(packageId) {
    window.showToast('Visualizando detalhes do pacote...', 'info');
    // Implementar navegação real
    console.log('View package details:', packageId);
};

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    window.dashboardManager = new DashboardManager();
});

// CSS adicional para animações (injetado via JavaScript)
const additionalStyles = `
    .animate-in {
        animation: slideInUp 0.6s ease forwards;
    }
    
    @keyframes slideInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .loading-state,
    .error-state {
        text-align: center;
        padding: 2rem;
    }
    
    .loading-state .spinner {
        margin: 0 auto 1rem;
    }
    
    .error-state i {
        font-size: 2rem;
        color: var(--error);
        margin-bottom: 1rem;
        display: block;
    }
    
    .progress-details {
        padding: 1rem 0;
    }
    
    .progress-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
    }
    
    .progress-badge {
        background: var(--gradient-primary);
        color: white;
        padding: 0.25rem 0.75rem;
        border-radius: 1rem;
        font-size: 0.75rem;
        font-weight: 600;
    }
    
    .progress-stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: 1rem;
        margin-bottom: 1.5rem;
    }
    
    .progress-stat {
        text-align: center;
        padding: 1rem;
        background: var(--gray-50);
        border-radius: 0.5rem;
    }
    
    .progress-stat .stat-label {
        display: block;
        font-size: 0.75rem;
        color: var(--gray-600);
        margin-bottom: 0.25rem;
    }
    
    .progress-stat .stat-value {
        display: block;
        font-size: 1rem;
        font-weight: 600;
        color: var(--gray-800);
    }
    
    .progress-bar-container {
        margin-bottom: 1.5rem;
    }
    
    .progress-actions {
        display: flex;
        gap: 0.75rem;
    }
    
    .progress-actions .btn {
        flex: 1;
    }
`;

// Injetar estilos adicionais
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet); 