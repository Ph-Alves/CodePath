/**
 * JavaScript do Sistema de Chat - CodePath
 * Funcionalidades de chat, salas e grupos de estudo
 * 
 * Funcionalidades:
 * - Criação de salas e grupos
 * - Filtros por tecnologia
 * - Navegação entre salas
 * - Modais interativos
 */

// ===== VARIÁVEIS GLOBAIS =====
let currentTechnology = '';
let isLoading = false;

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Sistema de Chat iniciado');
    
    // Configurar eventos
    setupEventListeners();
    
    // Carregar dados iniciais
    loadInitialData();
});

// ===== CONFIGURAÇÃO DE EVENTOS =====
function setupEventListeners() {
    // Fechar modais ao clicar fora
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            closeModal(e.target.id);
        }
    });
    
    // Tecla ESC para fechar modais
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeAllModals();
        }
    });
    
    // Monitorar mudanças nos inputs dos formulários
    setupFormValidation();
}

// ===== CARREGAMENTO DE DADOS =====
function loadInitialData() {
    console.log('📊 Carregando dados iniciais do chat');
    
    // Dados já carregados pelo servidor
    console.log('✅ Dados carregados via template');
}

// ===== FILTROS DE TECNOLOGIA =====
function filterByTechnology(technology) {
    console.log(`🔍 Filtrando por tecnologia: ${technology || 'Todas'}`);
    
    currentTechnology = technology;
    
    // Atualizar botões ativos
    updateFilterButtons(technology);
    
    // Filtrar cards de salas
    filterRoomCards(technology);
    
    // Buscar salas via API (opcional para atualização dinâmica)
    if (technology) {
        fetchRoomsByTechnology(technology);
    }
}

function updateFilterButtons(activeTechnology) {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(btn => {
        btn.classList.remove('active');
        
        const btnText = btn.textContent.trim();
        if (
            (activeTechnology === '' && btnText === 'Todas') ||
            btnText === activeTechnology
        ) {
            btn.classList.add('active');
        }
    });
}

function filterRoomCards(technology) {
    const roomCards = document.querySelectorAll('.room-card');
    
    roomCards.forEach(card => {
        const cardTechnology = card.dataset.technology;
        
        if (!technology || cardTechnology === technology) {
            card.style.display = 'block';
            card.style.animation = 'fadeIn 0.3s ease';
        } else {
            card.style.display = 'none';
        }
    });
    
    // Verificar se há cards visíveis
    const visibleCards = document.querySelectorAll('.room-card[style*="display: block"], .room-card:not([style*="display: none"])');
    const emptyState = document.querySelector('.public-rooms-grid .empty-state');
    
    if (visibleCards.length === 0 && !emptyState) {
        showEmptyState();
    } else if (visibleCards.length > 0 && emptyState) {
        hideEmptyState();
    }
}

function showEmptyState() {
    const grid = document.getElementById('publicRoomsGrid');
    const emptyState = document.createElement('div');
    emptyState.className = 'empty-state';
    emptyState.innerHTML = `
        <i class="fas fa-search"></i>
        <h3>Nenhuma sala encontrada</h3>
        <p>Não há salas para a tecnologia "${currentTechnology}"</p>
        <button class="btn-create" onclick="showCreateRoomModal('${currentTechnology}')">
            <i class="fas fa-plus"></i> Criar Sala
        </button>
    `;
    grid.appendChild(emptyState);
}

function hideEmptyState() {
    const emptyState = document.querySelector('.public-rooms-grid .empty-state');
    if (emptyState) {
        emptyState.remove();
    }
}

// ===== API: BUSCAR SALAS =====
async function fetchRoomsByTechnology(technology) {
    try {
        showLoading();
        
        const response = await fetch(`/chat/api/rooms?technology=${encodeURIComponent(technology)}`);
        const data = await response.json();
        
        if (data.success) {
            updateRoomsGrid(data.rooms);
        } else {
            showError('Erro ao buscar salas');
        }
    } catch (error) {
        console.error('Erro ao buscar salas:', error);
        showError('Erro de conexão');
    } finally {
        hideLoading();
    }
}

function updateRoomsGrid(rooms) {
    const grid = document.getElementById('publicRoomsGrid');
    
    // Limpar grid atual
    grid.innerHTML = '';
    
    if (rooms.length === 0) {
        showEmptyState();
        return;
    }
    
    // Adicionar salas
    rooms.forEach(room => {
        const roomCard = createRoomCard(room);
        grid.appendChild(roomCard);
    });
}

