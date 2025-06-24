/**
 * CodePath - Administração de Aulas
 * Sistema completo de gerenciamento de aulas para administradores
 */

class AdminLessonsManager {
    constructor() {
        console.log('🚀 [ADMIN-LESSONS] Inicializando AdminLessonsManager...');
        console.log('🚀 [ADMIN-LESSONS] Hora de inicialização:', new Date().toLocaleTimeString());
        
        this.lessons = [];
        this.packages = [];
        this.filteredLessons = [];
        this.currentLessonId = null;
        this.sortableInstance = null;
        
        this.init();
        console.log('✅ [ADMIN-LESSONS] AdminLessonsManager inicializado com sucesso!');
    }

    /**
     * Inicializar o sistema
     */
    init() {
        this.bindEvents();
        this.loadInitialData();
        this.setupTooltips();
    }

    /**
     * Vincular eventos da interface
     */
    bindEvents() {
        // Botões principais
        document.getElementById('addLessonBtn')?.addEventListener('click', () => this.openLessonModal());
        document.getElementById('saveLessonBtn')?.addEventListener('click', () => this.saveLesson());
        document.getElementById('confirmDeleteLessonBtn')?.addEventListener('click', () => this.deleteLesson());

        // Filtros e busca
        document.getElementById('searchLessons')?.addEventListener('input', (e) => this.handleSearch(e.target.value));
        document.getElementById('filterPackage')?.addEventListener('change', (e) => this.handlePackageFilter(e.target.value));
        document.getElementById('sortLessons')?.addEventListener('change', (e) => this.handleSort(e.target.value));
        document.getElementById('resetFilters')?.addEventListener('click', () => this.resetFilters());
        document.getElementById('clearFiltersBtn')?.addEventListener('click', () => this.resetFilters());

        // Formulário
        document.getElementById('lessonForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveLesson();
        });

        // Mudança de pacote no formulário
        document.getElementById('lessonPackage')?.addEventListener('change', (e) => {
            this.updateLessonNumberSuggestion(e.target.value);
        });

