/**
 * 🔧 Admin Lessons Manager - Sistema Simplificado de Gerenciamento de Aulas
 * Versão 4.0 - Diagnóstico e Correção
 */

// 🚨 LOGS DE DIAGNÓSTICO - Verificar se script carrega
console.log('🔍 [DEBUG] Script admin-lessons.js carregando...');

console.log('🚀 [ADMIN-LESSONS] Carregando AdminLessonsManager...');

class AdminLessonsManager {
    constructor() {
        console.log('🔧 [ADMIN-LESSONS] Construtor chamado');
        this.lessons = [];
        this.packages = [];
        this.filteredLessons = [];
        this.isInitialized = false;
        
        // Marcar instância global para evitar duplicatas
        window.adminLessonsManager = this;
        
        this.init();
    }

    async init() {
        console.log('🔄 [ADMIN-LESSONS] Inicializando...');
        
        if (this.isInitialized) {
            console.log('⚠️ [ADMIN-LESSONS] Já inicializado, pulando...');
            return;
        }

        try {
            await this.loadPackages();
            await this.loadLessons();
            this.setupEventListeners();
            this.applyFilters();
            this.isInitialized = true;
            console.log('✅ [ADMIN-LESSONS] Inicialização completa!');
        } catch (error) {
            console.error('❌ [ADMIN-LESSONS] Erro na inicialização:', error);
        }
    }

    async loadPackages() {
        try {
            console.log('📦 [ADMIN-LESSONS] Carregando pacotes...');
            const response = await fetch('/admin/api/packages');
            
            if (!response.ok) {
                throw new Error(`Erro ao carregar pacotes: ${response.status}`);
            }
            
            const data = await response.json();
            this.packages = data.packages || [];
            console.log(`📦 [ADMIN-LESSONS] ${this.packages.length} pacotes carregados`);
        } catch (error) {
            console.error('❌ [ADMIN-LESSONS] Erro ao carregar pacotes:', error);
            this.packages = [];
        }
    }

    async loadLessons() {
        try {
            console.log('📚 [ADMIN-LESSONS] Carregando aulas...');
            const response = await fetch('/admin/api/lessons');
            
            if (!response.ok) {
                throw new Error(`Erro ao carregar aulas: ${response.status}`);
            }
            
            const data = await response.json();
            this.lessons = data.lessons || [];
            this.filteredLessons = [...this.lessons];
            this.renderLessons();
            
            console.log(`📚 [ADMIN-LESSONS] ${this.lessons.length} aulas carregadas`);
        } catch (error) {
            console.error('❌ [ADMIN-LESSONS] Erro ao carregar aulas:', error);
            this.lessons = [];
            this.filteredLessons = [];
            this.showEmptyState();
        }
    }

