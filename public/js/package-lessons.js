// JavaScript específico para página de aulas do pacote
console.log('[PACKAGE-LESSONS] Script carregado');
alert('JavaScript package-lessons.js CARREGADO! Se você vê este alerta, o JS está funcionando.');

document.addEventListener('DOMContentLoaded', function() {
    console.log('[PACKAGE-LESSONS] DOM carregado, inicializando event listeners');
    
    // Event listener para botões de editar aula
    document.addEventListener('click', function(e) {
        console.log('[PACKAGE-LESSONS] Click detectado em:', e.target);
        
        // Botão Editar Aula
        if (e.target.closest('.edit-lesson-btn')) {
            e.preventDefault();
            console.log('[PACKAGE-LESSONS] Botão editar clicado');
            
            const button = e.target.closest('.edit-lesson-btn');
            const lessonId = button.getAttribute('data-lesson-id');
            const currentName = button.getAttribute('data-lesson-name');
            
            console.log('[PACKAGE-LESSONS] Editando aula:', lessonId, currentName);
            
            // Criar input inline para edição
            const newName = prompt(`Editar nome da aula:\n\nNome atual: ${currentName}\n\nNovo nome:`, currentName);
            
            if (newName && newName.trim() !== '' && newName !== currentName) {
                console.log('[PACKAGE-LESSONS] Enviando requisição para atualizar:', newName);
                
                // Fazer requisição para atualizar
                fetch(`/admin/api/lessons/${lessonId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        name: newName.trim()
                    })
                })
                .then(response => {
                    console.log('[PACKAGE-LESSONS] Response recebida:', response.status);
                    return response.json();
                })
                .then(data => {
                    console.log('[PACKAGE-LESSONS] Dados recebidos:', data);
                    if (data.success) {
                        // Atualizar o nome no card imediatamente
                        const lessonCard = button.closest('.lesson-card');
                        const titleElement = lessonCard.querySelector('.lesson-title');
                        if (titleElement) {
                            titleElement.textContent = newName.trim();
                        }
                        // Atualizar o data-attribute do botão
                        button.setAttribute('data-lesson-name', newName.trim());
                        
                        // Mostrar feedback positivo
                        showFlashMessage('success', 'Nome da aula atualizado com sucesso!');
                    } else {
                        alert('Erro ao atualizar nome da aula: ' + (data.message || 'Erro desconhecido'));
                    }
                })
                .catch(error => {
                    console.error('[PACKAGE-LESSONS] Erro na requisição:', error);
                    alert('Erro ao atualizar nome da aula');
                });
            }
            return false;
        }
        
        // Botão Excluir Aula
        if (e.target.closest('.delete-lesson-btn')) {
            e.preventDefault();
            console.log('[PACKAGE-LESSONS] Botão excluir clicado');
            
            const button = e.target.closest('.delete-lesson-btn');
            const lessonId = button.getAttribute('data-lesson-id');
            const lessonName = button.getAttribute('data-lesson-name');
            
            console.log('[PACKAGE-LESSONS] Excluindo aula:', lessonId, lessonName);
            
            if (confirm(`Tem certeza que deseja excluir a aula:\n\n"${lessonName}"\n\nEsta ação não pode ser desfeita.`)) {
                const lessonCard = button.closest('.lesson-card');
                
                // Adicionar animação de saída
                lessonCard.style.opacity = '0.5';
                lessonCard.style.transform = 'scale(0.95)';
                lessonCard.style.transition = 'all 0.3s ease';
                
                console.log('[PACKAGE-LESSONS] Enviando requisição para excluir');
                
                // Fazer requisição para excluir
                fetch(`/admin/api/lessons/${lessonId}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
                .then(response => {
                    console.log('[PACKAGE-LESSONS] Response delete recebida:', response.status);
                    return response.json();
                })
                .then(data => {
                    console.log('[PACKAGE-LESSONS] Dados delete recebidos:', data);
                    if (data.success) {
                        // Remover o card com animação
                        lessonCard.style.opacity = '0';
                        lessonCard.style.transform = 'scale(0.8)';
                        lessonCard.style.height = '0';
                        lessonCard.style.margin = '0';
                        lessonCard.style.padding = '0';
                        
                        setTimeout(() => {
                            lessonCard.remove();
                            showFlashMessage('success', 'Aula excluída com sucesso!');
                        }, 300);
                    } else {
                        // Reverter animação em caso de erro
                        lessonCard.style.opacity = '1';
                        lessonCard.style.transform = 'scale(1)';
                        alert('Erro ao excluir aula: ' + (data.message || 'Erro desconhecido'));
                    }
                })
                .catch(error => {
                    console.error('[PACKAGE-LESSONS] Erro na requisição de delete:', error);
                    // Reverter animação em caso de erro
                    lessonCard.style.opacity = '1';
                    lessonCard.style.transform = 'scale(1)';
                    alert('Erro ao excluir aula');
                });
            }
            return false;
        }
    });
    
    // Verificar se existem botões de admin na página
    const editButtons = document.querySelectorAll('.edit-lesson-btn');
    const deleteButtons = document.querySelectorAll('.delete-lesson-btn');
    
    console.log('[PACKAGE-LESSONS] Botões encontrados:', {
        edit: editButtons.length,
        delete: deleteButtons.length
    });
    
    if (editButtons.length === 0 && deleteButtons.length === 0) {
        console.log('[PACKAGE-LESSONS] Nenhum botão de admin encontrado - usuário não é admin ou botões não foram renderizados');
        alert('NENHUM BOTÃO DE ADMIN ENCONTRADO! Verifique se você está logado como admin.');
    } else {
        alert(`BOTÕES ENCONTRADOS! Edit: ${editButtons.length}, Delete: ${deleteButtons.length}`);
    }
});

// Função auxiliar para mostrar mensagens flash
function showFlashMessage(type, message) {
    console.log('[PACKAGE-LESSONS] Mostrando flash message:', type, message);
    
    // Remover mensagens existentes
    const existingFlash = document.querySelector('.flash-message');
    if (existingFlash) {
        existingFlash.remove();
    }
    
    // Criar nova mensagem
    const flashDiv = document.createElement('div');
    flashDiv.className = `flash-message flash-${type}`;
    flashDiv.setAttribute('role', 'alert');
    flashDiv.innerHTML = `
        <i class="flash-icon fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}" aria-hidden="true"></i>
        <span class="flash-text">${message}</span>
        <button class="flash-close" aria-label="Fechar mensagem">
            <i class="fas fa-times" aria-hidden="true"></i>
        </button>
    `;
    
    // Adicionar ao final do body
    document.body.appendChild(flashDiv);
    
    // Auto-remover após 3 segundos
    setTimeout(() => {
        if (flashDiv.parentNode) {
            flashDiv.remove();
        }
    }, 3000);
    
    // Event listener para fechar manualmente
    flashDiv.querySelector('.flash-close').addEventListener('click', () => {
        flashDiv.remove();
    });
} 