        // Eventos delegados para botões dinâmicos
        document.addEventListener('click', (e) => {
            if (e.target.closest('.edit-lesson-btn')) {
                const lessonId = e.target.closest('.edit-lesson-btn').dataset.lessonId;
                console.log('🔧 [DEBUG] Botão EDITAR clicado para lessonId:', lessonId);
                console.log('🔧 [DEBUG] Elemento do botão:', e.target.closest('.edit-lesson-btn'));
                console.log('🔧 [DEBUG] Hora:', new Date().toLocaleTimeString());
                this.editLesson(parseInt(lessonId));
            }
            
            if (e.target.closest('.delete-lesson-btn')) {
                const lessonId = e.target.closest('.delete-lesson-btn').dataset.lessonId;
                console.log('🗑️ [DEBUG] Botão EXCLUIR clicado para lessonId:', lessonId);
                console.log('🗑️ [DEBUG] Elemento do botão:', e.target.closest('.delete-lesson-btn'));
                console.log('🗑️ [DEBUG] Hora:', new Date().toLocaleTimeString());
                this.confirmDeleteLesson(parseInt(lessonId));
            }
        });
    }

    /**
     * Carregar dados iniciais
     */
    async loadInitialData() {
        try {
            this.showLoading(true);
            
            // Carregar aulas
            const lessonsResponse = await fetch('/admin/api/lessons');
            if (lessonsResponse.ok) {
                const lessonsData = await lessonsResponse.json();
                this.lessons = lessonsData.lessons || [];
            }

            // Carregar pacotes para filtros
            const packagesResponse = await fetch('/admin/api/packages');
            if (packagesResponse.ok) {
                const packagesData = await packagesResponse.json();
                this.packages = packagesData.packages || [];
            }

            this.filteredLessons = [...this.lessons];
            this.renderLessonsTable();
            
        } catch (error) {
            console.error('Erro ao carregar dados iniciais:', error);
            this.showToast('Erro ao carregar dados', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    /**
     * Renderizar tabela de aulas
     */
    renderLessonsTable() {
        const tbody = document.getElementById('lessonsTableBody');
        const emptyState = document.getElementById('emptyState');
        
        if (!tbody) return;

        if (this.filteredLessons.length === 0) {
            tbody.innerHTML = '';
            emptyState?.style.setProperty('display', 'block');
            return;
        }

        emptyState?.style.setProperty('display', 'none');

        tbody.innerHTML = this.filteredLessons.map(lesson => `
            <tr data-lesson-id="${lesson.id}" data-package-id="${lesson.package_id}" class="lesson-row">
                <td class="drag-handle">
                    <i class="fas fa-grip-vertical text-muted"></i>
                </td>
                <td>
                    <div class="lesson-info">
                        <h6 class="lesson-name mb-1">${this.escapeHtml(lesson.name)}</h6>
                        <small class="lesson-description text-muted">
                            ${lesson.description ? this.truncateText(lesson.description, 80) : 'Sem descrição'}
                        </small>
                    </div>
                </td>
                <td>
                    <div class="package-info">
                        <i class="${lesson.package_icon || 'fas fa-box'} me-2 text-primary"></i>
                        <span>${this.escapeHtml(lesson.package_name || 'N/A')}</span>
                    </div>
                </td>
                <td>
                    <span class="badge bg-secondary">
                        ${lesson.lesson_number}/${lesson.order_sequence}
                    </span>
                </td>
                <td>
                    <div class="completion-stats">
                        <div class="progress mb-1" style="height: 8px;">
                            <div class="progress-bar bg-success" 
                                 style="width: ${lesson.completion_rate || 0}%"></div>
                        </div>
                        <small class="text-muted">
                            ${Math.round(lesson.completion_rate || 0)}% (${lesson.completion_count || 0} usuários)
                        </small>
                    </div>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-outline-primary edit-lesson-btn" 
                                data-lesson-id="${lesson.id}" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger delete-lesson-btn" 
                                data-lesson-id="${lesson.id}" title="Excluir">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

        // Reinicializar sortable após renderização
        this.initializeSortable();
    }

    /**
     * Inicializar funcionalidade de arrastar e soltar
     */
    initializeSortable() {
        const tbody = document.getElementById('lessonsTableBody');
        if (!tbody || typeof Sortable === 'undefined') return;

        // Destruir instância anterior se existir
        if (this.sortableInstance) {
            this.sortableInstance.destroy();
        }

        this.sortableInstance = new Sortable(tbody, {
            handle: '.drag-handle',
            animation: 150,
            ghostClass: 'sortable-ghost',
            chosenClass: 'sortable-chosen',
            dragClass: 'sortable-drag',
            onEnd: (evt) => {
                this.handleLessonReorder(evt);
            }
        });
    }

    /**
     * Lidar com reordenação de aulas
     */
    async handleLessonReorder(evt) {
        const lessonId = parseInt(evt.item.dataset.lessonId);
        const packageId = parseInt(evt.item.dataset.packageId);
        const newIndex = evt.newIndex;
        
        try {
            // Filtrar aulas do mesmo pacote
            const packageLessons = this.filteredLessons.filter(l => l.package_id === packageId);
            
            // Criar array de ordenação
            const lessonOrders = packageLessons.map((lesson, index) => ({
                lessonId: lesson.id,
                newOrder: index + 1
            }));

            // Ajustar a ordem da aula movida
            const movedLessonIndex = lessonOrders.findIndex(l => l.lessonId === lessonId);
            if (movedLessonIndex !== -1) {
                lessonOrders[movedLessonIndex].newOrder = newIndex + 1;
                
                // Reajustar outras aulas
                lessonOrders.forEach((lesson, index) => {
                    if (lesson.lessonId !== lessonId) {
                        lesson.newOrder = index >= newIndex ? index + 2 : index + 1;
                    }
                });
            }

            // Enviar para o servidor
            const response = await fetch(`/admin/api/lessons/package/${packageId}/reorder`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ lessonOrders })
            });

            if (response.ok) {
                this.showToast('Aulas reordenadas com sucesso!', 'success');
                await this.loadInitialData(); // Recarregar dados
            } else {
                throw new Error('Erro ao reordenar aulas');
            }
        } catch (error) {
            console.error('Erro ao reordenar aulas:', error);
            this.showToast('Erro ao reordenar aulas', 'error');
            await this.loadInitialData(); // Reverter mudanças
        }
    }

    /**
     * Abrir modal de criação/edição de aula
     */
    openLessonModal(lesson = null) {
        const modal = new bootstrap.Modal(document.getElementById('lessonModal'));
        const modalTitle = document.getElementById('lessonModalTitle');
        const form = document.getElementById('lessonForm');

        if (lesson) {
            // Modo edição
            modalTitle.innerHTML = '<i class="fas fa-edit me-2"></i>Editar Aula';
            this.currentLessonId = lesson.id;
            this.populateForm(lesson);
        } else {
            // Modo criação
            modalTitle.innerHTML = '<i class="fas fa-plus me-2"></i>Nova Aula';
            this.currentLessonId = null;
            form.reset();
            this.clearFormValidation();
        }

        modal.show();
    }

    /**
     * Preencher formulário com dados da aula
     */
    populateForm(lesson) {
        document.getElementById('lessonId').value = lesson.id;
        document.getElementById('lessonName').value = lesson.name;
        document.getElementById('lessonDescription').value = lesson.description || '';
        document.getElementById('lessonPackage').value = lesson.package_id;
        document.getElementById('lessonNumber').value = lesson.lesson_number;
        document.getElementById('orderSequence').value = lesson.order_sequence;
        document.getElementById('videoUrl').value = lesson.video_url || '';
        document.getElementById('durationMinutes').value = lesson.duration_minutes || '';
        document.getElementById('lessonContent').value = lesson.content || '';
    }

    /**
     * Salvar aula (criar ou editar)
     */
    async saveLesson() {
        const form = document.getElementById('lessonForm');
        const formData = new FormData(form);
        
        // Converter para objeto
        const lessonData = {
            name: formData.get('name'),
            description: formData.get('description'),
            package_id: parseInt(formData.get('package_id')),
            lesson_number: parseInt(formData.get('lesson_number')),
            order_sequence: formData.get('order_sequence') ? parseInt(formData.get('order_sequence')) : null,
            video_url: formData.get('video_url') || null,
            duration_minutes: formData.get('duration_minutes') ? parseInt(formData.get('duration_minutes')) : null,
            content: formData.get('content') || null
        };

        // Validar dados
        if (!this.validateLessonData(lessonData)) {
            return;
        }

        try {
            const url = this.currentLessonId 
                ? `/admin/api/lessons/${this.currentLessonId}`
                : '/admin/api/lessons';
            
            const method = this.currentLessonId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(lessonData)
            });

            const result = await response.json();

            if (response.ok) {
                const action = this.currentLessonId ? 'atualizada' : 'criada';
                this.showToast(`Aula ${action} com sucesso!`, 'success');
                
                // Fechar modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('lessonModal'));
                modal.hide();
                
                // Recarregar dados
                await this.loadInitialData();
            } else {
                this.handleFormErrors(result.errors || [result.message]);
            }
        } catch (error) {
            console.error('Erro ao salvar aula:', error);
            this.showToast('Erro ao salvar aula', 'error');
        }
    }

    /**
     * Validar dados da aula
     */
    validateLessonData(data) {
        this.clearFormValidation();
        let isValid = true;

        // Nome obrigatório
        if (!data.name || data.name.trim().length < 3) {
            this.setFieldError('lessonName', 'Nome deve ter pelo menos 3 caracteres');
            isValid = false;
        }

        // Descrição obrigatória
        if (!data.description || data.description.trim().length < 10) {
            this.setFieldError('lessonDescription', 'Descrição deve ter pelo menos 10 caracteres');
            isValid = false;
        }

        // Pacote obrigatório
        if (!data.package_id) {
            this.setFieldError('lessonPackage', 'Selecione um pacote');
            isValid = false;
        }

        // Número da aula obrigatório
        if (!data.lesson_number || data.lesson_number < 1) {
            this.setFieldError('lessonNumber', 'Número da aula deve ser maior que 0');
            isValid = false;
        }

        // Validar URL do vídeo se fornecida
        if (data.video_url && !this.isValidUrl(data.video_url)) {
            this.setFieldError('videoUrl', 'URL do vídeo inválida');
            isValid = false;
        }

        // Validar duração se fornecida
        if (data.duration_minutes && (data.duration_minutes < 1 || data.duration_minutes > 600)) {
            this.setFieldError('durationMinutes', 'Duração deve ser entre 1 e 600 minutos');
            isValid = false;
        }

        return isValid;
    }

    /**
     * Editar aula
     */
    async editLesson(lessonId) {
        try {
            const response = await fetch(`/admin/api/lessons/${lessonId}`);
            if (response.ok) {
                const result = await response.json();
                this.openLessonModal(result.lesson);
            } else {
                throw new Error('Aula não encontrada');
            }
        } catch (error) {
            console.error('Erro ao carregar aula:', error);
            this.showToast('Erro ao carregar dados da aula', 'error');
        }
    }

    /**
     * Confirmar exclusão de aula
     */
    confirmDeleteLesson(lessonId) {
        this.currentLessonId = lessonId;
        const modal = new bootstrap.Modal(document.getElementById('deleteLessonModal'));
        modal.show();
    }

    /**
     * Excluir aula
     */
    async deleteLesson() {
        if (!this.currentLessonId) return;

        try {
            const response = await fetch(`/admin/api/lessons/${this.currentLessonId}`, {
                method: 'DELETE'
            });

            const result = await response.json();

            if (response.ok) {
                this.showToast('Aula excluída com sucesso!', 'success');
                
                // Fechar modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('deleteLessonModal'));
                modal.hide();
                
                // Recarregar dados
                await this.loadInitialData();
            } else {
                // Mostrar avisos se não puder excluir
                if (response.status === 400) {
                    this.showDeleteWarnings([result.message]);
                } else {
                    throw new Error(result.message);
                }
            }
        } catch (error) {
            console.error('Erro ao excluir aula:', error);
            this.showToast('Erro ao excluir aula', 'error');
        }
    }

    /**
     * Mostrar avisos de exclusão
     */
    showDeleteWarnings(warnings) {
        const warningsDiv = document.getElementById('deleteWarnings');
        const warningsList = document.getElementById('deleteWarningsList');
        const confirmBtn = document.getElementById('confirmDeleteLessonBtn');
        
        if (warningsDiv && warningsList) {
            warningsList.innerHTML = warnings.map(warning => `<li>${warning}</li>`).join('');
            warningsDiv.style.display = 'block';
            confirmBtn.disabled = true;
        }
    }

    /**
     * Lidar com busca
     */
    handleSearch(query) {
        const searchTerm = query.toLowerCase().trim();
        
        if (!searchTerm) {
            this.filteredLessons = [...this.lessons];
        } else {
            this.filteredLessons = this.lessons.filter(lesson => 
                lesson.name.toLowerCase().includes(searchTerm) ||
                lesson.description?.toLowerCase().includes(searchTerm) ||
                lesson.package_name?.toLowerCase().includes(searchTerm)
            );
        }
        
        this.renderLessonsTable();
    }

    /**
     * Lidar com filtro por pacote
     */
    handlePackageFilter(packageId) {
        if (!packageId) {
            this.filteredLessons = [...this.lessons];
        } else {
            this.filteredLessons = this.lessons.filter(lesson => 
                lesson.package_id === parseInt(packageId)
            );
        }
        
        this.renderLessonsTable();
    }

    /**
     * Lidar com ordenação
     */
    handleSort(sortBy) {
        switch (sortBy) {
            case 'name':
                this.filteredLessons.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'completion_rate':
                this.filteredLessons.sort((a, b) => (b.completion_rate || 0) - (a.completion_rate || 0));
                break;
            case 'created_at':
                this.filteredLessons.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                break;
            case 'package_order':
            default:
                this.filteredLessons.sort((a, b) => {
                    if (a.package_name !== b.package_name) {
                        return a.package_name.localeCompare(b.package_name);
                    }
                    return a.order_sequence - b.order_sequence;
                });
                break;
        }
        
        this.renderLessonsTable();
    }

    /**
     * Resetar filtros
     */
    resetFilters() {
        document.getElementById('searchLessons').value = '';
        document.getElementById('filterPackage').value = '';
        document.getElementById('sortLessons').value = 'package_order';
        
        this.filteredLessons = [...this.lessons];
        this.handleSort('package_order');
    }

    /**
     * Atualizar sugestão de número da aula
     */
    async updateLessonNumberSuggestion(packageId) {
        if (!packageId) return;

        try {
            const response = await fetch(`/admin/api/lessons/package/${packageId}`);
            if (response.ok) {
                const result = await response.json();
                const lessons = result.lessons || [];
                const nextNumber = lessons.length + 1;
                
                document.getElementById('lessonNumber').placeholder = nextNumber.toString();
                document.getElementById('orderSequence').placeholder = nextNumber.toString();
            }
        } catch (error) {
            console.error('Erro ao buscar sugestão de número:', error);
        }
    }

    /**
     * Utilitários
     */
    showLoading(show) {
        const loadingState = document.getElementById('loadingState');
        const tableContainer = document.querySelector('.admin-table-container .table-responsive');
        
        if (loadingState && tableContainer) {
            if (show) {
                loadingState.style.display = 'block';
                tableContainer.style.display = 'none';
            } else {
                loadingState.style.display = 'none';
                tableContainer.style.display = 'block';
            }
        }
    }

    showToast(message, type = 'success') {
        const toast = document.getElementById('actionToast');
        const toastBody = toast.querySelector('.toast-body');
        const toastHeader = toast.querySelector('.toast-header');
        
        // Configurar ícone e cor baseado no tipo
        const icon = type === 'success' ? 'fas fa-check-circle text-success' : 'fas fa-exclamation-circle text-danger';
        const title = type === 'success' ? 'Sucesso' : 'Erro';
        
        toastHeader.innerHTML = `
            <i class="${icon} me-2"></i>
            <strong class="me-auto">${title}</strong>
            <button type="button" class="btn-close" data-bs-dismiss="toast"></button>
        `;
        
        toastBody.textContent = message;
        
        const bsToast = new bootstrap.Toast(toast);
        bsToast.show();
    }

    setFieldError(fieldId, message) {
        const field = document.getElementById(fieldId);
        const feedback = field.nextElementSibling;
        
        field.classList.add('is-invalid');
        if (feedback && feedback.classList.contains('invalid-feedback')) {
            feedback.textContent = message;
        }
    }

    clearFormValidation() {
        const form = document.getElementById('lessonForm');
        const invalidFields = form.querySelectorAll('.is-invalid');
        
        invalidFields.forEach(field => {
            field.classList.remove('is-invalid');
        });
    }

    handleFormErrors(errors) {
        if (Array.isArray(errors)) {
            errors.forEach(error => {
                if (error.param) {
                    this.setFieldError(this.getFieldIdByParam(error.param), error.msg);
                }
            });
        } else if (typeof errors === 'string') {
            this.showToast(errors, 'error');
        }
    }

    getFieldIdByParam(param) {
        const fieldMap = {
            'name': 'lessonName',
            'description': 'lessonDescription',
            'package_id': 'lessonPackage',
            'lesson_number': 'lessonNumber',
            'order_sequence': 'orderSequence',
            'video_url': 'videoUrl',
            'duration_minutes': 'durationMinutes'
        };
        
        return fieldMap[param] || param;
    }

    setupTooltips() {
        // Inicializar tooltips do Bootstrap se disponível
        if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
            const tooltipTriggerList = [].slice.call(document.querySelectorAll('[title]'));
            tooltipTriggerList.map(function (tooltipTriggerEl) {
                return new bootstrap.Tooltip(tooltipTriggerEl);
            });
        }
    }

    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        
        return text.replace(/[&<>"']/g, function(m) { return map[m]; });
    }

    truncateText(text, length) {
        if (text.length <= length) return text;
        return text.substring(0, length) + '...';
    }

    isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }
}

// ===== INICIALIZAÇÃO AUTOMÁTICA =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 [DOM] DOM carregado, iniciando AdminLessonsManager...');
    
    // Verificar se estamos na página correta
    if (document.getElementById('lessonsTableBody') || document.querySelector('.admin-lessons-page')) {
        console.log('📄 [DOM] Página de admin lessons detectada, criando instância...');
        window.adminLessonsManager = new AdminLessonsManager();
    } else {
        console.log('📄 [DOM] Não é a página de admin lessons, ignorando...');
    }
});

// ===== FALLBACK PARA GARANTIR INICIALIZAÇÃO =====
if (document.readyState === 'loading') {
    console.log('⏳ [SCRIPT] DOM ainda carregando, aguardando...');
} else {
    console.log('⚡ [SCRIPT] DOM já pronto, inicializando imediatamente...');
    
    // DOM já está pronto
    if (document.getElementById('lessonsTableBody') || document.querySelector('.admin-lessons-page')) {
        console.log('⚡ [SCRIPT] Página de admin lessons detectada, criando instância...');
        window.adminLessonsManager = new AdminLessonsManager();
    }
} 