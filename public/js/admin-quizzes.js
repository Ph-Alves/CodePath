/**
 * Administração de Quizzes - CodePath
 * Gerenciamento completo de quizzes administrativos
 */

class AdminQuizzesManager {
    constructor() {
        this.currentQuizId = null;
        this.quizzes = [];
        this.lessons = [];
        this.filteredQuizzes = [];
        this.currentFilters = {
            search: '',
            lesson: '',
            sort: 'lesson_order'
        };
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadQuizzes();
    }

    bindEvents() {
        // Botão adicionar quiz
        document.getElementById('addQuizBtn')?.addEventListener('click', () => {
            this.showQuizModal();
        });

        // Salvar quiz
        document.getElementById('saveQuizBtn')?.addEventListener('click', () => {
            this.saveQuiz();
        });

        // Confirmar exclusão
        document.getElementById('confirmDeleteQuizBtn')?.addEventListener('click', () => {
            this.confirmDeleteQuiz();
        });

        // Filtros
        document.getElementById('searchQuizzes')?.addEventListener('input', (e) => {
            this.currentFilters.search = e.target.value;
            this.applyFilters();
        });

        document.getElementById('filterLesson')?.addEventListener('change', (e) => {
            this.currentFilters.lesson = e.target.value;
            this.applyFilters();
        });

        document.getElementById('sortQuizzes')?.addEventListener('change', (e) => {
            this.currentFilters.sort = e.target.value;
            this.applyFilters();
        });

        // Resetar filtros
        document.getElementById('resetFilters')?.addEventListener('click', () => {
            this.resetFilters();
        });

        // Validação em tempo real
        this.setupFormValidation();
    }

