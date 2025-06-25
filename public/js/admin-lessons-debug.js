console.log('🚀 [DEBUG] admin-lessons-debug.js carregado em:', new Date().toISOString());

// Verificar se há instâncias antigas
if (window.adminLessonsManager) {
    console.log('⚠️ [DEBUG] Instância antiga encontrada, removendo...');
    delete window.adminLessonsManager;
}

// Verificar se há event listeners duplicados
const existingListeners = document.querySelectorAll('[data-admin-listener]');
if (existingListeners.length > 0) {
    console.log('⚠️ [DEBUG] Event listeners antigos encontrados:', existingListeners.length);
    existingListeners.forEach(el => el.removeAttribute('data-admin-listener'));
}

// Limpar qualquer modal ou toast antigo
const oldModals = document.querySelectorAll('.modal, .toast, .admin-notification');
oldModals.forEach(el => {
    console.log('🧹 [DEBUG] Removendo elemento antigo:', el.className);
    el.remove();
});

// Verificar se Bootstrap está carregado
if (typeof bootstrap !== 'undefined') {
    console.log('⚠️ [DEBUG] Bootstrap detectado, versão:', bootstrap.Tooltip.VERSION);
    console.log('🚫 [DEBUG] IMPORTANTE: NÃO vamos usar Bootstrap Modal!');
}

class AdminLessonsManagerDebug {
    constructor() {
        console.log('🔧 [DEBUG] Construtor chamado');
        this.lessons = [];
        this.packages = [];
        this.filteredLessons = [];
        this.isInitialized = false;
        
        // Marcar instância global
        window.adminLessonsManager = this;
        
        this.init();
    }

    async init() {
        console.log('🔄 [DEBUG] Inicializando...');
        
        if (this.isInitialized) {
            console.log('⚠️ [DEBUG] Já inicializado, pulando...');
            return;
        }

        try {
            await this.loadPackages();
            await this.loadLessons();
            this.setupEventListeners();
            this.applyFilters();
            
            this.isInitialized = true;
            console.log('✅ [DEBUG] Inicialização completa!');
        } catch (error) {
            console.error('❌ [DEBUG] Erro na inicialização:', error);
        }
    }

    async loadPackages() {
        console.log('📦 [DEBUG] Carregando pacotes...');
        try {
            const response = await fetch('/admin/api/packages');
            const data = await response.json();
            this.packages = data.packages || [];
            console.log(`✅ [DEBUG] ${this.packages.length} pacotes carregados`);
        } catch (error) {
            console.error('❌ [DEBUG] Erro ao carregar pacotes:', error);
        }
    }

    async loadLessons() {
        console.log('📚 [DEBUG] Carregando aulas...');
        try {
            const response = await fetch('/admin/api/lessons');
            const data = await response.json();
            this.lessons = data.lessons || [];
            console.log(`✅ [DEBUG] ${this.lessons.length} aulas carregadas`);
        } catch (error) {
            console.error('❌ [DEBUG] Erro ao carregar aulas:', error);
        }
    }

    setupEventListeners() {
        console.log('🎯 [DEBUG] Configurando event listeners...');

        // Event delegation para botões dinâmicos
        document.addEventListener('click', (e) => {
            console.log('🖱️ [DEBUG] Clique detectado em:', e.target);
            
            // Botão Editar
            if (e.target.classList.contains('edit-lesson-btn') || e.target.closest('.edit-lesson-btn')) {
                e.preventDefault();
                console.log('✏️ [DEBUG] Clique em botão EDITAR detectado!');
                
                const btn = e.target.closest('.edit-lesson-btn') || e.target;
                const lessonId = parseInt(btn.dataset.lessonId);
                const lessonName = btn.dataset.lessonName;
                
                console.log('📝 [DEBUG] Dados do botão:', { lessonId, lessonName });
                this.editLessonNameDebug(lessonId, lessonName);
                return;
            }
            
            // Botão Excluir
            if (e.target.classList.contains('delete-lesson-btn') || e.target.closest('.delete-lesson-btn')) {
                e.preventDefault();
                console.log('🗑️ [DEBUG] Clique em botão EXCLUIR detectado!');
                
                const btn = e.target.closest('.delete-lesson-btn') || e.target;
                const lessonId = parseInt(btn.dataset.lessonId);
                const lessonName = btn.dataset.lessonName;
                
                console.log('📝 [DEBUG] Dados do botão:', { lessonId, lessonName });
                this.deleteLessonDebug(lessonId, lessonName);
                return;
            }
        });

        console.log('✅ [DEBUG] Event listeners configurados');
    }