function createRoomCard(room) {
    const card = document.createElement('div');
    card.className = 'room-card';
    card.dataset.technology = room.technology;
    
    card.innerHTML = `
        <div class="room-header">
            <div class="room-title">
                <h4>${room.name}</h4>
                <span class="tech-badge">${room.technology}</span>
            </div>
            <div class="room-activity">
                <span class="recent-messages">${room.recent_messages || 0} msgs/h</span>
            </div>
        </div>
        <div class="room-description">${room.description}</div>
        <div class="room-footer">
            <div class="room-stats">
                <span><i class="fas fa-users"></i> ${room.member_count}/${room.max_users}</span>
                <span><i class="fas fa-user"></i> ${room.creator_name}</span>
            </div>
            <div class="room-actions">
                ${room.is_member ? 
                    `<button class="btn-enter" onclick="joinRoom(${room.id})">
                        <i class="fas fa-sign-in-alt"></i> Entrar
                    </button>` :
                    `<button class="btn-join" onclick="joinChatRoom(${room.id})">
                        <i class="fas fa-plus"></i> Participar
                    </button>`
                }
            </div>
        </div>
    `;
    
    return card;
}

// ===== NAVEGAÇÃO ENTRE SALAS =====
function joinRoom(roomId) {
    console.log(`🚪 Entrando na sala ${roomId}`);
    window.location.href = `/chat/room/${roomId}`;
}

async function joinChatRoom(roomId) {
    console.log(`➕ Participando da sala ${roomId}`);
    
    try {
        showLoading();
        
        const response = await fetch(`/chat/api/rooms/${roomId}/join`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            showSuccess('Entrou na sala com sucesso!');
            
            // Redirecionar para a sala após 1 segundo
            setTimeout(() => {
                joinRoom(roomId);
            }, 1000);
        } else {
            showError(data.message || 'Erro ao entrar na sala');
        }
    } catch (error) {
        console.error('Erro ao entrar na sala:', error);
        showError('Erro de conexão');
    } finally {
        hideLoading();
    }
}

async function joinStudyGroup(groupId) {
    console.log(`🎓 Participando do grupo de estudo ${groupId}`);
    
    // Implementar lógica similar ao joinChatRoom
    // Por enquanto, redirecionar para criação
    showInfo('Funcionalidade em desenvolvimento');
}

// ===== MODAIS =====
function showCreateRoomModal(preselectedTech = '') {
    console.log('🏗️ Abrindo modal de criação de sala');
    
    const modal = document.getElementById('createRoomModal');
    
    // Preselecionar tecnologia se fornecida
    if (preselectedTech) {
        const techSelect = document.getElementById('roomTechnology');
        techSelect.value = preselectedTech;
    }
    
    // Limpar formulário
    document.getElementById('createRoomForm').reset();
    if (preselectedTech) {
        document.getElementById('roomTechnology').value = preselectedTech;
    }
    
    modal.classList.add('show');
    modal.style.display = 'flex';
    
    // Focar no primeiro input
    setTimeout(() => {
        document.getElementById('roomName').focus();
    }, 100);
}

function showCreateGroupModal() {
    console.log('🎓 Abrindo modal de criação de grupo');
    
    const modal = document.getElementById('createGroupModal');
    
    // Limpar formulário
    document.getElementById('createGroupForm').reset();
    
    modal.classList.add('show');
    modal.style.display = 'flex';
    
    // Focar no primeiro input
    setTimeout(() => {
        document.getElementById('groupName').focus();
    }, 100);
}

function closeModal(modalId) {
    console.log(`❌ Fechando modal: ${modalId}`);
    
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
        
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }
}

function closeAllModals() {
    const modals = document.querySelectorAll('.modal.show');
    modals.forEach(modal => {
        closeModal(modal.id);
    });
}

