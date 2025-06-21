/**
 * CodePath - Sistema de Navegação Inteligente entre Aulas
 * 
 * Este arquivo implementa a navegação avançada entre aulas com:
 * - Sistema de pré-requisitos
 * - Validação de acesso
 * - Redirecionamento automático
 * - Interface responsiva
 */

class LessonNavigationManager {
    constructor() {
        this.currentLessonId = null;
        this.packageId = null;
        this.lessonData = null;
        this.navigationData = null;
        this.init();
    }

    /**
     * Inicializar o sistema de navegação
     */
    init() {
        this.extractLessonInfo();
        this.bindNavigationEvents();
        this.loadNavigationData();
        this.setupKeyboardNavigation();
        this.checkPrerequisites();
    }

    /**
     * Extrair informações da aula atual da página
     */
    extractLessonInfo() {
        const markCompleteBtn = document.getElementById('markCompleteBtn');
        if (markCompleteBtn) {
            this.currentLessonId = markCompleteBtn.dataset.lessonId;
        }

        // Extrair package ID do breadcrumb
        const packageLink = document.querySelector('.breadcrumb-item[href*="/content/package/"]');
        if (packageLink) {
            const match = packageLink.href.match(/\/content\/package\/(\d+)\/lessons/);
            if (match) {
                this.packageId = match[1];
            }
        }
    }

