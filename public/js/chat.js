/**
 * JavaScript do Sistema de Chat - CodePath
 * Funcionalidades de chat, salas e grupos de estudo
 * 
 * Funcionalidades:
 * - Criação de salas e grupos
 * - Filtros por tecnologia
 * - Navegação entre salas
 * - Modais interativos
 * - Simulação de tempo real
 * - Mensagens mockadas
 */

// ===== VARIÁVEIS GLOBAIS =====
let currentTechnology = '';
let isLoading = false;
let simulationInterval;
let mockUsers = [];
let mockMessages = [];

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Sistema de Chat iniciado');
    
    // Configurar eventos
    setupEventListeners();
    
    // Carregar dados iniciais
    loadInitialData();
    
    // Inicializar simulação de tempo real
    initializeRealtimeSimulation();
    
    // Configurar dados mockados
    setupMockData();
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
    
    // Pausar simulação quando aba perde foco
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            pauseSimulation();
        } else {
            resumeSimulation();
        }
    });
}

// ===== DADOS MOCKADOS =====
function setupMockData() {
    // Usuários simulados
    mockUsers = [
        { id: 1, name: 'Ana Silva', avatar: '👩‍💻', status: 'online', technology: 'Python' },
        { id: 2, name: 'Carlos Santos', avatar: '👨‍💻', status: 'online', technology: 'JavaScript' },
        { id: 3, name: 'Maria Oliveira', avatar: '👩‍🎓', status: 'away', technology: 'Java' },
        { id: 4, name: 'João Costa', avatar: '👨‍🎓', status: 'online', technology: 'C' },
        { id: 5, name: 'Fernanda Lima', avatar: '👩‍💼', status: 'online', technology: 'HTML/CSS' },
        { id: 6, name: 'Pedro Alves', avatar: '👨‍💼', status: 'away', technology: 'C#' },
        { id: 7, name: 'Julia Rocha', avatar: '👩‍🔬', status: 'online', technology: 'Python' },
        { id: 8, name: 'Lucas Ferreira', avatar: '👨‍🔬', status: 'online', technology: 'JavaScript' }
    ];
    
    // Templates de mensagens
    mockMessages = [
        "Alguém pode me ajudar com esse erro?",
        "Acabei de terminar o exercício! 🎉",
        "Qual a melhor forma de implementar isso?",
        "Muito obrigado pela ajuda pessoal!",
        "Estou com dificuldade neste conceito...",
        "Compartilhando um link útil: https://example.com",
        "Vamos fazer um grupo de estudos?",
        "Consegui resolver! Era só um ponto e vírgula 😅",
        "Alguém mais online para estudar?",
        "Boa noite pessoal, até amanhã! 👋"
    ];
    
    console.log('📊 Dados mockados configurados:', mockUsers.length, 'usuários');
}

// ===== SIMULAÇÃO DE TEMPO REAL =====
function initializeRealtimeSimulation() {
    // Simular atividade a cada 15-30 segundos
    simulationInterval = setInterval(() => {
        if (!document.hidden) {
            simulateActivity();
        }
    }, Math.random() * 15000 + 15000); // 15-30 segundos
    
    console.log('🎭 Simulação de tempo real iniciada');
}

function simulateActivity() {
    const activities = [
        'updateMemberCount',
        'simulateNewMessage',
        'updateUserStatus',
        'simulateTyping'
    ];
    
    const randomActivity = activities[Math.floor(Math.random() * activities.length)];
    
    switch (randomActivity) {
        case 'updateMemberCount':
            updateRandomRoomMemberCount();
            break;
        case 'simulateNewMessage':
            simulateNewMessageNotification();
            break;
        case 'updateUserStatus':
            updateRandomUserStatus();
            break;
        case 'simulateTyping':
            simulateTypingIndicator();
            break;
    }
}

