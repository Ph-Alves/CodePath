/**
 * ADMIN PACKAGES MANAGER - CODEPATH
 * Sistema de gerenciamento administrativo de pacotes
 */

class AdminPackagesManager {
    constructor() {
        this.packages = [];
        this.filteredPackages = [];
        this.currentEditingId = null;
        
        this.init();
    }

    /**
     * Inicialização do sistema
     */
    init() {
        this.bindEvents();
        this.loadPackages();
    }

    /**
     * Vincular eventos da interface
     */
    bindEvents() {
        // Botões principais
        document.getElementById('addPackageBtn').addEventListener('click', () => this.openAddModal());
        document.getElementById('refreshBtn').addEventListener('click', () => this.loadPackages());
        
        // Botão adicionar primeiro pacote (estado vazio)
        const addFirstBtn = document.getElementById('addFirstPackageBtn');
        if (addFirstBtn) {
            addFirstBtn.addEventListener('click', () => this.openAddModal());
        }
        
        // Modal
        document.getElementById('closeModal').addEventListener('click', () => this.closeModal());
        document.getElementById('cancelBtn').addEventListener('click', () => this.closeModal());
        document.getElementById('packageForm').addEventListener('submit', (e) => this.handleFormSubmit(e));
        
        // Modal de confirmação
        document.getElementById('confirmCancel').addEventListener('click', () => this.closeConfirmModal());
        document.getElementById('confirmAction').addEventListener('click', () => this.executeConfirmedAction());
        
        // Filtros
        document.getElementById('statusFilter').addEventListener('change', () => this.applyFilters());
        document.getElementById('difficultyFilter').addEventListener('change', () => this.applyFilters());
        document.getElementById('searchFilter').addEventListener('input', () => this.applyFilters());
        
        // Limpar filtros
        const clearFiltersBtn = document.getElementById('clearFiltersBtn');
        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', () => this.clearFilters());
        }
        