// ===== CRIAÇÃO DE SALAS =====
async function createChatRoom(event) {
    event.preventDefault();
    console.log('🏗️ Criando nova sala de chat');
    
    const form = event.target;
    const formData = new FormData(form);
    
    const roomData = {
        name: formData.get('name'),
        description: formData.get('description'),
        technology: formData.get('technology'),
        maxUsers: parseInt(formData.get('maxUsers')) || 50
    };
    
    // Validações
    if (!roomData.name || !roomData.description || !roomData.technology) {
        showError('Todos os campos obrigatórios devem ser preenchidos');
        return;
    }
    
    try {
        showLoading();
        
        const response = await fetch('/chat/api/rooms', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(roomData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            showSuccess('Sala criada com sucesso!');
            closeModal('createRoomModal');
            
            // Redirecionar para a nova sala
            setTimeout(() => {
                joinRoom(data.room.id);
            }, 1000);
        } else {
            showError(data.message || 'Erro ao criar sala');
        }
    } catch (error) {
        console.error('Erro ao criar sala:', error);
        showError('Erro de conexão');
    } finally {
        hideLoading();
    }
}

// ===== CRIAÇÃO DE GRUPOS =====
async function createStudyGroup(event) {
    event.preventDefault();
    console.log('🎓 Criando novo grupo de estudo');
    
    const form = event.target;
    const formData = new FormData(form);
    
    const groupData = {
        name: formData.get('name'),
        description: formData.get('description'),
        technology: formData.get('technology'),
        schedule: formData.get('schedule'),
        maxMembers: parseInt(formData.get('maxMembers')) || 10
    };
    
    // Validações
    if (!groupData.name || !groupData.description || !groupData.technology || !groupData.schedule) {
        showError('Todos os campos devem ser preenchidos');
        return;
    }
    
    try {
        showLoading();
        
        const response = await fetch('/chat/api/study-groups', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(groupData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            showSuccess('Grupo de estudo criado com sucesso!');
            closeModal('createGroupModal');
            
            // Recarregar página para mostrar novo grupo
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } else {
            showError(data.message || 'Erro ao criar grupo');
        }
    } catch (error) {
        console.error('Erro ao criar grupo:', error);
        showError('Erro de conexão');
    } finally {
        hideLoading();
    }
}

// ===== VALIDAÇÃO DE FORMULÁRIOS =====
function setupFormValidation() {
    // Validação em tempo real para formulário de sala
    const roomForm = document.getElementById('createRoomForm');
    if (roomForm) {
        setupRoomFormValidation(roomForm);
    }
    
    // Validação em tempo real para formulário de grupo
    const groupForm = document.getElementById('createGroupForm');
    if (groupForm) {
        setupGroupFormValidation(groupForm);
    }
}

function setupRoomFormValidation(form) {
    const nameInput = form.querySelector('#roomName');
    const descInput = form.querySelector('#roomDescription');
    
    nameInput.addEventListener('input', function() {
        validateRoomName(this.value);
    });
    
    descInput.addEventListener('input', function() {
        validateRoomDescription(this.value);
    });
}

function setupGroupFormValidation(form) {
    const nameInput = form.querySelector('#groupName');
    const descInput = form.querySelector('#groupDescription');
    
    nameInput.addEventListener('input', function() {
        validateGroupName(this.value);
    });
    
    descInput.addEventListener('input', function() {
        validateGroupDescription(this.value);
    });
}

function validateRoomName(name) {
    const input = document.getElementById('roomName');
    
    if (name.length < 3) {
        setInputError(input, 'Nome deve ter pelo menos 3 caracteres');
        return false;
    } else if (name.length > 100) {
        setInputError(input, 'Nome muito longo (máximo 100 caracteres)');
        return false;
    } else {
        setInputSuccess(input);
        return true;
    }
}

function validateRoomDescription(description) {
    const input = document.getElementById('roomDescription');
    
    if (description.length < 10) {
        setInputError(input, 'Descrição deve ter pelo menos 10 caracteres');
        return false;
    } else if (description.length > 500) {
        setInputError(input, 'Descrição muito longa (máximo 500 caracteres)');
        return false;
    } else {
        setInputSuccess(input);
        return true;
    }
}

function validateGroupName(name) {
    const input = document.getElementById('groupName');
    
    if (name.length < 3) {
        setInputError(input, 'Nome deve ter pelo menos 3 caracteres');
        return false;
    } else if (name.length > 100) {
        setInputError(input, 'Nome muito longo (máximo 100 caracteres)');
        return false;
    } else {
        setInputSuccess(input);
        return true;
    }
}

function validateGroupDescription(description) {
    const input = document.getElementById('groupDescription');
    
    if (description.length < 10) {
        setInputError(input, 'Descrição deve ter pelo menos 10 caracteres');
        return false;
    } else if (description.length > 500) {
        setInputError(input, 'Descrição muito longa (máximo 500 caracteres)');
        return false;
    } else {
        setInputSuccess(input);
        return true;
    }
}

function setInputError(input, message) {
    input.style.borderColor = '#ef4444';
    
    // Remover mensagem anterior
    const existingError = input.parentNode.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    // Adicionar nova mensagem
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.color = '#ef4444';
    errorDiv.style.fontSize = '0.8rem';
    errorDiv.style.marginTop = '4px';
    errorDiv.textContent = message;
    
    input.parentNode.appendChild(errorDiv);
}

function setInputSuccess(input) {
    input.style.borderColor = '#10b981';
    
    // Remover mensagem de erro
    const existingError = input.parentNode.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
}

// ===== UTILITÁRIOS =====
function showLoading() {
    isLoading = true;
    const loadingState = document.getElementById('loadingState');
    if (loadingState) {
        loadingState.classList.remove('hidden');
    }
}

function hideLoading() {
    isLoading = false;
    const loadingState = document.getElementById('loadingState');
    if (loadingState) {
        loadingState.classList.add('hidden');
    }
}

function showSuccess(message) {
    console.log(`✅ ${message}`);
    // Implementar toast/notification
    alert(message); // Temporário
}

function showError(message) {
    console.error(`❌ ${message}`);
    // Implementar toast/notification
    alert(message); // Temporário
}

function showInfo(message) {
    console.log(`ℹ️ ${message}`);
    // Implementar toast/notification
    alert(message); // Temporário
}

// ===== ANIMAÇÕES CSS =====
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    .error-message {
        animation: fadeIn 0.3s ease;
    }
`;
document.head.appendChild(style);

// ===== EXPORT PARA DEBUGGING =====
window.ChatSystem = {
    filterByTechnology,
    joinRoom,
    joinChatRoom,
    showCreateRoomModal,
    showCreateGroupModal,
    closeModal,
    createChatRoom,
    createStudyGroup
}; 