function updateRandomRoomMemberCount() {
    const roomCards = document.querySelectorAll('.room-card');
    if (roomCards.length === 0) return;
    
    const randomCard = roomCards[Math.floor(Math.random() * roomCards.length)];
    const memberCountElement = randomCard.querySelector('.room-stats span:first-child');
    
    if (memberCountElement) {
        const currentText = memberCountElement.textContent;
        const match = currentText.match(/(\d+)\/(\d+)/);
        
        if (match) {
            const currentCount = parseInt(match[1]);
            const maxCount = parseInt(match[2]);
            
            // Pequena variação no número de membros
            const variation = Math.random() > 0.5 ? 1 : -1;
            const newCount = Math.max(1, Math.min(maxCount, currentCount + variation));
            
            memberCountElement.innerHTML = `<i class="fas fa-users"></i> ${newCount}/${maxCount}`;
            
            // Animação visual
            memberCountElement.style.animation = 'pulse 0.5s ease';
            setTimeout(() => {
                memberCountElement.style.animation = '';
            }, 500);
        }
    }
}

function simulateNewMessageNotification() {
    const roomCards = document.querySelectorAll('.room-card');
    if (roomCards.length === 0) return;
    
    const randomCard = roomCards[Math.floor(Math.random() * roomCards.length)];
    const activityElement = randomCard.querySelector('.recent-messages');
    
    if (activityElement) {
        const currentText = activityElement.textContent;
        const match = currentText.match(/(\d+)/);
        
        if (match) {
            const currentCount = parseInt(match[1]);
            const newCount = currentCount + Math.floor(Math.random() * 3) + 1;
            
            activityElement.textContent = `${newCount} msgs/h`;
            
            // Efeito visual de nova mensagem
            activityElement.style.background = 'var(--primary-color)';
            activityElement.style.color = 'white';
            activityElement.style.animation = 'bounce 0.6s ease';
            
            setTimeout(() => {
                activityElement.style.background = '';
                activityElement.style.color = '';
                activityElement.style.animation = '';
            }, 2000);
        }
    }
}

function updateRandomUserStatus() {
    // Simular mudança de status de usuários online
    const onlineIndicators = document.querySelectorAll('.user-status.online, .user-status.away');
    if (onlineIndicators.length === 0) return;
    
    const randomIndicator = onlineIndicators[Math.floor(Math.random() * onlineIndicators.length)];
    const isOnline = randomIndicator.classList.contains('online');
    
    // Alternar status
    if (isOnline && Math.random() > 0.8) { // 20% chance de ficar away
        randomIndicator.classList.remove('online');
        randomIndicator.classList.add('away');
    } else if (!isOnline && Math.random() > 0.6) { // 40% chance de voltar online
        randomIndicator.classList.remove('away');
        randomIndicator.classList.add('online');
    }
}

function simulateTypingIndicator() {
    // Simular indicador de "digitando" em salas ativas
    const chatRooms = document.querySelectorAll('.room-card');
    if (chatRooms.length === 0) return;
    
    const randomRoom = chatRooms[Math.floor(Math.random() * chatRooms.length)];
    const roomFooter = randomRoom.querySelector('.room-footer');
    
    if (roomFooter && Math.random() > 0.7) { // 30% chance
        const randomUser = mockUsers[Math.floor(Math.random() * mockUsers.length)];
        
        // Criar indicador de digitação
        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'typing-indicator';
        typingIndicator.innerHTML = `
            <span class="typing-user">${randomUser.name} está digitando...</span>
            <div class="typing-dots">
                <span></span><span></span><span></span>
            </div>
        `;
        
        roomFooter.appendChild(typingIndicator);
        
        // Remover após 3-5 segundos
        setTimeout(() => {
            if (typingIndicator.parentNode) {
                typingIndicator.remove();
            }
        }, Math.random() * 2000 + 3000);
    }
}

function pauseSimulation() {
    if (simulationInterval) {
        clearInterval(simulationInterval);
        console.log('⏸️ Simulação pausada');
    }
}