    setupFormValidation() {
        const form = document.getElementById('quizForm');
        if (!form) return;

        const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearFieldError(input));
        });
    }

    validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        let message = '';

        // Validação básica de campos obrigatórios
        if (field.hasAttribute('required') && !value) {
            isValid = false;
            message = 'Este campo é obrigatório.';
        }

        // Validações específicas
        switch (field.id) {
            case 'quizTitle':
                if (value && value.length < 3) {
                    isValid = false;
                    message = 'O título deve ter pelo menos 3 caracteres.';
                } else if (value && value.length > 200) {
                    isValid = false;
                    message = 'O título deve ter no máximo 200 caracteres.';
                }
                break;

            case 'quizTimeLimit':
                if (value && (parseInt(value) < 1 || parseInt(value) > 180)) {
                    isValid = false;
                    message = 'O tempo limite deve estar entre 1 e 180 minutos.';
                }
                break;

            case 'quizMaxAttempts':
                if (value && (parseInt(value) < 1 || parseInt(value) > 10)) {
                    isValid = false;
                    message = 'As tentativas máximas devem estar entre 1 e 10.';
                }
                break;

            case 'quizPassingScore':
                if (value && (parseInt(value) < 0 || parseInt(value) > 100)) {
                    isValid = false;
                    message = 'A pontuação deve estar entre 0 e 100.';
                }
                break;

            case 'quizXpReward':
                if (value && (parseInt(value) < 0 || parseInt(value) > 1000)) {
                    isValid = false;
                    message = 'A recompensa XP deve estar entre 0 e 1000.';
                }
                break;
        }

        this.setFieldValidation(field, isValid, message);
        return isValid;
    }

    setFieldValidation(field, isValid, message) {
        const feedback = field.parentNode.querySelector('.invalid-feedback');
        
        if (isValid) {
            field.classList.remove('is-invalid');
            field.classList.add('is-valid');
            if (feedback) feedback.textContent = '';
        } else {
            field.classList.remove('is-valid');
            field.classList.add('is-invalid');
            if (feedback) feedback.textContent = message;
        }
    }

    clearFieldError(field) {
        field.classList.remove('is-invalid', 'is-valid');
        const feedback = field.parentNode.querySelector('.invalid-feedback');
        if (feedback) feedback.textContent = '';
    }

    async loadQuizzes() {
        try {
            this.showLoading(true);
            
            const response = await fetch('/admin/api/quizzes');
            const data = await response.json();
            
            if (data.success) {
                this.quizzes = data.quizzes || [];
                this.lessons = data.lessons || [];
                this.filteredQuizzes = [...this.quizzes];
                this.renderQuizzes();
                this.updateStats(data.stats);
            } else {
                throw new Error(data.message || 'Erro ao carregar quizzes');
            }
        } catch (error) {
            console.error('Erro ao carregar quizzes:', error);
            this.showNotification('Erro ao carregar quizzes: ' + error.message, 'error');
        } finally {
            this.showLoading(false);
        }
    }

    renderQuizzes() {
        const tbody = document.getElementById('quizzesTableBody');
        if (!tbody) return;

        if (this.filteredQuizzes.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center py-5">
                        <div class="empty-state">
                            <i class="fas fa-question-circle fa-3x text-muted mb-3"></i>
                            <h5 class="text-muted">Nenhum quiz encontrado</h5>
                            <p class="text-muted">
                                ${this.currentFilters.search || this.currentFilters.lesson ? 
                                    'Tente ajustar os filtros para encontrar quizzes.' : 
                                    'Comece criando seu primeiro quiz.'}
                            </p>
                            ${!this.currentFilters.search && !this.currentFilters.lesson ? `
                                <button class="btn btn-primary" onclick="adminQuizzes.showQuizModal()">
                                    <i class="fas fa-plus me-2"></i>Criar Primeiro Quiz
                                </button>
                            ` : ''}
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.filteredQuizzes.map(quiz => this.renderQuizRow(quiz)).join('');
    }

    renderQuizRow(quiz) {
        const difficultyBadge = quiz.difficulty_level ? 
            `<span class="badge ${this.getDifficultyBadgeClass(quiz.difficulty_level)}">${quiz.difficulty_level}</span>` :
            '<span class="text-muted">-</span>';

        const timeLimitBadge = quiz.time_limit_minutes ? 
            `<span class="badge bg-secondary"><i class="fas fa-clock me-1"></i>${quiz.time_limit_minutes} min</span>` : '';

        const scoreDisplay = quiz.avg_score ? `
            <div class="progress mb-1" style="height: 8px;">
                <div class="progress-bar bg-primary" style="width: ${quiz.avg_score}%"></div>
            </div>
            <small class="text-muted">${quiz.avg_score}%</small>
        ` : '<span class="text-muted">Sem dados</span>';

        const description = quiz.description ? 
            (quiz.description.length > 80 ? quiz.description.substring(0, 80) + '...' : quiz.description) : '';

        return `
            <tr data-quiz-id="${quiz.id}" data-lesson-id="${quiz.lesson_id}" class="quiz-row">
                <td>
                    <div class="quiz-info">
                        <h6 class="quiz-title mb-1">${quiz.title}</h6>
                        ${description ? `<small class="quiz-description text-muted">${description}</small>` : ''}
                        ${timeLimitBadge ? `<div class="mt-1">${timeLimitBadge}</div>` : ''}
                    </div>
                </td>
                <td>
                    <div class="lesson-info">
                        <div class="d-flex align-items-center">
                            <i class="${quiz.package_icon || 'fas fa-book'} me-2 text-primary"></i>
                            <div>
                                <span class="fw-medium">${quiz.lesson_name}</span>
                                <br>
                                <small class="text-muted">${quiz.package_name}</small>
                            </div>
                        </div>
                    </div>
                </td>
                <td>${difficultyBadge}</td>
                <td>
                    <span class="badge bg-info">${quiz.question_count || 0} questões</span>
                </td>
                <td>
                    <div class="score-stats">${scoreDisplay}</div>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-outline-primary me-1" 
                                onclick="adminQuizzes.editQuiz(${quiz.id})" 
                                title="Editar Quiz">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-info me-1" 
                                onclick="adminQuizzes.manageQuestions(${quiz.id})" 
                                title="Gerenciar Questões">
                            <i class="fas fa-list-ul"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" 
                                onclick="adminQuizzes.deleteQuiz(${quiz.id})" 
                                title="Excluir Quiz">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }

    getDifficultyBadgeClass(difficulty) {
        switch (difficulty) {
            case 'Fácil': return 'bg-success';
            case 'Médio': return 'bg-warning';
            case 'Difícil': return 'bg-danger';
            default: return 'bg-secondary';
        }
    }

    updateStats(stats) {
        if (!stats) return;

        const elements = {
            'stats.total_quizzes': stats.total_quizzes || 0,
            'stats.lessons_with_quizzes': stats.lessons_with_quizzes || 0,
            'stats.total_questions': stats.total_questions || 0,
            'stats.users_who_answered': stats.users_who_answered || 0
        };

        Object.entries(elements).forEach(([selector, value]) => {
            const element = document.querySelector(`[data-stat="${selector}"]`);
            if (element) {
                this.animateNumber(element, parseInt(value));
            }
        });
    }

    animateNumber(element, targetValue) {
        const startValue = parseInt(element.textContent) || 0;
        const duration = 1000;
        const startTime = performance.now();

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const currentValue = Math.round(startValue + (targetValue - startValue) * progress);
            element.textContent = currentValue;

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }

    applyFilters() {
        let filtered = [...this.quizzes];

        // Filtro de busca
        if (this.currentFilters.search) {
            const search = this.currentFilters.search.toLowerCase();
            filtered = filtered.filter(quiz => 
                quiz.title.toLowerCase().includes(search) ||
                quiz.description?.toLowerCase().includes(search) ||
                quiz.lesson_name.toLowerCase().includes(search) ||
                quiz.package_name.toLowerCase().includes(search)
            );
        }

        // Filtro por aula
        if (this.currentFilters.lesson) {
            filtered = filtered.filter(quiz => 
                quiz.lesson_id.toString() === this.currentFilters.lesson
            );
        }

        // Ordenação
        filtered.sort((a, b) => {
            switch (this.currentFilters.sort) {
                case 'title':
                    return a.title.localeCompare(b.title);
                case 'difficulty':
                    const difficultyOrder = {'Fácil': 1, 'Médio': 2, 'Difícil': 3};
                    return (difficultyOrder[a.difficulty_level] || 0) - (difficultyOrder[b.difficulty_level] || 0);
                case 'avg_score':
                    return (b.avg_score || 0) - (a.avg_score || 0);
                case 'created_at':
                    return new Date(b.created_at) - new Date(a.created_at);
                case 'lesson_order':
                default:
                    return (a.lesson_order || 0) - (b.lesson_order || 0);
            }
        });

        this.filteredQuizzes = filtered;
        this.renderQuizzes();
    }

    resetFilters() {
        this.currentFilters = {
            search: '',
            lesson: '',
            sort: 'lesson_order'
        };

        // Reset dos campos
        document.getElementById('searchQuizzes').value = '';
        document.getElementById('filterLesson').value = '';
        document.getElementById('sortQuizzes').value = 'lesson_order';

        this.applyFilters();
    }

    showQuizModal(quizId = null) {
        this.currentQuizId = quizId;
        const modal = new bootstrap.Modal(document.getElementById('quizModal'));
        const title = document.getElementById('quizModalTitle');
        const form = document.getElementById('quizForm');

        if (quizId) {
            title.innerHTML = '<i class="fas fa-edit me-2"></i>Editar Quiz';
            this.loadQuizData(quizId);
        } else {
            title.innerHTML = '<i class="fas fa-plus me-2"></i>Novo Quiz';
            form.reset();
            this.clearFormValidation();
        }

        modal.show();
    }

    loadQuizData(quizId) {
        const quiz = this.quizzes.find(q => q.id === quizId);
        if (!quiz) return;

        // Preencher campos do formulário
        document.getElementById('quizId').value = quiz.id;
        document.getElementById('quizTitle').value = quiz.title;
        document.getElementById('quizLesson').value = quiz.lesson_id;
        document.getElementById('quizDescription').value = quiz.description || '';
        document.getElementById('quizDifficulty').value = quiz.difficulty_level || '';
        document.getElementById('quizTimeLimit').value = quiz.time_limit_minutes || '';
        document.getElementById('quizMaxAttempts').value = quiz.max_attempts || '';
        document.getElementById('quizPassingScore').value = quiz.passing_score_percentage || 70;
        document.getElementById('quizXpReward').value = quiz.xp_reward || 100;
        document.getElementById('quizIsActive').checked = quiz.is_active;

        this.clearFormValidation();
    }

    clearFormValidation() {
        const form = document.getElementById('quizForm');
        const inputs = form.querySelectorAll('.is-invalid, .is-valid');
        inputs.forEach(input => {
            input.classList.remove('is-invalid', 'is-valid');
        });

        const feedbacks = form.querySelectorAll('.invalid-feedback');
        feedbacks.forEach(feedback => {
            feedback.textContent = '';
        });
    }

    async saveQuiz() {
        const form = document.getElementById('quizForm');
        const formData = new FormData(form);
        
        // Validar formulário
        if (!this.validateForm()) {
            this.showNotification('Por favor, corrija os erros no formulário.', 'error');
            return;
        }

        const saveBtn = document.getElementById('saveQuizBtn');
        const originalText = saveBtn.innerHTML;
        
        try {
            saveBtn.disabled = true;
            saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Salvando...';

            const quizData = {
                title: formData.get('title'),
                lesson_id: parseInt(formData.get('lesson_id')),
                description: formData.get('description') || null,
                difficulty_level: formData.get('difficulty_level') || null,
                time_limit_minutes: formData.get('time_limit_minutes') ? parseInt(formData.get('time_limit_minutes')) : null,
                max_attempts: formData.get('max_attempts') ? parseInt(formData.get('max_attempts')) : null,
                passing_score_percentage: parseInt(formData.get('passing_score_percentage')),
                xp_reward: parseInt(formData.get('xp_reward')),
                is_active: formData.get('is_active') === 'on'
            };

            const url = this.currentQuizId ? 
                `/admin/api/quizzes/${this.currentQuizId}` : 
                '/admin/api/quizzes';
            
            const method = this.currentQuizId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(quizData)
            });

            const result = await response.json();

            if (result.success) {
                this.showNotification(
                    this.currentQuizId ? 'Quiz atualizado com sucesso!' : 'Quiz criado com sucesso!', 
                    'success'
                );
                
                bootstrap.Modal.getInstance(document.getElementById('quizModal')).hide();
                await this.loadQuizzes();
            } else {
                throw new Error(result.message || 'Erro ao salvar quiz');
            }
        } catch (error) {
            console.error('Erro ao salvar quiz:', error);
            this.showNotification('Erro ao salvar quiz: ' + error.message, 'error');
        } finally {
            saveBtn.disabled = false;
            saveBtn.innerHTML = originalText;
        }
    }

    validateForm() {
        const form = document.getElementById('quizForm');
        const requiredFields = form.querySelectorAll('[required]');
        let isValid = true;

        requiredFields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });

        return isValid;
    }

    editQuiz(quizId) {
        this.showQuizModal(quizId);
    }

    deleteQuiz(quizId) {
        const quiz = this.quizzes.find(q => q.id === quizId);
        if (!quiz) return;

        this.currentQuizId = quizId;

        // Preencher informações do quiz no modal
        document.getElementById('quizToDeleteInfo').innerHTML = `
            <div class="d-flex align-items-center p-3 bg-light rounded">
                <i class="fas fa-question-circle fa-2x text-primary me-3"></i>
                <div>
                    <h6 class="mb-1">${quiz.title}</h6>
                    <small class="text-muted">${quiz.lesson_name} - ${quiz.package_name}</small>
                    <div class="mt-1">
                        <span class="badge bg-info">${quiz.question_count || 0} questões</span>
                        ${quiz.difficulty_level ? `<span class="badge ${this.getDifficultyBadgeClass(quiz.difficulty_level)} ms-1">${quiz.difficulty_level}</span>` : ''}
                    </div>
                </div>
            </div>
        `;

        const modal = new bootstrap.Modal(document.getElementById('deleteQuizModal'));
        modal.show();
    }

    async confirmDeleteQuiz() {
        if (!this.currentQuizId) return;

        const confirmBtn = document.getElementById('confirmDeleteQuizBtn');
        const originalText = confirmBtn.innerHTML;

        try {
            confirmBtn.disabled = true;
            confirmBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Excluindo...';

            const response = await fetch(`/admin/api/quizzes/${this.currentQuizId}`, {
                method: 'DELETE'
            });

            const result = await response.json();

            if (result.success) {
                this.showNotification('Quiz excluído com sucesso!', 'success');
                bootstrap.Modal.getInstance(document.getElementById('deleteQuizModal')).hide();
                await this.loadQuizzes();
            } else {
                throw new Error(result.message || 'Erro ao excluir quiz');
            }
        } catch (error) {
            console.error('Erro ao excluir quiz:', error);
            this.showNotification('Erro ao excluir quiz: ' + error.message, 'error');
        } finally {
            confirmBtn.disabled = false;
            confirmBtn.innerHTML = originalText;
            this.currentQuizId = null;
        }
    }

    manageQuestions(quizId) {
        // Redirecionar para página de gerenciamento de questões
        window.location.href = `/admin/quizzes/${quizId}/questions`;
    }

    showLoading(show) {
        const loadingState = document.getElementById('loadingState');
        const tableContainer = document.querySelector('.admin-table-container');
        
        if (loadingState && tableContainer) {
            loadingState.style.display = show ? 'block' : 'none';
            tableContainer.style.display = show ? 'none' : 'block';
        }
    }

    showNotification(message, type = 'info') {
        // Criar notificação toast
        const toast = document.createElement('div');
        toast.className = `toast align-items-center text-white bg-${type === 'error' ? 'danger' : type === 'success' ? 'success' : 'primary'} border-0`;
        toast.setAttribute('role', 'alert');
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    <i class="fas fa-${type === 'error' ? 'exclamation-circle' : type === 'success' ? 'check-circle' : 'info-circle'} me-2"></i>
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        `;

        // Adicionar ao container de toasts
        let toastContainer = document.querySelector('.toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
            document.body.appendChild(toastContainer);
        }

        toastContainer.appendChild(toast);

        // Mostrar toast
        const bsToast = new bootstrap.Toast(toast, {
            autohide: true,
            delay: type === 'error' ? 5000 : 3000
        });
        bsToast.show();

        // Remover elemento após ocultar
        toast.addEventListener('hidden.bs.toast', () => {
            toast.remove();
        });
    }
}

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    window.adminQuizzes = new AdminQuizzesManager();
});

// Funções globais para compatibilidade com onclick nos templates
function editQuiz(quizId) {
    if (window.adminQuizzes) {
        window.adminQuizzes.editQuiz(quizId);
    }
}

function deleteQuiz(quizId) {
    if (window.adminQuizzes) {
        window.adminQuizzes.deleteQuiz(quizId);
    }
}

function manageQuestions(quizId) {
    if (window.adminQuizzes) {
        window.adminQuizzes.manageQuestions(quizId);
    }
} 