        // Fechar modal clicando fora
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal();
                    this.closeConfirmModal();
                }
            });
        });
        
        // Tecla ESC para fechar modais
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
                this.closeConfirmModal();
            }
        });
    }

    /**
     * Carregar lista de pacotes
     */
    async loadPackages() {
        try {
            this.showTableLoading(true);
            
            const response = await fetch('/admin/api/packages');
            const data = await response.json();
            
            if (data.success) {
                this.packages = data.packages;
                this.filteredPackages = [...this.packages];
                this.renderPackagesGrid();
                this.updateStats();
            } else {
                this.showToast('Erro ao carregar pacotes', 'error');
            }
        } catch (error) {
            console.error('Erro ao carregar pacotes:', error);
            this.showToast('Erro de conexão', 'error');
        } finally {
            this.showTableLoading(false);
        }
    }

    /**
     * Renderizar grid de pacotes
     */
    renderPackagesGrid() {
        const grid = document.getElementById('packagesGrid');
        const emptyState = document.getElementById('emptyState');
        
        if (this.filteredPackages.length === 0) {
            grid.innerHTML = '';
            emptyState.style.display = 'block';
            return;
        }
        
        emptyState.style.display = 'none';
        
        grid.innerHTML = this.filteredPackages.map(pkg => `
            <div class="package-card ${pkg.is_active ? 'active' : 'inactive'}" data-package-id="${pkg.id}">
                <div class="package-card-header">
                    <div class="package-icon">
                        <i class="${pkg.icon || 'fas fa-code'}"></i>
                    </div>
                    <div class="package-status-badge">
                        ${pkg.is_active ? 
                            '<span class="status-badge status-active"><i class="fas fa-check-circle"></i> Ativo</span>' :
                            '<span class="status-badge status-inactive"><i class="fas fa-pause-circle"></i> Inativo</span>'
                        }
                    </div>
                </div>
                
                <div class="package-card-content">
                    <h3 class="package-name">${this.escapeHtml(pkg.name)}</h3>
                    <p class="package-description">${this.escapeHtml(pkg.description)}</p>
                    
                    <div class="package-metadata">
                        <div class="metadata-item">
                    <span class="difficulty-badge difficulty-${pkg.difficulty}">${pkg.difficulty}</span>
                        </div>
                        <div class="metadata-item">
                            <i class="fas fa-clock"></i>
                            <span>${pkg.duration_hours}h</span>
                        </div>
                        <div class="metadata-item">
                            <i class="fas fa-book"></i>
                            <span>${pkg.lesson_count || 0} aulas</span>
                        </div>
                        <div class="metadata-item">
                            <i class="fas fa-star"></i>
                            <span>${pkg.rating || 0}</span>
                        </div>
                    </div>
                    
                    ${pkg.tags ? `
                        <div class="package-tags">
                            ${pkg.tags.split(',').map(tag => `<span class="tag">${tag.trim()}</span>`).join('')}
                        </div>
                    ` : ''}
                </div>
                
                <div class="package-card-actions">
                    <button class="btn-action btn-edit" data-id="${pkg.id}" title="Editar Pacote">
                            <i class="fas fa-edit"></i>
                        Editar
                        </button>
                    
                        ${pkg.is_active ?
                        `<button class="btn-action btn-delete" data-id="${pkg.id}" title="Desativar Pacote">
                                <i class="fas fa-pause"></i>
                            Desativar
                            </button>` :
                        `<button class="btn-action btn-reactivate" data-id="${pkg.id}" title="Reativar Pacote">
                                <i class="fas fa-play"></i>
                            Reativar
                            </button>`
                        }
                    
                    <button class="btn-action btn-view" data-id="${pkg.id}" title="Ver Detalhes">
                        <i class="fas fa-eye"></i>
                        Detalhes
                    </button>
                </div>
                    </div>
        `).join('');
        
        // Vincular eventos dos botões de ação
        this.bindActionButtons();
    }

    /**
     * Vincular eventos dos botões de ação
     */
    bindActionButtons() {
        // Botões de editar
        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                this.openEditModal(parseInt(id));
            });
        });
        
        // Botões de desativar
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                this.confirmDelete(parseInt(id));
            });
        });
        
        // Botões de reativar
        document.querySelectorAll('.btn-reactivate').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                this.confirmReactivate(parseInt(id));
            });
        });
        
        // Botões de visualizar
        document.querySelectorAll('.btn-view').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                this.viewPackageDetails(parseInt(id));
            });
        });
    }

    /**
     * Aplicar filtros
     */
    applyFilters() {
        const statusFilter = document.getElementById('statusFilter').value;
        const difficultyFilter = document.getElementById('difficultyFilter').value;
        const searchFilter = document.getElementById('searchFilter').value.toLowerCase();
        
        this.filteredPackages = this.packages.filter(pkg => {
            // Filtro de status
            if (statusFilter !== '' && pkg.is_active.toString() !== statusFilter) {
                return false;
            }
            
            // Filtro de dificuldade
            if (difficultyFilter !== '' && pkg.difficulty !== difficultyFilter) {
                return false;
            }
            
            // Filtro de busca
            if (searchFilter !== '') {
                const searchText = `${pkg.name} ${pkg.description} ${pkg.tags || ''}`.toLowerCase();
                if (!searchText.includes(searchFilter)) {
                return false;
                }
            }
            
            return true;
        });
        
        this.renderPackagesGrid();
    }

    /**
     * Limpar filtros
     */
    clearFilters() {
        document.getElementById('statusFilter').value = '';
        document.getElementById('difficultyFilter').value = '';
        document.getElementById('searchFilter').value = '';
        
        this.filteredPackages = [...this.packages];
        this.renderPackagesGrid();
        
        this.showToast('Filtros limpos', 'success');
    }

    /**
     * Ver detalhes do pacote
     */
    viewPackageDetails(packageId) {
        const pkg = this.packages.find(p => p.id === packageId);
        if (!pkg) return;
        
        // Por enquanto, apenas mostra um alerta com os detalhes
        // Futuramente pode abrir um modal de detalhes
        const details = `
Pacote: ${pkg.name}
Descrição: ${pkg.description}
Dificuldade: ${pkg.difficulty}
Duração: ${pkg.duration_hours}h
Aulas: ${pkg.lesson_count || 0}
Rating: ${pkg.rating || 'N/A'}
Status: ${pkg.is_active ? 'Ativo' : 'Inativo'}
Tags: ${pkg.tags || 'Nenhuma'}
        `.trim();
        
        alert(details);
    }

    /**
     * Abrir modal para adicionar pacote
     */
    openAddModal() {
        this.currentEditingId = null;
        document.getElementById('modalTitle').textContent = 'Novo Pacote';
        document.getElementById('packageForm').reset();
        document.getElementById('packageActive').checked = true;
        this.openModal();
    }

    /**
     * Abrir modal para editar pacote
     */
    async openEditModal(packageId) {
        try {
            this.currentEditingId = packageId;
            document.getElementById('modalTitle').textContent = 'Editar Pacote';
            
            const response = await fetch(`/admin/api/packages/${packageId}`);
            const data = await response.json();
            
            if (data.success) {
                const pkg = data.package;
                
                // Preencher formulário
                document.getElementById('packageName').value = pkg.name || '';
                document.getElementById('packageDescription').value = pkg.description || '';
                document.getElementById('packageDifficulty').value = pkg.difficulty || '';
                document.getElementById('packageDuration').value = pkg.duration_hours || '';
                document.getElementById('packageRating').value = pkg.rating || '';
                document.getElementById('packageTags').value = pkg.tags || '';
                document.getElementById('packagePrerequisites').value = pkg.prerequisites || '';
                document.getElementById('packageIcon').value = pkg.icon || 'fas fa-code';
                document.getElementById('packageActive').checked = Boolean(pkg.is_active);
                
                this.openModal();
            } else {
                this.showToast('Erro ao carregar dados do pacote', 'error');
            }
        } catch (error) {
            console.error('Erro ao carregar pacote:', error);
            this.showToast('Erro de conexão', 'error');
        }
    }

    /**
     * Abrir modal
     */
    openModal() {
        document.getElementById('packageModal').classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Focar no primeiro campo
        setTimeout(() => {
            document.getElementById('packageName').focus();
        }, 100);
    }

    /**
     * Fechar modal
     */
    closeModal() {
        document.getElementById('packageModal').classList.remove('active');
        document.body.style.overflow = '';
        this.currentEditingId = null;
    }

    /**
     * Manipular envio do formulário
     */
    async handleFormSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const packageData = {
            name: formData.get('name'),
            description: formData.get('description'),
            difficulty: formData.get('difficulty'),
            duration_hours: parseInt(formData.get('duration_hours')),
            rating: parseFloat(formData.get('rating')) || 0,
            tags: formData.get('tags'),
            prerequisites: formData.get('prerequisites'),
            icon: formData.get('icon'),
            is_active: formData.get('is_active') === 'on'
        };
        
        try {
            const isEditing = this.currentEditingId !== null;
            const url = isEditing ? 
                `/admin/api/packages/${this.currentEditingId}` : 
                '/admin/api/packages';
            const method = isEditing ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(packageData)
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.showToast(
                    isEditing ? 'Pacote atualizado com sucesso' : 'Pacote criado com sucesso',
                    'success'
                );
                this.closeModal();
                this.loadPackages();
            } else {
                this.showToast(data.message || 'Erro ao salvar pacote', 'error');
            }
        } catch (error) {
            console.error('Erro ao salvar pacote:', error);
            this.showToast('Erro de conexão', 'error');
        }
    }

    /**
     * Confirmar exclusão de pacote
     */
    confirmDelete(packageId) {
        const pkg = this.packages.find(p => p.id === packageId);
        if (!pkg) return;
        
        this.showConfirmModal(
            'Desativar Pacote',
            `Tem certeza que deseja desativar o pacote "${pkg.name}"?`,
            () => this.deletePackage(packageId)
        );
    }

    /**
     * Confirmar reativação de pacote
     */
    confirmReactivate(packageId) {
        const pkg = this.packages.find(p => p.id === packageId);
        if (!pkg) return;
        
        this.showConfirmModal(
            'Reativar Pacote',
            `Tem certeza que deseja reativar o pacote "${pkg.name}"?`,
            () => this.reactivatePackage(packageId)
        );
    }

    /**
     * Excluir pacote
     */
    async deletePackage(packageId) {
        try {
            const response = await fetch(`/admin/api/packages/${packageId}`, {
                method: 'DELETE'
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.showToast(data.message, 'success');
                this.loadPackages();
            } else {
                this.showToast(data.message || 'Erro ao desativar pacote', 'error');
            }
        } catch (error) {
            console.error('Erro ao desativar pacote:', error);
            this.showToast('Erro de conexão', 'error');
        }
    }

    /**
     * Reativar pacote
     */
    async reactivatePackage(packageId) {
        try {
            const response = await fetch(`/admin/api/packages/${packageId}/reactivate`, {
                method: 'PATCH'
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.showToast(data.message, 'success');
                this.loadPackages();
            } else {
                this.showToast(data.message || 'Erro ao reativar pacote', 'error');
            }
        } catch (error) {
            console.error('Erro ao reativar pacote:', error);
            this.showToast('Erro de conexão', 'error');
        }
    }

    /**
     * Mostrar modal de confirmação
     */
    showConfirmModal(title, message, action) {
        document.getElementById('confirmTitle').textContent = title;
        document.getElementById('confirmMessage').textContent = message;
        this.pendingAction = action;
        
        document.getElementById('confirmModal').classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    /**
     * Fechar modal de confirmação
     */
    closeConfirmModal() {
        document.getElementById('confirmModal').classList.remove('active');
        document.body.style.overflow = '';
        this.pendingAction = null;
    }

    /**
     * Executar ação confirmada
     */
    executeConfirmedAction() {
        if (this.pendingAction) {
            this.pendingAction();
            this.closeConfirmModal();
        }
    }

    /**
     * Atualizar estatísticas
     */
    updateStats() {
        const stats = {
            total_packages: this.packages.length,
            active_packages: this.packages.filter(p => p.is_active).length,
            inactive_packages: this.packages.filter(p => !p.is_active).length,
            avg_duration: this.packages.length > 0 ? 
                Math.round(this.packages.reduce((sum, p) => sum + p.duration_hours, 0) / this.packages.length) : 0
        };
        
        // Atualizar cards de estatísticas
        const statCards = document.querySelectorAll('.stat-card .stat-number');
        if (statCards.length >= 4) {
            statCards[0].textContent = stats.total_packages;
            statCards[1].textContent = stats.active_packages;
            statCards[2].textContent = stats.inactive_packages;
            statCards[3].textContent = `${stats.avg_duration}h`;
        }
    }

    /**
     * Mostrar/ocultar loading
     */
    showTableLoading(show) {
        const loading = document.getElementById('tableLoading');
        loading.style.display = show ? 'flex' : 'none';
    }

    /**
     * Mostrar toast de notificação
     */
    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        const toastMessage = toast.querySelector('.toast-message');
        const toastIcon = toast.querySelector('.toast-icon');
        
        // Remover classes anteriores
        toast.classList.remove('success', 'error', 'warning', 'info', 'show');
        
        // Adicionar nova classe
        toast.classList.add(type);
        
        // Definir ícone
        let icon = 'fas fa-info-circle';
        if (type === 'success') icon = 'fas fa-check-circle';
        else if (type === 'error') icon = 'fas fa-exclamation-circle';
        else if (type === 'warning') icon = 'fas fa-exclamation-triangle';
        
        toastIcon.className = `toast-icon ${icon}`;
        toastMessage.textContent = message;
        
        // Mostrar toast
        toast.classList.add('show');
        
        // Ocultar após 5 segundos
        setTimeout(() => {
            toast.classList.remove('show');
        }, 5000);
    }

    /**
     * Escapar HTML
     */
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    new AdminPackagesManager();
}); 
}); 