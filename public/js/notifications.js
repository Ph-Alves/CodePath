/**
 * Sistema de Notificações - CodePath
 * Gerencia todas as funcionalidades de notificações no frontend
 * 
 * Funcionalidades:
 * - Abrir/fechar dropdown de notificações
 * - Marcar como lida/não lida
 * - Excluir notificações
 * - Carregar mais notificações (paginação)
 * - Toast de feedback
 * - Atualização automática de badge
 * - Polling em tempo real
 */

class NotificationManager {
    constructor() {
        this.isOpen = false;
        this.currentOffset = 0;
        this.limit = 10;
        this.hasMore = true;
        this.isLoading = false;
        this.lastCheck = null;
        this.pollingInterval = null;
        this.pollingEnabled = true;
        
        // Elementos DOM
        this.elements = {
            btn: null,
            dropdown: null,
            overlay: null,
            badge: null,
            content: null,
            loading: null,
            toast: null,
            loadMoreBtn: null
        };
        
        this.init();
    }

    /**
     * Inicializar o sistema de notificações
     */
    init() {
        this.bindElements();
        this.bindEvents();
        this.loadInitialNotifications();
        
        // Iniciar polling automático
        this.startPolling();
        
        // Auto-atualizar a cada 30 segundos
        setInterval(() => {
            this.updateBadgeCount();
        }, 30000);
        
        // Pausar polling quando a aba perde foco
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.stopPolling();
            } else {
                this.startPolling();
            }
        });
    }

    /**
     * Vincular elementos DOM
     */
    bindElements() {
        this.elements.btn = document.getElementById('notificationBtn');
        this.elements.dropdown = document.getElementById('notificationDropdown');
        this.elements.overlay = document.getElementById('notificationOverlay');
        this.elements.badge = document.getElementById('notificationBadge');
        this.elements.content = document.getElementById('notificationContent');
        this.elements.loading = document.getElementById('notificationLoading');
        this.elements.toast = document.getElementById('notificationToast');
        this.elements.loadMoreBtn = document.getElementById('loadMoreBtn');
    }

    /**
     * Vincular eventos
     */
    bindEvents() {
        // Botão principal de notificações
        if (this.elements.btn) {
            this.elements.btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggle();
            });
        }

        // Overlay para fechar
        if (this.elements.overlay) {
            this.elements.overlay.addEventListener('click', () => {
                this.close();
            });
        }

        // Fechar ao clicar fora
        document.addEventListener('click', (e) => {
            if (this.isOpen && !this.elements.dropdown?.contains(e.target)) {
                this.close();
            }
        });

        // Botão "Carregar mais"
        if (this.elements.loadMoreBtn) {
            this.elements.loadMoreBtn.addEventListener('click', () => {
                this.loadMoreNotifications();
            });
        }

        // Botões de ação (delegação de eventos)
        document.addEventListener('click', (e) => {
            if (e.target.closest('.btn-mark-read')) {
                const id = e.target.closest('.btn-mark-read').dataset.id;
                this.markAsRead(id);
            }
            
            if (e.target.closest('.btn-delete-notification')) {
                const id = e.target.closest('.btn-delete-notification').dataset.id;
                this.deleteNotification(id);
            }
            
            if (e.target.closest('.btn-notification-action')) {
                const url = e.target.closest('.btn-notification-action').dataset.url;
                window.location.href = url;
            }
            
            if (e.target.closest('#markAllReadBtn')) {
                this.markAllAsRead();
            }
            
            if (e.target.closest('#cleanupBtn')) {
                this.cleanup();
            }
        });

        // Fechar toast
        document.addEventListener('click', (e) => {
            if (e.target.closest('#toastClose')) {
                this.hideToast();
            }
        });

        // Auto-fechar toast após 5 segundos
        if (this.elements.toast) {
            this.elements.toast.addEventListener('transitionend', () => {
                if (this.elements.toast.classList.contains('show')) {
                    setTimeout(() => {
                        this.hideToast();
                    }, 5000);
                }
            });
        }
    }

    /**
     * Alternar visibilidade do dropdown
     */
    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    /**
     * Abrir dropdown
     */
    open() {
        if (!this.elements.dropdown) return;
        
        this.isOpen = true;
        this.elements.dropdown.classList.add('show');
        this.elements.overlay?.classList.add('show');
        
        // Carregar notificações se necessário
        if (this.currentOffset === 0) {
            this.loadNotifications();
        }
    }

    /**
     * Fechar dropdown
     */
    close() {
        if (!this.elements.dropdown) return;
        
        this.isOpen = false;
        this.elements.dropdown.classList.remove('show');
        this.elements.overlay?.classList.remove('show');
    }

    /**
     * Carregar notificações iniciais
     */
    async loadInitialNotifications() {
        try {
            await this.updateBadgeCount();
        } catch (error) {
            console.error('Erro ao carregar notificações iniciais:', error);
        }
    }

    /**
     * Carregar notificações
     */
    async loadNotifications(reset = false) {
        if (this.isLoading) return;
        
        this.isLoading = true;
        this.showLoading();
        
        try {
            const offset = reset ? 0 : this.currentOffset;
            const response = await fetch(`/notifications?limit=${this.limit}&offset=${offset}`);
            const data = await response.json();
            
            if (data.success) {
                if (reset) {
                    this.renderNotifications(data.notifications);
                    this.currentOffset = data.notifications.length;
                } else {
                    this.appendNotifications(data.notifications);
                    this.currentOffset += data.notifications.length;
                }
                
                this.hasMore = data.hasMore;
                this.updateLoadMoreButton();
                this.updateBadge(data.unreadCount);
            }
        } catch (error) {
            console.error('Erro ao carregar notificações:', error);
            this.showToast('Erro ao carregar notificações', 'error');
        } finally {
            this.isLoading = false;
            this.hideLoading();
        }
    }

    /**
     * Carregar mais notificações
     */
    async loadMoreNotifications() {
        if (!this.hasMore || this.isLoading) return;
        await this.loadNotifications();
    }

    /**
     * Marcar notificação como lida
     */
    async markAsRead(notificationId) {
        try {
            const response = await fetch(`/notifications/${notificationId}/read`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.updateNotificationUI(notificationId, { is_read: true });
                this.decrementBadge();
                this.showToast('Notificação marcada como lida');
            }
        } catch (error) {
            console.error('Erro ao marcar como lida:', error);
            this.showToast('Erro ao atualizar notificação', 'error');
        }
    }

    /**
     * Marcar todas como lidas
     */
    async markAllAsRead() {
        try {
            const response = await fetch('/notifications/read-all', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Atualizar UI de todas as notificações
                const unreadItems = document.querySelectorAll('.notification-item.unread');
                unreadItems.forEach(item => {
                    item.classList.remove('unread');
                    const markReadBtn = item.querySelector('.btn-mark-read');
                    if (markReadBtn) {
                        markReadBtn.remove();
                    }
                });
                
                this.updateBadge(0);
                this.showToast('Todas as notificações foram marcadas como lidas');
            }
        } catch (error) {
            console.error('Erro ao marcar todas como lidas:', error);
            this.showToast('Erro ao atualizar notificações', 'error');
        }
    }

    /**
     * Excluir notificação
     */
    async deleteNotification(notificationId) {
        if (!confirm('Deseja realmente excluir esta notificação?')) return;
        
        try {
            const response = await fetch(`/notifications/${notificationId}`, {
                method: 'DELETE'
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.removeNotificationFromUI(notificationId);
                this.showToast('Notificação excluída');
            }
        } catch (error) {
            console.error('Erro ao excluir notificação:', error);
            this.showToast('Erro ao excluir notificação', 'error');
        }
    }

    /**
     * Limpar notificações antigas
     */
    async cleanup() {
        if (!confirm('Deseja limpar notificações antigas (mais de 30 dias)?')) return;
        
        try {
            const response = await fetch('/notifications/cleanup', {
                method: 'DELETE'
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.loadNotifications(true);
                this.showToast(data.message);
            }
        } catch (error) {
            console.error('Erro ao limpar notificações:', error);
            this.showToast('Erro ao limpar notificações', 'error');
        }
    }

    /**
     * Atualizar contador do badge
     */
    async updateBadgeCount() {
        try {
            const response = await fetch('/notifications?limit=1');
            const data = await response.json();
            
            if (data.success) {
                this.updateBadge(data.unreadCount);
            }
        } catch (error) {
            console.error('Erro ao atualizar badge:', error);
        }
    }

    /**
     * Renderizar notificações
     */
    renderNotifications(notifications) {
        if (!this.elements.content) return;
        
        if (notifications.length === 0) {
            this.elements.content.innerHTML = this.getEmptyState();
            return;
        }
        
        const html = notifications.map(notification => this.getNotificationHTML(notification)).join('');
        this.elements.content.innerHTML = `<div class="notification-list">${html}</div>`;
    }

    /**
     * Adicionar notificações ao final
     */
    appendNotifications(notifications) {
        if (!this.elements.content || notifications.length === 0) return;
        
        const list = this.elements.content.querySelector('.notification-list');
        if (!list) return;
        
        const html = notifications.map(notification => this.getNotificationHTML(notification)).join('');
        list.insertAdjacentHTML('beforeend', html);
    }

    /**
     * Gerar HTML de uma notificação
     */
    getNotificationHTML(notification) {
        const isUnread = !notification.is_read;
        const iconClass = this.getNotificationIcon(notification.type);
        
        return `
            <div class="notification-item ${isUnread ? 'unread' : ''}" data-id="${notification.id}">
                <div class="notification-icon">
                    <i class="${iconClass}"></i>
                </div>
                <div class="notification-body">
                    <h4 class="notification-title">${notification.title}</h4>
                    <p class="notification-message">${notification.message}</p>
                    <div class="notification-meta">
                        <span class="notification-time">${notification.time_group}</span>
                        ${isUnread ? '<span class="notification-status">Nova</span>' : ''}
                    </div>
                </div>
                <div class="notification-controls">
                    ${notification.action_url ? `
                        <button class="btn-notification-action" data-url="${notification.action_url}" title="Ir para">
                            <i class="fas fa-external-link-alt"></i>
                        </button>
                    ` : ''}
                    ${isUnread ? `
                        <button class="btn-mark-read" data-id="${notification.id}" title="Marcar como lida">
                            <i class="fas fa-check"></i>
                        </button>
                    ` : ''}
                    <button class="btn-delete-notification" data-id="${notification.id}" title="Excluir">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Obter ícone da notificação por tipo
     */
    getNotificationIcon(type) {
        const icons = {
            welcome: 'fas fa-hand-wave text-success',
            progress: 'fas fa-chart-line text-primary',
            quiz: 'fas fa-question-circle text-info',
            streak: 'fas fa-fire text-warning',
            content: 'fas fa-book text-purple'
        };
        
        return icons[type] || 'fas fa-bell text-primary';
    }

    /**
     * Estado vazio
     */
    getEmptyState() {
        return `
            <div class="notification-empty">
                <div class="empty-icon">
                    <i class="fas fa-bell-slash"></i>
                </div>
                <h4>Nenhuma notificação</h4>
                <p>Você não tem notificações no momento.</p>
            </div>
        `;
    }

    /**
     * Atualizar UI de uma notificação específica
     */
    updateNotificationUI(notificationId, updates) {
        const item = document.querySelector(`[data-id="${notificationId}"]`);
        if (!item) return;
        
        if (updates.is_read) {
            item.classList.remove('unread');
            const markReadBtn = item.querySelector('.btn-mark-read');
            if (markReadBtn) {
                markReadBtn.remove();
            }
            const statusSpan = item.querySelector('.notification-status');
            if (statusSpan) {
                statusSpan.remove();
            }
        }
    }

    /**
     * Remover notificação da UI
     */
    removeNotificationFromUI(notificationId) {
        const item = document.querySelector(`[data-id="${notificationId}"]`);
        if (item) {
            item.style.transform = 'translateX(100%)';
            item.style.opacity = '0';
            setTimeout(() => {
                item.remove();
                
                // Verificar se lista está vazia
                const list = document.querySelector('.notification-list');
                if (list && list.children.length === 0) {
                    this.elements.content.innerHTML = this.getEmptyState();
                }
            }, 300);
        }
    }

    /**
     * Atualizar badge
     */
    updateBadge(count) {
        if (!this.elements.badge) return;
        
        if (count > 0) {
            this.elements.badge.textContent = count > 99 ? '99+' : count;
            this.elements.badge.style.display = 'flex';
        } else {
            this.elements.badge.style.display = 'none';
        }
    }

    /**
     * Decrementar badge
     */
    decrementBadge() {
        if (!this.elements.badge) return;
        
        const currentCount = parseInt(this.elements.badge.textContent) || 0;
        const newCount = Math.max(0, currentCount - 1);
        this.updateBadge(newCount);
    }

    /**
     * Atualizar botão "Carregar mais"
     */
    updateLoadMoreButton() {
        if (!this.elements.loadMoreBtn) return;
        
        if (this.hasMore && this.currentOffset > 0) {
            this.elements.loadMoreBtn.style.display = 'flex';
        } else {
            this.elements.loadMoreBtn.style.display = 'none';
        }
    }

    /**
     * Mostrar loading
     */
    showLoading() {
        if (this.elements.loading) {
            this.elements.loading.style.display = 'block';
        }
    }

    /**
     * Esconder loading
     */
    hideLoading() {
        if (this.elements.loading) {
            this.elements.loading.style.display = 'none';
        }
    }

    /**
     * Mostrar toast
     */
    showToast(message, type = 'success') {
        if (!this.elements.toast) return;
        
        const messageEl = document.getElementById('toastMessage');
        const iconEl = this.elements.toast.querySelector('.toast-icon i');
        
        if (messageEl) {
            messageEl.textContent = message;
        }
        
        if (iconEl) {
            iconEl.className = type === 'error' ? 'fas fa-exclamation-circle' : 'fas fa-check-circle';
        }
        
        this.elements.toast.classList.add('show');
    }

    /**
     * Esconder toast
     */
    hideToast() {
        if (this.elements.toast) {
            this.elements.toast.classList.remove('show');
        }
    }

    /**
     * Iniciar polling em tempo real
     */
    startPolling() {
        if (!this.pollingEnabled || this.pollingInterval) return;
        
        this.pollingInterval = setInterval(() => {
            this.pollForNewNotifications();
        }, 15000); // Poll a cada 15 segundos
    }

    /**
     * Parar polling
     */
    stopPolling() {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
        }
    }

    /**
     * Verificar novas notificações via polling
     */
    async pollForNewNotifications() {
        try {
            const params = new URLSearchParams();
            if (this.lastCheck) {
                params.append('lastCheck', this.lastCheck);
            }
            
            const response = await fetch(`/notifications/poll?${params}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.success) {
                // Atualizar timestamp do último check
                this.lastCheck = data.timestamp;
                
                // Se há novas notificações, adiciona ao topo da lista
                if (data.newNotifications && data.newNotifications.length > 0) {
                    this.prependNotifications(data.newNotifications);
                    
                    // Mostrar toast para primeira notificação nova
                    const firstNew = data.newNotifications[0];
                    this.showToast(`Nova notificação: ${firstNew.title}`, 'info');
                    
                    // Piscar o badge se há notificações não lidas
                    if (data.unreadCount > 0) {
                        this.flashBadge();
                    }
                }
                
                // Atualizar badge count
                this.updateBadge(data.unreadCount);
            }
        } catch (error) {
            console.error('Erro no polling de notificações:', error);
            // Em caso de erro, reduzir frequência do polling
            this.stopPolling();
            setTimeout(() => this.startPolling(), 60000); // Tentar novamente em 1 minuto
        }
    }

    /**
     * Adicionar notificações no topo da lista
     */
    prependNotifications(notifications) {
        if (!this.elements.content) return;
        
        const existingContent = this.elements.content.innerHTML;
        const newNotificationsHTML = notifications.map(n => this.getNotificationHTML(n)).join('');
        
        this.elements.content.innerHTML = newNotificationsHTML + existingContent;
        
        // Animar entrada das novas notificações
        const newElements = this.elements.content.querySelectorAll('.notification-item:nth-child(-n+' + notifications.length + ')');
        newElements.forEach((el, index) => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(-10px)';
            
            setTimeout(() => {
                el.style.transition = 'all 0.3s ease';
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }

    /**
     * Piscar o badge para chamar atenção
     */
    flashBadge() {
        if (!this.elements.badge) return;
        
        this.elements.badge.classList.add('flash');
        setTimeout(() => {
            this.elements.badge.classList.remove('flash');
        }, 1000);
    }
}

// Instância global
window.NotificationManager = new NotificationManager(); 