function resumeSimulation() {
    if (!simulationInterval) {
        initializeRealtimeSimulation();
        console.log('▶️ Simulação retomada');
    }
}

// ===== CARREGAMENTO DE DADOS =====
function loadInitialData() {
    console.log('📊 Carregando dados iniciais do chat');
    
    // Dados já carregados pelo servidor
    console.log('✅ Dados carregados via template');
    
    // Inicializar contadores dinâmicos
    initializeDynamicCounters();
}

function initializeDynamicCounters() {
    // Atualizar contadores de membros online
    const roomCards = document.querySelectorAll('.room-card');
    roomCards.forEach(card => {
        const memberCount = card.querySelector('.room-stats span:first-child');
        if (memberCount) {
            // Adicionar pequena variação aleatória
            const text = memberCount.textContent;
            const match = text.match(/(\d+)\/(\d+)/);
            if (match) {
                const current = parseInt(match[1]);
                const max = parseInt(match[2]);
                const variation = Math.floor(Math.random() * 3) - 1; // -1, 0, ou 1
                const newCount = Math.max(1, Math.min(max, current + variation));
                memberCount.innerHTML = `<i class="fas fa-users"></i> ${newCount}/${max}`;
            }
        }
    });
}

// ===== FILTROS DE TECNOLOGIA =====
function filterByTechnology(technology) {
    console.log(`🔍 Filtrando por tecnologia: ${technology || 'Todas'}`);
    
    currentTechnology = technology;
    
    // Atualizar botões ativos
    updateFilterButtons(technology);
    
    // Filtrar cards de salas
    filterRoomCards(technology);
    
    // Filtrar grupos de estudo
    filterStudyGroups(technology);
    
    // Buscar salas via API (opcional para atualização dinâmica)
    if (technology) {
        fetchRoomsByTechnology(technology);
    }
    
    // Feedback visual
    showFilterFeedback(technology);
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
    let visibleCount = 0;
    
    roomCards.forEach(card => {
        const cardTechnology = card.dataset.technology;
        
        if (!technology || cardTechnology === technology) {
            card.style.display = 'block';
            card.style.animation = 'fadeIn 0.3s ease';
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });
    
    // Gerenciar estado vazio
    const emptyState = document.querySelector('.public-rooms-grid .empty-state');
    if (visibleCount === 0 && !emptyState) {
        showEmptyState('rooms');
    } else if (visibleCount > 0 && emptyState) {
        hideEmptyState('rooms');
    }
}

function filterStudyGroups(technology) {
    const groupCards = document.querySelectorAll('.study-group-card');
    let visibleCount = 0;
    
    groupCards.forEach(card => {
        const cardTechnology = card.dataset.technology;
        
        if (!technology || cardTechnology === technology) {
            card.style.display = 'block';
            card.style.animation = 'fadeIn 0.3s ease';
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });
    
    // Gerenciar estado vazio para grupos
    const emptyState = document.querySelector('.study-groups-grid .empty-state');
    if (visibleCount === 0 && !emptyState) {
        showEmptyState('groups');
    } else if (visibleCount > 0 && emptyState) {
        hideEmptyState('groups');
    }
}

function showFilterFeedback(technology) {
    const feedbackElement = document.getElementById('filterFeedback');
    if (!feedbackElement) return;
    
    const message = technology ? 
        `Mostrando salas de ${technology}` : 
        'Mostrando todas as salas';
    
    feedbackElement.textContent = message;
    feedbackElement.style.opacity = '1';
    
    setTimeout(() => {
        feedbackElement.style.opacity = '0';
    }, 2000);
}

function showEmptyState(type = 'rooms') {
    const gridSelector = type === 'rooms' ? '.public-rooms-grid' : '.study-groups-grid';
    const grid = document.querySelector(gridSelector);
    if (!grid) return;
    
    const emptyState = document.createElement('div');
    emptyState.className = 'empty-state';
    
    if (type === 'rooms') {
        emptyState.innerHTML = `
            <i class="fas fa-search"></i>
            <h3>Nenhuma sala encontrada</h3>
            <p>Não há salas para a tecnologia "${currentTechnology}"</p>
            <button class="btn-create" onclick="showCreateRoomModal('${currentTechnology}')">
                <i class="fas fa-plus"></i> Criar Sala
            </button>
        `;
    } else {
        emptyState.innerHTML = `
            <i class="fas fa-users"></i>
            <h3>Nenhum grupo encontrado</h3>
            <p>Não há grupos de estudo para "${currentTechnology}"</p>
            <button class="btn-create" onclick="showCreateGroupModal('${currentTechnology}')">
                <i class="fas fa-plus"></i> Criar Grupo
            </button>
        `;
    }
    
    grid.appendChild(emptyState);
}

function hideEmptyState(type = 'rooms') {
    const gridSelector = type === 'rooms' ? '.public-rooms-grid' : '.study-groups-grid';
    const emptyState = document.querySelector(`${gridSelector} .empty-state`);
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
            
            // Simular pequeno delay para mostrar loading
            setTimeout(() => {
                showSuccess(`${data.rooms.length} salas encontradas para ${technology}`);
            }, 500);
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
    const grid = document.querySelector('.public-rooms-grid');
    if (!grid) return;
    
    // Limpar grid atual (exceto filtros)
    const roomCards = grid.querySelectorAll('.room-card');
    roomCards.forEach(card => card.remove());
    
    if (rooms.length === 0) {
        showEmptyState('rooms');
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
                <span class="recent-messages">${room.recent_messages || Math.floor(Math.random() * 20) + 5} msgs/h</span>
            </div>
        </div>
        <div class="room-description">${room.description}</div>
        <div class="room-footer">
            <div class="room-stats">
                <span><i class="fas fa-users"></i> ${room.member_count || Math.floor(Math.random() * 15) + 3}/${room.max_users || 50}</span>
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

// ===== NAVEGAÇÃO E AÇÕES =====
function joinRoom(roomId) {
    console.log(`🚪 Entrando na sala ${roomId}`);
    window.location.href = `/chat/room/${roomId}`;
}

async function joinChatRoom(roomId) {
    try {
        showLoading();
        
        const response = await fetch(`/chat/api/rooms/${roomId}/join`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            showSuccess('Você entrou na sala! Redirecionando...');
            setTimeout(() => {
                window.location.href = `/chat/room/${roomId}`;
            }, 1500);
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
    try {
        showLoading();
        
        const response = await fetch(`/chat/api/study-groups/${groupId}/join`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            showSuccess('Você entrou no grupo de estudos!');
            // Atualizar interface
            setTimeout(() => {
                location.reload();
            }, 1500);
        } else {
            showError(data.message || 'Erro ao entrar no grupo');
        }
    } catch (error) {
        console.error('Erro ao entrar no grupo:', error);
        showError('Erro de conexão');
    } finally {
        hideLoading();
    }
}

// ===== MODAIS =====
function showCreateRoomModal(preselectedTech = '') {
    const modal = document.getElementById('createRoomModal');
    if (!modal) return;
    
    // Pré-selecionar tecnologia se fornecida
    if (preselectedTech) {
        const techSelect = modal.querySelector('#roomTechnology');
        if (techSelect) {
            techSelect.value = preselectedTech;
        }
    }
    
    // Limpar formulário
    const form = modal.querySelector('#createRoomForm');
    if (form) {
        form.reset();
        clearFormErrors(form);
    }
    
    modal.style.display = 'flex';
    
    // Focar no primeiro input
    const firstInput = modal.querySelector('input[type="text"]');
    if (firstInput) {
        setTimeout(() => firstInput.focus(), 100);
    }
}

function showCreateGroupModal(preselectedTech = '') {
    const modal = document.getElementById('createGroupModal');
    if (!modal) return;
    
    // Pré-selecionar tecnologia se fornecida
    if (preselectedTech) {
        const techSelect = modal.querySelector('#groupTechnology');
        if (techSelect) {
            techSelect.value = preselectedTech;
        }
    }
    
    // Limpar formulário
    const form = modal.querySelector('#createGroupForm');
    if (form) {
        form.reset();
        clearFormErrors(form);
    }
    
    modal.style.display = 'flex';
    
    // Focar no primeiro input
    const firstInput = modal.querySelector('input[type="text"]');
    if (firstInput) {
        setTimeout(() => firstInput.focus(), 100);
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        
        // Limpar formulários
        const forms = modal.querySelectorAll('form');
        forms.forEach(form => {
            form.reset();
            clearFormErrors(form);
        });
    }
}

function closeAllModals() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.style.display = 'none';
    });
}

// ===== CRIAÇÃO DE SALAS E GRUPOS =====
async function createChatRoom(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    // Validar formulário
    if (!validateCreateRoomForm(form)) {
        return;
    }
    
    try {
        showLoading();
        
        const response = await fetch('/chat/api/rooms', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: formData.get('name'),
                description: formData.get('description'),
                technology: formData.get('technology'),
                type: formData.get('type') || 'public',
                maxUsers: parseInt(formData.get('maxUsers')) || 50
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showSuccess('Sala criada com sucesso! Redirecionando...');
            closeModal('createRoomModal');
            
            setTimeout(() => {
                window.location.href = `/chat/room/${data.room.id}`;
            }, 1500);
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

async function createStudyGroup(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    // Validar formulário
    if (!validateCreateGroupForm(form)) {
        return;
    }
    
    try {
        showLoading();
        
        const response = await fetch('/chat/api/study-groups', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: formData.get('name'),
                description: formData.get('description'),
                technology: formData.get('technology'),
                schedule: formData.get('schedule'),
                maxMembers: parseInt(formData.get('maxMembers')) || 10
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showSuccess('Grupo de estudos criado com sucesso!');
            closeModal('createGroupModal');
            
            setTimeout(() => {
                location.reload();
            }, 1500);
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
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        const inputs = form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('blur', () => validateField(input));
            input.addEventListener('input', () => clearFieldError(input));
        });
    });
}

function validateCreateRoomForm(form) {
    let isValid = true;
    
    const name = form.querySelector('[name="name"]');
    const description = form.querySelector('[name="description"]');
    const technology = form.querySelector('[name="technology"]');
    
    // Validar nome
    if (!name.value.trim()) {
        setFieldError(name, 'Nome é obrigatório');
        isValid = false;
    } else if (name.value.trim().length < 3) {
        setFieldError(name, 'Nome deve ter pelo menos 3 caracteres');
        isValid = false;
    }
    
    // Validar descrição
    if (!description.value.trim()) {
        setFieldError(description, 'Descrição é obrigatória');
        isValid = false;
    } else if (description.value.trim().length < 10) {
        setFieldError(description, 'Descrição deve ter pelo menos 10 caracteres');
        isValid = false;
    }
    
    // Validar tecnologia
    if (!technology.value) {
        setFieldError(technology, 'Selecione uma tecnologia');
        isValid = false;
    }
    
    return isValid;
}

function validateCreateGroupForm(form) {
    let isValid = true;
    
    const name = form.querySelector('[name="name"]');
    const description = form.querySelector('[name="description"]');
    const technology = form.querySelector('[name="technology"]');
    const schedule = form.querySelector('[name="schedule"]');
    
    // Validar nome
    if (!name.value.trim()) {
        setFieldError(name, 'Nome é obrigatório');
        isValid = false;
    } else if (name.value.trim().length < 3) {
        setFieldError(name, 'Nome deve ter pelo menos 3 caracteres');
        isValid = false;
    }
    
    // Validar descrição
    if (!description.value.trim()) {
        setFieldError(description, 'Descrição é obrigatória');
        isValid = false;
    }
    
    // Validar tecnologia
    if (!technology.value) {
        setFieldError(technology, 'Selecione uma tecnologia');
        isValid = false;
    }
    
    // Validar horário
    if (!schedule.value.trim()) {
        setFieldError(schedule, 'Horário é obrigatório');
        isValid = false;
    }
    
    return isValid;
}

function validateField(field) {
    const value = field.value.trim();
    const fieldName = field.name;
    
    switch (fieldName) {
        case 'name':
            if (!value) {
                setFieldError(field, 'Nome é obrigatório');
                return false;
            } else if (value.length < 3) {
                setFieldError(field, 'Nome deve ter pelo menos 3 caracteres');
                return false;
            }
            break;
        case 'description':
            if (!value) {
                setFieldError(field, 'Descrição é obrigatória');
                return false;
            } else if (value.length < 10) {
                setFieldError(field, 'Descrição deve ter pelo menos 10 caracteres');
                return false;
            }
            break;
        case 'technology':
            if (!value) {
                setFieldError(field, 'Selecione uma tecnologia');
                return false;
            }
            break;
    }
    
    setFieldSuccess(field);
    return true;
}

function setFieldError(field, message) {
    const formGroup = field.closest('.form-group');
    if (!formGroup) return;
    
    formGroup.classList.add('error');
    formGroup.classList.remove('success');
    
    let errorElement = formGroup.querySelector('.error-message');
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        formGroup.appendChild(errorElement);
    }
    
    errorElement.textContent = message;
}

function setFieldSuccess(field) {
    const formGroup = field.closest('.form-group');
    if (!formGroup) return;
    
    formGroup.classList.add('success');
    formGroup.classList.remove('error');
    
    const errorElement = formGroup.querySelector('.error-message');
    if (errorElement) {
        errorElement.remove();
    }
}

function clearFieldError(field) {
    const formGroup = field.closest('.form-group');
    if (!formGroup) return;
    
    formGroup.classList.remove('error');
    
    const errorElement = formGroup.querySelector('.error-message');
    if (errorElement) {
        errorElement.remove();
    }
}

function clearFormErrors(form) {
    const errorElements = form.querySelectorAll('.error-message');
    errorElements.forEach(element => element.remove());
    
    const formGroups = form.querySelectorAll('.form-group');
    formGroups.forEach(group => {
        group.classList.remove('error', 'success');
    });
}

// ===== FEEDBACK VISUAL =====
function showLoading() {
    if (isLoading) return;
    
    isLoading = true;
    
    // Criar overlay de loading
    const loadingOverlay = document.createElement('div');
    loadingOverlay.id = 'loadingOverlay';
    loadingOverlay.className = 'loading-overlay';
    loadingOverlay.innerHTML = `
        <div class="loading-spinner">
            <div class="spinner"></div>
            <p>Carregando...</p>
        </div>
    `;
    
    document.body.appendChild(loadingOverlay);
}

function hideLoading() {
    isLoading = false;
    
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
        loadingOverlay.remove();
    }
}

function showSuccess(message) {
    showNotification(message, 'success');
}

function showError(message) {
    showNotification(message, 'error');
}

function showInfo(message) {
    showNotification(message, 'info');
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Container de notificações
    let container = document.getElementById('notificationContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'notificationContainer';
        container.className = 'notification-container';
        document.body.appendChild(container);
    }
    
    container.appendChild(notification);
    
    // Auto-remover após 5 segundos
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }
    }, 5000);
}

// ===== CLEANUP =====
window.addEventListener('beforeunload', function() {
    pauseSimulation();
});

// ===== FUNÇÕES GLOBAIS =====
window.filterByTechnology = filterByTechnology;
window.joinRoom = joinRoom;
window.joinChatRoom = joinChatRoom;
window.joinStudyGroup = joinStudyGroup;
window.showCreateRoomModal = showCreateRoomModal;
window.showCreateGroupModal = showCreateGroupModal;
window.closeModal = closeModal;
window.createChatRoom = createChatRoom;
window.createStudyGroup = createStudyGroup; 