    async editLessonNameDebug(lessonId, currentName) {
        console.log('✏️ [DEBUG] MÉTODO EDITAR CHAMADO:', lessonId, currentName);
        
        const newName = prompt(`[DEBUG] Editar nome da aula:\n\nNome atual: ${currentName}\n\nDigite o novo nome:`, currentName);
        console.log('📝 [DEBUG] Nome inserido:', newName);
        
        if (!newName || newName.trim() === '' || newName === currentName) {
            console.log('❌ [DEBUG] Edição cancelada');
            alert('[DEBUG] Edição cancelada ou nome não alterado');
            return;
        }

        try {
            const updateData = { name: newName.trim() };
            console.log('📤 [DEBUG] Enviando dados:', updateData);
            
            const response = await fetch(`/admin/api/lessons/${lessonId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateData)
            });

            const responseData = await response.json();
            console.log('📥 [DEBUG] Resposta:', responseData);
            
            if (response.ok) {
                alert(`[DEBUG] ✅ Sucesso: ${responseData.message}`);
                location.reload(); // Recarregar para ver mudanças
            } else {
                alert(`[DEBUG] ❌ Erro: ${responseData.message}`);
            }
            
        } catch (error) {
            console.error('❌ [DEBUG] Erro:', error);
            alert(`[DEBUG] ❌ Erro: ${error.message}`);
        }
    }

    async deleteLessonDebug(lessonId, lessonName) {
        console.log('🗑️ [DEBUG] MÉTODO EXCLUIR CHAMADO:', lessonId, lessonName);
        
        const confirmDelete = confirm(`[DEBUG] Tem certeza que deseja excluir?\n\n"${lessonName}"\n\n⚠️ Esta ação não pode ser desfeita!`);
        
        if (!confirmDelete) {
            console.log('🚫 [DEBUG] Usuário cancelou a exclusão');
            return;
        }

        try {
            console.log(`🗑️ [DEBUG] Excluindo aula ${lessonId}...`);
            
            const response = await fetch(`/admin/api/lessons/${lessonId}`, {
                method: 'DELETE'
            });

            const result = await response.json();
            console.log('✅ [DEBUG] Resultado:', result);

            if (response.ok) {
                alert(`[DEBUG] ✅ Sucesso: ${result.message}`);
                location.reload(); // Recarregar para ver mudanças
            } else {
                alert(`[DEBUG] ❌ Erro: ${result.message}`);
            }
            
        } catch (error) {
            console.error('❌ [DEBUG] Erro:', error);
            alert(`[DEBUG] ❌ Erro: ${error.message}`);
        }
    }

    applyFilters() {
        console.log('🔍 [DEBUG] Aplicando filtros...');
        this.filteredLessons = this.lessons;
        // Não vamos renderizar novamente para evitar conflitos
    }
}

// Inicialização de debug
console.log('🔍 [DEBUG] Configurando inicialização...');

function initializeAdminLessonsDebug() {
    if (window.adminLessonsManager) {
        console.log('✅ [DEBUG] Instância já existe, não duplicando');
        return;
    }
    
    console.log('🚀 [DEBUG] Criando nova instância...');
    try {
        new AdminLessonsManagerDebug();
    } catch (error) {
        console.error('❌ [DEBUG] Erro na inicialização:', error);
    }
}

// Inicializar imediatamente
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAdminLessonsDebug);
} else {
    initializeAdminLessonsDebug();
}

console.log('🔍 [DEBUG] Arquivo de debug carregado completamente!'); 