    /**
     * Vincular eventos de navegação
     */
    bindNavigationEvents() {
        // Botões de navegação anterior/próxima
        const prevBtn = document.querySelector('.nav-btn.nav-prev');
        const nextBtn = document.querySelector('.nav-btn.nav-next');

        if (prevBtn) {
            prevBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.navigateToPrevious();
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.navigateToNext();
            });
        }

        // Botões de navegação rápida (se existirem)
        this.bindQuickNavigationEvents();

        // Auto-navegação após conclusão
        this.bindAutoNavigationEvents();
    }

    /**
     * Configurar navegação por teclado
     */
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            // Verificar se não está em um input ou textarea
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }

            switch (e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    this.navigateToPrevious();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.navigateToNext();
                    break;
                case ' ': // Barra de espaço para marcar como concluída
                    e.preventDefault();
                    this.triggerMarkComplete();
                    break;
                case 'Escape':
                    this.closeNavigationModals();
                    break;
            }
        });
    }

    /**
     * Carregar dados de navegação do servidor
     */
    async loadNavigationData() {
        try {
            if (!this.packageId) return;

            const response = await fetch(`/content/api/package/${this.packageId}/lessons`);
            const data = await response.json();

            if (data.success) {
                this.navigationData = data.data;
                this.updateNavigationUI();
            }
        } catch (error) {
            console.error('Erro ao carregar dados de navegação:', error);
        }
    }

    /**
     * Verificar pré-requisitos da aula atual
     */
    async checkPrerequisites() {
        try {
            if (!this.currentLessonId) return;

            const response = await fetch(`/content/api/lesson/${this.currentLessonId}/prerequisites`);
            const data = await response.json();

            if (data.success && !data.data.can_access) {
                this.showPrerequisiteWarning(data.data.missing_prerequisites);
            }
        } catch (error) {
            console.error('Erro ao verificar pré-requisitos:', error);
        }
    }

    /**
     * Navegar para a aula anterior
     */
    async navigateToPrevious() {
        try {
            const prevBtn = document.querySelector('.nav-btn.nav-prev');
            if (!prevBtn || prevBtn.classList.contains('disabled')) {
                this.showNotification('Esta é a primeira aula do pacote', 'info');
                return;
            }

            this.showNavigationLoading('prev');
            
            // Usar a rota de navegação do servidor
            window.location.href = `/content/lesson/${this.currentLessonId}/previous`;

        } catch (error) {
            console.error('Erro na navegação anterior:', error);
            this.showNotification('Erro ao navegar para aula anterior', 'error');
            this.hideNavigationLoading();
        }
    }

    /**
     * Navegar para a próxima aula
     */
    async navigateToNext() {
        try {
            const nextBtn = document.querySelector('.nav-btn.nav-next');
            if (!nextBtn || nextBtn.classList.contains('disabled')) {
                this.showNotification('Esta é a última aula do pacote', 'info');
                return;
            }

            // Verificar se a aula atual foi concluída
            const canProceed = await this.checkCanProceedToNext();
            if (!canProceed) {
                this.showCompletionPrompt();
                return;
            }

            this.showNavigationLoading('next');
            
            // Usar a rota de navegação do servidor
            window.location.href = `/content/lesson/${this.currentLessonId}/next`;

        } catch (error) {
            console.error('Erro na navegação próxima:', error);
            this.showNotification('Erro ao navegar para próxima aula', 'error');
            this.hideNavigationLoading();
        }
    }

    /**
     * Verificar se pode prosseguir para próxima aula
     */
    async checkCanProceedToNext() {
        try {
            const response = await fetch(`/content/api/lesson/${this.currentLessonId}/status`);
            const data = await response.json();

            if (data.success) {
                return data.data.is_completed;
            }
            return false;
        } catch (error) {
            console.error('Erro ao verificar status da aula:', error);
            return false;
        }
    }

    /**
     * Mostrar prompt para completar aula antes de prosseguir
     */
    showCompletionPrompt() {
        const modal = this.createModal({
            title: 'Concluir Aula',
            message: 'Você precisa marcar esta aula como concluída antes de prosseguir para a próxima.',
            buttons: [
                {
                    text: 'Marcar como Concluída',
                    class: 'btn-primary',
                    action: () => {
                        this.triggerMarkComplete();
                        this.closeModal(modal);
                    }
                },
                {
                    text: 'Cancelar',
                    class: 'btn-secondary',
                    action: () => this.closeModal(modal)
                }
            ]
        });

        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('show'), 10);
    }

    /**
     * Vincular eventos de navegação rápida
     */
    bindQuickNavigationEvents() {
        // Menu dropdown de navegação rápida (se existir)
        const quickNavBtn = document.getElementById('quickNavBtn');
        if (quickNavBtn) {
            quickNavBtn.addEventListener('click', () => {
                this.toggleQuickNavigation();
            });
        }

        // Lista de aulas no sidebar (se existir)
        const lessonLinks = document.querySelectorAll('.lesson-list-item');
        lessonLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.navigateToLesson(link.dataset.lessonId);
            });
        });
    }

    /**
     * Vincular eventos de auto-navegação
     */
    bindAutoNavigationEvents() {
        // Escutar evento customizado de aula concluída
        document.addEventListener('lessonCompleted', (e) => {
            if (e.detail.nextLesson) {
                this.showAutoNavigationPrompt(e.detail.nextLesson);
            }
        });
    }

    /**
     * Mostrar prompt de auto-navegação após conclusão
     */
    showAutoNavigationPrompt(nextLesson) {
        const modal = this.createModal({
            title: 'Parabéns! 🎉',
            message: `Aula concluída com sucesso! Deseja continuar para a próxima aula: "${nextLesson.name}"?`,
            buttons: [
                {
                    text: 'Continuar',
                    class: 'btn-primary',
                    action: () => {
                        window.location.href = nextLesson.url;
                    }
                },
                {
                    text: 'Ficar Aqui',
                    class: 'btn-secondary',
                    action: () => this.closeModal(modal)
                }
            ],
            autoClose: 10000 // Auto-fechar em 10 segundos
        });

        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('show'), 10);

        // Countdown para auto-navegação
        this.startAutoNavigationCountdown(modal, nextLesson.url, 10);
    }

    /**
     * Iniciar countdown para auto-navegação
     */
    startAutoNavigationCountdown(modal, url, seconds) {
        const countdownEl = modal.querySelector('.countdown');
        if (!countdownEl) return;

        let remaining = seconds;
        const interval = setInterval(() => {
            remaining--;
            countdownEl.textContent = remaining;

            if (remaining <= 0) {
                clearInterval(interval);
                window.location.href = url;
            }
        }, 1000);

        // Cancelar countdown se modal for fechado
        modal.addEventListener('click', () => {
            clearInterval(interval);
        });
    }

    /**
     * Navegar para uma aula específica
     */
    async navigateToLesson(lessonId) {
        try {
            // Verificar pré-requisitos
            const response = await fetch(`/content/api/lesson/${lessonId}/prerequisites`);
            const data = await response.json();

            if (data.success && !data.data.can_access) {
                this.showPrerequisiteWarning(data.data.missing_prerequisites);
                return;
            }

            // Navegar para a aula
            window.location.href = `/content/lesson/${lessonId}`;

        } catch (error) {
            console.error('Erro ao navegar para aula:', error);
            this.showNotification('Erro ao navegar para aula', 'error');
        }
    }

    /**
     * Mostrar aviso de pré-requisitos
     */
    showPrerequisiteWarning(missingPrerequisites) {
        const prereqList = missingPrerequisites.map(p => `• ${p.name}`).join('\n');
        
        const modal = this.createModal({
            title: 'Pré-requisitos Necessários',
            message: `Para acessar esta aula, você precisa completar:\n\n${prereqList}`,
            buttons: [
                {
                    text: 'Entendi',
                    class: 'btn-primary',
                    action: () => this.closeModal(modal)
                }
            ]
        });

        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('show'), 10);
    }

    /**
     * Atualizar interface de navegação
     */
    updateNavigationUI() {
        if (!this.navigationData) return;

        // Atualizar progresso do pacote
        this.updatePackageProgress();

        // Atualizar lista de aulas (se existir)
        this.updateLessonList();

        // Atualizar indicadores de navegação
        this.updateNavigationIndicators();
    }

    /**
     * Atualizar progresso do pacote
     */
    updatePackageProgress() {
        const progressBar = document.querySelector('.progress-fill');
        const progressText = document.querySelector('.progress-percentage');

        if (progressBar && this.navigationData.progressStats) {
            const percentage = this.navigationData.progressStats.progress_percentage;
            progressBar.style.width = `${percentage}%`;
            
            if (progressText) {
                progressText.textContent = `${percentage}%`;
            }
        }
    }

    /**
     * Mostrar loading na navegação
     */
    showNavigationLoading(direction) {
        const btn = document.querySelector(`.nav-btn.nav-${direction}`);
        if (btn) {
            btn.classList.add('loading');
            btn.style.pointerEvents = 'none';
        }
    }

    /**
     * Esconder loading na navegação
     */
    hideNavigationLoading() {
        const btns = document.querySelectorAll('.nav-btn.loading');
        btns.forEach(btn => {
            btn.classList.remove('loading');
            btn.style.pointerEvents = 'auto';
        });
    }

    /**
     * Disparar marcação de aula como concluída
     */
    triggerMarkComplete() {
        const markCompleteBtn = document.getElementById('markCompleteBtn');
        if (markCompleteBtn && !markCompleteBtn.disabled) {
            markCompleteBtn.click();
        }
    }

    /**
     * Criar modal genérico
     */
    createModal({ title, message, buttons, autoClose }) {
        const modal = document.createElement('div');
        modal.className = 'navigation-modal';
        
        const buttonsHTML = buttons.map(btn => 
            `<button class="btn ${btn.class}" data-action="${btn.text}">${btn.text}</button>`
        ).join('');

        modal.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-content">
                    <h3 class="modal-title">${title}</h3>
                    <p class="modal-message">${message.replace(/\n/g, '<br>')}</p>
                    ${autoClose ? `<p class="modal-countdown">Auto-navegação em <span class="countdown">${Math.floor(autoClose/1000)}</span>s</p>` : ''}
                    <div class="modal-buttons">
                        ${buttonsHTML}
                    </div>
                </div>
            </div>
        `;

        // Vincular eventos dos botões
        buttons.forEach(btn => {
            const btnEl = modal.querySelector(`[data-action="${btn.text}"]`);
            if (btnEl) {
                btnEl.addEventListener('click', btn.action);
            }
        });

        return modal;
    }

    /**
     * Fechar modal
     */
    closeModal(modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            if (modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
        }, 300);
    }

    /**
     * Fechar todos os modais de navegação
     */
    closeNavigationModals() {
        const modals = document.querySelectorAll('.navigation-modal.show');
        modals.forEach(modal => this.closeModal(modal));
    }

    /**
     * Mostrar notificação
     */
    showNotification(message, type = 'info') {
        // Usar o sistema de notificações existente se disponível
        if (typeof window.showNotification === 'function') {
            window.showNotification(message, type);
            return;
        }

        // Fallback para notificação simples
        const notification = document.createElement('div');
        notification.className = `navigation-notification notification-${type}`;
        notification.textContent = message;

        document.body.appendChild(notification);
        
        setTimeout(() => notification.classList.add('show'), 10);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    new LessonNavigationManager();
});

// Exportar para uso global
window.LessonNavigationManager = LessonNavigationManager; 