    setupEventListeners() {
        console.log('🎯 [ADMIN-LESSONS] Configurando event listeners...');

        // Filtros
        const searchInput = document.getElementById('searchLessons');
        const packageFilter = document.getElementById('filterPackage');
        const sortSelect = document.getElementById('sortLessons');
        const resetBtn = document.getElementById('resetFilters');
        const clearFiltersBtn = document.getElementById('clearFiltersBtn');

        if (searchInput) {
            searchInput.addEventListener('input', () => this.applyFilters());
        }
        
        if (packageFilter) {
            packageFilter.addEventListener('change', () => this.applyFilters());
        }
        
        if (sortSelect) {
            sortSelect.addEventListener('change', () => this.applyFilters());
        }
        
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetFilters());
        }
        
        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', () => this.resetFilters());
        }

        // Event delegation para botões dinâmicos
        document.addEventListener('click', (e) => {
            // Botão Editar
            if (e.target.classList.contains('edit-lesson-btn') || e.target.closest('.edit-lesson-btn')) {
                e.preventDefault();
                const btn = e.target.closest('.edit-lesson-btn') || e.target;
                const lessonId = parseInt(btn.dataset.lessonId);
                const lessonName = btn.dataset.lessonName;
                
                console.log('✏️ [ADMIN-LESSONS] Clique em editar:', lessonId, lessonName);
                this.editLessonName(lessonId, lessonName);
            }
            
            // Botão Excluir
            if (e.target.classList.contains('delete-lesson-btn') || e.target.closest('.delete-lesson-btn')) {
                e.preventDefault();
                const btn = e.target.closest('.delete-lesson-btn') || e.target;
                const lessonId = parseInt(btn.dataset.lessonId);
                const lessonName = btn.dataset.lessonName;
                
                console.log('🗑️ [ADMIN-LESSONS] Clique em excluir:', lessonId, lessonName);
                this.deleteLesson(lessonId, lessonName);
            }
        });

        console.log('✅ [ADMIN-LESSONS] Event listeners configurados');
    }

    renderLessons() {
        console.log(`🎨 [ADMIN-LESSONS] Renderizando ${this.filteredLessons.length} aulas...`);
        
        const tableBody = document.getElementById('lessonsTableBody');
        const emptyState = document.getElementById('emptyState');
        
        if (!tableBody) {
            console.error('❌ [ADMIN-LESSONS] Elemento lessonsTableBody não encontrado');
            return;
        }

        if (this.filteredLessons.length === 0) {
            tableBody.innerHTML = '';
            if (emptyState) emptyState.style.display = 'block';
            return;
        }

        if (emptyState) emptyState.style.display = 'none';

        const html = this.filteredLessons.map(lesson => {
            const packageInfo = this.packages.find(p => p.id === lesson.package_id) || {
                name: 'Pacote não encontrado',
                icon: 'fas fa-box'
            };

            return `
                <tr data-lesson-id="${lesson.id}" data-package-id="${lesson.package_id}" class="lesson-row">
                    <td class="drag-handle">
                        <i class="fas fa-grip-vertical text-muted"></i>
                    </td>
                    <td>
                        <div class="lesson-info">
                            <div class="lesson-name">${lesson.name}</div>
                            <div class="lesson-description">
                                ${lesson.description || 'Sem descrição disponível'}
                            </div>
                        </div>
                    </td>
                    <td>
                        <div class="package-info">
                            <i class="${packageInfo.icon || 'fas fa-box'} text-primary"></i>
                            <span>${packageInfo.name}</span>
                        </div>
                    </td>
                    <td>
                        <span class="badge bg-secondary">
                            ${lesson.lesson_number}/${lesson.order_sequence}
                        </span>
                    </td>
                    <td>
                        <div class="completion-stats">
                            <div class="progress mb-2">
                                <div class="progress-bar" style="width: ${lesson.completion_rate || 0}%"></div>
                            </div>
                            <small class="text-muted">
                                ${lesson.completion_rate || 0}% (${lesson.completion_count || 0} usuários)
                            </small>
                        </div>
                    </td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn btn-sm btn-outline-primary edit-lesson-btn" 
                                    data-lesson-id="${lesson.id}" data-lesson-name="${lesson.name}" title="Editar Nome">
                                ✏️
                            </button>
                            <button class="btn btn-sm btn-outline-danger delete-lesson-btn" 
                                    data-lesson-id="${lesson.id}" data-lesson-name="${lesson.name}" title="Excluir">
                                🗑️
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');

        tableBody.innerHTML = html;
        console.log('✅ [ADMIN-LESSONS] Renderização completa');
    }

    applyFilters() {
        const searchTerm = document.getElementById('searchLessons')?.value.toLowerCase() || '';
        const packageFilter = document.getElementById('filterPackage')?.value || '';
        const sortBy = document.getElementById('sortLessons')?.value || 'package_order';

        this.filteredLessons = this.lessons.filter(lesson => {
            const matchesSearch = lesson.name.toLowerCase().includes(searchTerm);
            const matchesPackage = !packageFilter || lesson.package_id.toString() === packageFilter;
            return matchesSearch && matchesPackage;
        });

        // Ordenação
        this.filteredLessons.sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'completion_rate':
                    return (b.completion_rate || 0) - (a.completion_rate || 0);
                case 'created_at':
                    return new Date(b.created_at) - new Date(a.created_at);
                default: // package_order
                    if (a.package_id !== b.package_id) {
                        return a.package_id - b.package_id;
                    }
                    return (a.lesson_number || 0) - (b.lesson_number || 0);
            }
        });

        this.renderLessons();
    }

    resetFilters() {
        const searchInput = document.getElementById('searchLessons');
        const packageFilter = document.getElementById('filterPackage');
        const sortSelect = document.getElementById('sortLessons');
        
        if (searchInput) searchInput.value = '';
        if (packageFilter) packageFilter.value = '';
        if (sortSelect) sortSelect.value = 'package_order';
        
        this.applyFilters();
    }

    async editLessonName(lessonId, currentName) {
        console.log('✏️ [ADMIN-LESSONS] Iniciando edição da aula:', lessonId, currentName);
        
        const newName = prompt(`Editar nome da aula:\n\nNome atual: ${currentName}\n\nDigite o novo nome:`, currentName);
        console.log('📝 [ADMIN-LESSONS] Nome inserido pelo usuário:', newName);
        
        if (!newName || newName.trim() === '' || newName === currentName) {
            console.log('❌ [ADMIN-LESSONS] Edição cancelada ou nome não alterado');
            return;
        }

        // Validação simples no front-end
        if (newName.trim().length < 3) {
            this.showNotification('❌ Nome deve ter pelo menos 3 caracteres', 'error');
            return;
        }

        try {
            const updateData = {
                name: newName.trim()
            };
            
            console.log('📤 [ADMIN-LESSONS] Enviando dados:', updateData);
            
            const response = await fetch(`/admin/api/lessons/${lessonId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updateData)
            });

            console.log(`📥 [ADMIN-LESSONS] Status da resposta: ${response.status}`);
            
            const responseData = await response.json();
            console.log('📋 [ADMIN-LESSONS] Dados da resposta:', responseData);
            
            if (!response.ok) {
                throw new Error(responseData.message || `Erro HTTP: ${response.status}`);
            }

            // Atualizar dados locais
            const lessonIndex = this.lessons.findIndex(l => l.id === lessonId);
            if (lessonIndex !== -1) {
                this.lessons[lessonIndex].name = newName.trim();
                console.log('📝 [ADMIN-LESSONS] Dados locais atualizados');
            }

            this.applyFilters();
            this.showNotification(`✅ Nome da aula alterado para: "${newName.trim()}"`, 'success');
            
        } catch (error) {
            console.error('❌ [ADMIN-LESSONS] Erro ao editar aula:', error);
            this.showNotification(`❌ Erro ao editar aula: ${error.message}`, 'error');
        }
    }

    async deleteLesson(lessonId, lessonName) {
        console.log('🗑️ [ADMIN-LESSONS] Iniciando exclusão da aula:', lessonId, lessonName);
        
        const confirmDelete = confirm(`Tem certeza que deseja excluir a aula?\n\n"${lessonName}"\n\n⚠️ Esta ação não pode ser desfeita!`);
        
        if (!confirmDelete) {
            console.log('🚫 [ADMIN-LESSONS] Usuário cancelou a exclusão');
            return;
        }

        try {
            console.log(`🗑️ [ADMIN-LESSONS] Excluindo aula ${lessonId} - ${lessonName}...`);
            
            const response = await fetch(`/admin/api/lessons/${lessonId}`, {
                method: 'DELETE'
            });

            console.log(`📥 [ADMIN-LESSONS] Resposta da exclusão: ${response.status}`);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Erro HTTP: ${response.status}`);
            }

            const result = await response.json();
            console.log('✅ [ADMIN-LESSONS] Resultado da exclusão:', result);

            // Remover dos dados locais
            this.lessons = this.lessons.filter(l => l.id !== lessonId);
            this.applyFilters();
            this.showNotification(`🗑️ Aula "${lessonName}" excluída com sucesso`, 'success');
            
        } catch (error) {
            console.error('❌ [ADMIN-LESSONS] Erro ao excluir aula:', error);
            this.showNotification(`❌ Erro ao excluir aula: ${error.message}`, 'error');
        }
    }

    showNotification(message, type = 'success') {
        console.log(`📢 [ADMIN-LESSONS] Notificação: ${message} (${type})`);
        
        // Remover notificações existentes
        const existingNotifications = document.querySelectorAll('.admin-notification');
        existingNotifications.forEach(n => n.remove());
        
        // Criar notificação simples
        const notification = document.createElement('div');
        notification.className = `alert alert-${type === 'success' ? 'success' : 'danger'} alert-dismissible fade show position-fixed admin-notification`;
        notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px; max-width: 500px;';
        notification.innerHTML = `
            ${message}
            <button type="button" class="btn-close" onclick="this.parentElement.remove()"></button>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remover após 5 segundos
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    showEmptyState() {
        const tableBody = document.getElementById('lessonsTableBody');
        const emptyState = document.getElementById('emptyState');
        
        if (tableBody) tableBody.innerHTML = '';
        if (emptyState) emptyState.style.display = 'block';
    }
}

// Inicialização única e robusta
console.log('🔍 [ADMIN-LESSONS] Configurando inicialização...');

// Função para inicializar apenas uma vez
function initializeAdminLessons() {
    if (window.adminLessonsManager) {
        console.log('✅ [ADMIN-LESSONS] Instância já existe, não duplicando');
        return;
    }
    
    console.log('🚀 [ADMIN-LESSONS] Criando nova instância...');
    try {
        new AdminLessonsManager();
    } catch (error) {
        console.error('❌ [ADMIN-LESSONS] Erro na inicialização:', error);
    }
}

// Método 1: DOMContentLoaded (Padrão)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAdminLessons);
} else {
    // DOM já carregado
    initializeAdminLessons();
}

// Método 2: window.onload (Backup)
window.addEventListener('load', () => {
    console.log('🔄 [ADMIN-LESSONS] Window load completo, verificando inicialização...');
    if (!window.adminLessonsManager) {
        console.log('⚠️ [ADMIN-LESSONS] Backup: inicializando via window.load...');
        initializeAdminLessons();
    }
});

console.log('🔍 [ADMIN-LESSONS] Inicializadores configurados!'); 