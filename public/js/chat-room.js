/**
 * JavaScript da Sala de Chat - CodePath
 * Funcionalidades específicas para salas de chat individuais
 * 
 * Funcionalidades:
 * - Envio de mensagens
 * - Polling de novas mensagens
 * - Gestão de membros
 * - Tipos de mensagem (texto/código)
 * - Simulação de tempo real
 * - Interface de digitação
 */

// ===== VARIÁVEIS GLOBAIS =====
let messagePollingInterval;
let currentMessageType = 'text';
let lastMessageId = 0;
let isPolling = false;
let isSending = false;
let mockMessageInterval;
let typingSimulationInterval;
let mockUsers = [];
let mockMessageTemplates = [];

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Sala de Chat iniciada');
    
    // Configurar eventos
    setupEventListeners();
    
    // Inicializar funcionalidades
    initializeChatRoom();
    
    // Configurar dados mockados
    setupMockData();
    
    // Iniciar simulação de tempo real
    startRealtimeSimulation();
    
    // Iniciar polling de mensagens
    startMessagePolling();
    
    // Configurar auto-resize do textarea
    setupAutoResize();
});

// ===== DADOS MOCKADOS =====
function setupMockData() {
    // Usuários simulados para esta sala
    mockUsers = [
        { id: 2, name: 'Ana Silva', avatar: '👩‍💻', status: 'online' },
        { id: 3, name: 'Carlos Santos', avatar: '👨‍💻', status: 'online' },
        { id: 4, name: 'Maria Oliveira', avatar: '👩‍🎓', status: 'away' },
        { id: 5, name: 'João Costa', avatar: '👨‍🎓', status: 'online' },
        { id: 6, name: 'Fernanda Lima', avatar: '👩‍💼', status: 'online' },
        { id: 7, name: 'Pedro Alves', avatar: '👨‍💼', status: 'away' }
    ];
    
    // Templates de mensagens realistas
    mockMessageTemplates = [
        "Alguém pode me ajudar com esse erro que estou enfrentando?",
        "Acabei de terminar o exercício! Foi mais difícil do que esperava 🎉",
        "Qual seria a melhor forma de implementar essa funcionalidade?",
        "Muito obrigado pela ajuda pessoal! Vocês são incríveis 🙏",
        "Estou com dificuldade para entender esse conceito...",
        "Encontrei um artigo interessante sobre isso: https://exemplo.com",
        "Alguém quer formar um grupo de estudos para esta semana?",
        "Consegui resolver! Era só um erro de sintaxe 😅",
        "Pessoal, alguém mais está online para tirar dúvidas?",
        "Boa noite pessoal! Até amanhã nos estudos 👋",
        "Compartilhando minha solução para o exercício anterior",
        "Essa aula foi muito esclarecedora, recomendo!",
        "Tem algum material complementar sobre esse tópico?",
        "Vou fazer uma pausa para o café ☕ Volto já!",
        "Alguém já fez o quiz desta seção?",
        "Dica: sempre testem o código antes de submeter!",
        "Estou progredindo bem nesta trilha 📈",
        "Quem mais está fazendo o curso completo?",
        "Vamos marcar um estudo em grupo para amanhã?",
        "Parabéns pessoal pelo progresso! 🚀"
    ];
    
    console.log('📊 Dados mockados configurados para sala:', mockUsers.length, 'usuários');
}

// ===== SIMULAÇÃO DE TEMPO REAL =====
function startRealtimeSimulation() {
    // Simular mensagens a cada 20-45 segundos
    mockMessageInterval = setInterval(() => {
        if (!document.hidden && Math.random() > 0.3) { // 70% chance
            simulateNewMessage();
        }
    }, Math.random() * 25000 + 20000); // 20-45 segundos
    
    // Simular indicadores de digitação
    typingSimulationInterval = setInterval(() => {
        if (!document.hidden && Math.random() > 0.7) { // 30% chance
            simulateTypingIndicator();
        }
    }, Math.random() * 15000 + 10000); // 10-25 segundos
    
    console.log('🎭 Simulação de tempo real iniciada');
}

function simulateNewMessage() {
    const randomUser = mockUsers[Math.floor(Math.random() * mockUsers.length)];
    const randomTemplate = mockMessageTemplates[Math.floor(Math.random() * mockMessageTemplates.length)];
    
    // Criar mensagem simulada
    const mockMessage = {
        id: Date.now(), // ID único baseado em timestamp
        user_id: randomUser.id,
        user_name: randomUser.name,
        user_avatar: randomUser.avatar,
        message: randomTemplate,
        message_type: Math.random() > 0.9 ? 'code' : 'text', // 10% chance de ser código
        created_at: new Date().toISOString(),
        is_own: false
    };
    
    // Se for mensagem de código, ajustar conteúdo
    if (mockMessage.message_type === 'code') {
        const codeExamples = [
            "function hello() {\n    console.log('Hello World!');\n}",
            "for(let i = 0; i < 10; i++) {\n    console.log(i);\n}",
            "const array = [1, 2, 3];\nconst doubled = array.map(x => x * 2);",
            "if (condition) {\n    return true;\n} else {\n    return false;\n}",
            "const fetchData = async () => {\n    const response = await fetch('/api/data');\n    return response.json();\n};"
        ];
        mockMessage.message = codeExamples[Math.floor(Math.random() * codeExamples.length)];
    }
    
    // Adicionar mensagem à interface
    addMessageToList(mockMessage);
    
    // Scroll automático se usuário está no final
    if (isScrolledToBottom()) {
        scrollToBottom();
    }
    
    // Atualizar contador no título (simulação de notificação)
    updatePageTitle();
    
    console.log('💬 Mensagem simulada adicionada:', randomUser.name);
}

function simulateTypingIndicator() {
    const typingContainer = document.getElementById('typingIndicators');
    if (!typingContainer) return;
    
    // Verificar se já há muitos indicadores
    const existingIndicators = typingContainer.querySelectorAll('.typing-indicator');
    if (existingIndicators.length >= 2) return; // Máximo 2 pessoas digitando
    
    const randomUser = mockUsers[Math.floor(Math.random() * mockUsers.length)];
    
    // Verificar se este usuário já está digitando
    const existingUserIndicator = Array.from(existingIndicators).find(
        indicator => indicator.dataset.userId === randomUser.id.toString()
    );
    if (existingUserIndicator) return;
    
    // Criar indicador de digitação
    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'typing-indicator';
    typingIndicator.dataset.userId = randomUser.id;
    typingIndicator.innerHTML = `
        <div class="typing-user">
            <span class="user-avatar">${randomUser.avatar}</span>
            <span class="user-name">${randomUser.name}</span>
            <span class="typing-text">está digitando</span>
        </div>
        <div class="typing-dots">
            <span></span><span></span><span></span>
        </div>
    `;
    
    typingContainer.appendChild(typingIndicator);
    
    // Scroll para mostrar indicador
    scrollToBottom();
    
    // Remover após 3-8 segundos
    setTimeout(() => {
        if (typingIndicator.parentNode) {
            typingIndicator.style.animation = 'fadeOut 0.3s ease forwards';
            setTimeout(() => {
                typingIndicator.remove();
            }, 300);
        }
    }, Math.random() * 5000 + 3000);
}

function updatePageTitle() {
    const originalTitle = document.title;
    if (!originalTitle.includes('(')) {
        document.title = `(1) ${originalTitle}`;
        
        // Restaurar título após 3 segundos
        setTimeout(() => {
            document.title = originalTitle;
        }, 3000);
    }
}

function pauseRealtimeSimulation() {
    if (mockMessageInterval) {
        clearInterval(mockMessageInterval);
        mockMessageInterval = null;
    }
    if (typingSimulationInterval) {
        clearInterval(typingSimulationInterval);
        typingSimulationInterval = null;
    }
    console.log('⏸️ Simulação pausada');
}

function resumeRealtimeSimulation() {
    if (!mockMessageInterval || !typingSimulationInterval) {
        startRealtimeSimulation();
        console.log('▶️ Simulação retomada');
    }
}

// ===== CONFIGURAÇÃO DE EVENTOS =====
function setupEventListeners() {
    const messageInput = document.getElementById('messageInput');
    const messageForm = document.getElementById('messageForm');
    
    // Monitorar input para habilitar/desabilitar botão
    if (messageInput) {
        messageInput.addEventListener('input', handleMessageInput);
        
        // Monitorar teclas para atalhos
        messageInput.addEventListener('keydown', handleMessageKeydown);
        
        // Simular indicador de digitação do usuário
        messageInput.addEventListener('input', debounce(showUserTyping, 300));
    }
    
    // Scroll automático para novas mensagens
    const messagesContainer = document.getElementById('messagesContainer');
    if (messagesContainer) {
        messagesContainer.addEventListener('scroll', handleMessagesScroll);
    }
    
    // Detectar quando a aba perde/ganha foco para pausar simulação
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Botões de ação
    const sendButton = document.getElementById('sendButton');
    if (sendButton) {
        sendButton.addEventListener('click', (e) => {
            e.preventDefault();
            sendMessage(e);
        });
    }
    
    // Botão de alternar tipo de mensagem
    const toggleTypeButton = document.getElementById('toggleMessageType');
    if (toggleTypeButton) {
        toggleTypeButton.addEventListener('click', toggleMessageType);
    }
}

// ===== INICIALIZAÇÃO DA SALA =====
function initializeChatRoom() {
    console.log('📊 Inicializando sala de chat:', window.chatRoomData);
    
    // Scroll para a última mensagem
    scrollToBottom();
    
    // Configurar ID da última mensagem para polling
    const messages = document.querySelectorAll('.message[data-message-id]');
    if (messages.length > 0) {
        const lastMessage = messages[messages.length - 1];
        lastMessageId = parseInt(lastMessage.dataset.messageId) || 0;
    }
    
    // Focar no input
    const messageInput = document.getElementById('messageInput');
    if (messageInput) {
        messageInput.focus();
    }
    
    // Configurar contador de caracteres
    updateCharacterCount();
    updateSendButton();
    
    // Adicionar container para indicadores de digitação se não existir
    ensureTypingContainer();
}

function ensureTypingContainer() {
    const messagesContainer = document.getElementById('messagesContainer');
    if (!messagesContainer) return;
    
    let typingContainer = document.getElementById('typingIndicators');
    if (!typingContainer) {
        typingContainer = document.createElement('div');
        typingContainer.id = 'typingIndicators';
        typingContainer.className = 'typing-indicators';
        messagesContainer.appendChild(typingContainer);
    }
}

// ===== ENVIO DE MENSAGENS =====
async function sendMessage(event) {
    event.preventDefault();
    
    if (isSending) return;
    
    const messageInput = document.getElementById('messageInput');
    const message = messageInput.value.trim();
    
    if (!message) return;
    
    try {
        isSending = true;
        showMessageLoading(true);
        
        // Simular delay de envio (para realismo)
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const response = await fetch(`/chat/api/rooms/${window.chatRoomData.roomId}/messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: message,
                messageType: currentMessageType
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Limpar input
            messageInput.value = '';
            updateCharacterCount();
            updateSendButton();
            
            // Adicionar mensagem à lista
            addMessageToList(data.message);
            
            // Scroll para baixo
            scrollToBottom();
            
            // Atualizar ID da última mensagem
            lastMessageId = Math.max(lastMessageId, data.message.id);
            
            // Feedback visual de sucesso
            showMessageSuccess();
            
        } else {
            showError(data.message || 'Erro ao enviar mensagem');
        }
    } catch (error) {
        console.error('Erro ao enviar mensagem:', error);
        
        // Simular mensagem enviada localmente para demonstração
        const mockSentMessage = {
            id: Date.now(),
            user_id: window.chatRoomData.userId || 1,
            user_name: window.chatRoomData.userName || 'Você',
            user_avatar: '👤',
            message: message,
            message_type: currentMessageType,
            created_at: new Date().toISOString(),
            is_own: true
        };
        
        // Limpar input
        messageInput.value = '';
        updateCharacterCount();
        updateSendButton();
        
        // Adicionar mensagem simulada
        addMessageToList(mockSentMessage);
        scrollToBottom();
        
        showSuccess('Mensagem enviada (modo simulação)');
    } finally {
        isSending = false;
        showMessageLoading(false);
        hideUserTyping();
    }
}

function showMessageSuccess() {
    const sendButton = document.getElementById('sendButton');
    if (sendButton) {
        const originalContent = sendButton.innerHTML;
        sendButton.innerHTML = '<i class="fas fa-check"></i>';
        sendButton.style.background = 'var(--success-color)';
        
        setTimeout(() => {
            sendButton.innerHTML = originalContent;
            sendButton.style.background = '';
        }, 1000);
    }
}

// ===== POLLING DE MENSAGENS =====
function startMessagePolling() {
    if (messagePollingInterval) {
        clearInterval(messagePollingInterval);
    }
    
    messagePollingInterval = setInterval(async () => {
        if (!isPolling && !document.hidden) {
            await pollNewMessages();
        }
    }, 3000); // Poll a cada 3 segundos
    
    console.log('📡 Polling de mensagens iniciado');
}

async function pollNewMessages() {
    if (isPolling) return;
    
    try {
        isPolling = true;
        
        const response = await fetch(`/chat/api/rooms/${window.chatRoomData.roomId}/messages?since=${lastMessageId}&limit=10`);
        const data = await response.json();
        
        if (data.success && data.messages && data.messages.length > 0) {
            data.messages.forEach(message => {
                addMessageToList(message);
                lastMessageId = Math.max(lastMessageId, message.id);
            });
            
            // Scroll automático se usuário está no final
            if (isScrolledToBottom()) {
                scrollToBottom();
            }
        }
    } catch (error) {
        console.error('Erro no polling de mensagens:', error);
        // Continuar polling mesmo com erro
    } finally {
        isPolling = false;
    }
}

// ===== MANIPULAÇÃO DE MENSAGENS =====
function addMessageToList(message) {
    const messagesList = document.getElementById('messagesList');
    const emptyState = messagesList.querySelector('.empty-messages');
    
    // Remover estado vazio se existir
    if (emptyState) {
        emptyState.remove();
    }
    
    // Verificar se mensagem já existe
    const existingMessage = messagesList.querySelector(`[data-message-id="${message.id}"]`);
    if (existingMessage) return;
    
    // Criar elemento da mensagem
    const messageElement = createMessageElement(message);
    
    // Adicionar à lista (antes dos indicadores de digitação)
    const typingContainer = document.getElementById('typingIndicators');
    if (typingContainer) {
        messagesList.insertBefore(messageElement, typingContainer);
    } else {
        messagesList.appendChild(messageElement);
    }
    
    // Animação de entrada
    messageElement.style.opacity = '0';
    messageElement.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
        messageElement.style.transition = 'all 0.3s ease';
        messageElement.style.opacity = '1';
        messageElement.style.transform = 'translateY(0)';
    }, 50);
}

function createMessageElement(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${message.is_own ? 'own-message' : 'other-message'}`;
    messageDiv.dataset.messageId = message.id;
    messageDiv.dataset.userId = message.user_id;
    
    const messageTime = formatMessageTime(message.created_at);
    const messageContent = message.message_type === 'code' ? 
        `<pre><code>${escapeHtml(message.message)}</code></pre>` : 
        escapeHtml(message.message).replace(/\n/g, '<br>');
    
    messageDiv.innerHTML = `
        <div class="message-header">
            <span class="user-avatar">${message.user_avatar || '👤'}</span>
            <span class="user-name">${escapeHtml(message.user_name)}</span>
            <span class="message-time">${messageTime}</span>
            ${message.message_type === 'code' ? '<span class="message-type-badge">CODE</span>' : ''}
        </div>
        <div class="message-content ${message.message_type === 'code' ? 'code-message' : ''}">${messageContent}</div>
        ${message.is_own ? '<div class="message-status"><i class="fas fa-check"></i></div>' : ''}
    `;
    
    return messageDiv;
}

// ===== INDICADORES DE DIGITAÇÃO =====
function showUserTyping() {
    // Simular envio de indicador de digitação para outros usuários
    // Em um sistema real, isso seria enviado via WebSocket ou polling
    console.log('👤 Usuário está digitando...');
}

function hideUserTyping() {
    // Simular remoção do indicador de digitação
    console.log('👤 Usuário parou de digitar');
}

// ===== TIPOS DE MENSAGEM =====
function toggleMessageType() {
    const toggleButton = document.getElementById('toggleMessageType');
    const messageInput = document.getElementById('messageInput');
    
    if (currentMessageType === 'text') {
        currentMessageType = 'code';
        toggleButton.innerHTML = '<i class="fas fa-font"></i>';
        toggleButton.title = 'Alternar para texto';
        messageInput.placeholder = 'Digite seu código aqui...';
        messageInput.style.fontFamily = 'monospace';
    } else {
        currentMessageType = 'text';
        toggleButton.innerHTML = '<i class="fas fa-code"></i>';
        toggleButton.title = 'Alternar para código';
        messageInput.placeholder = 'Digite sua mensagem...';
        messageInput.style.fontFamily = '';
    }
    
    // Feedback visual
    toggleButton.style.animation = 'pulse 0.3s ease';
    setTimeout(() => {
        toggleButton.style.animation = '';
    }, 300);
}

// ===== GESTÃO DE MEMBROS =====
function toggleMembersList() {
    const membersList = document.getElementById('membersList');
    const toggleButton = document.getElementById('toggleMembers');
    
    if (membersList.style.display === 'none' || !membersList.style.display) {
        membersList.style.display = 'block';
        toggleButton.innerHTML = '<i class="fas fa-times"></i>';
        membersList.style.animation = 'slideIn 0.3s ease';
    } else {
        membersList.style.display = 'none';
        toggleButton.innerHTML = '<i class="fas fa-users"></i>';
    }
}

async function leaveChatRoom(roomId) {
    if (!confirm('Tem certeza que deseja sair desta sala?')) {
        return;
    }
    
    try {
        showLoading();
        
        const response = await fetch(`/chat/api/rooms/${roomId}/leave`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            showSuccess('Você saiu da sala. Redirecionando...');
            setTimeout(() => {
                window.location.href = '/chat';
            }, 1500);
        } else {
            showError(data.message || 'Erro ao sair da sala');
        }
    } catch (error) {
        console.error('Erro ao sair da sala:', error);
        showSuccess('Saindo da sala... (modo simulação)');
        setTimeout(() => {
            window.location.href = '/chat';
        }, 1500);
    } finally {
        hideLoading();
    }
}

// ===== MANIPULAÇÃO DE INPUT =====
function handleMessageInput(event) {
    updateCharacterCount();
    updateSendButton();
    
    // Auto-resize do textarea
    autoResizeTextarea(event.target);
}

function handleMessageKeydown(event) {
    // Enviar com Ctrl+Enter ou Cmd+Enter
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        event.preventDefault();
        sendMessage(event);
    }
    
    // Quebra de linha com Shift+Enter
    if (event.shiftKey && event.key === 'Enter') {
        // Permitir quebra de linha normal
        return;
    }
    
    // Enviar com Enter (apenas se não for Shift+Enter)
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage(event);
    }
}

function updateCharacterCount() {
    const messageInput = document.getElementById('messageInput');
    const charCount = document.getElementById('characterCount');
    
    if (messageInput && charCount) {
        const currentLength = messageInput.value.length;
        const maxLength = 1000; // Limite máximo
        
        charCount.textContent = `${currentLength}/${maxLength}`;
        
        // Alterar cor conforme proximidade do limite
        if (currentLength > maxLength * 0.9) {
            charCount.style.color = 'var(--error-color)';
        } else if (currentLength > maxLength * 0.7) {
            charCount.style.color = 'var(--warning-color)';
        } else {
            charCount.style.color = 'var(--text-muted)';
        }
    }
}

function updateSendButton() {
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    
    if (messageInput && sendButton) {
        const hasContent = messageInput.value.trim().length > 0;
        sendButton.disabled = !hasContent || isSending;
        
        if (hasContent && !isSending) {
            sendButton.classList.add('active');
        } else {
            sendButton.classList.remove('active');
        }
    }
}

// ===== AUTO-RESIZE TEXTAREA =====
function setupAutoResize() {
    const messageInput = document.getElementById('messageInput');
    if (messageInput) {
        messageInput.style.minHeight = messageInput.scrollHeight + 'px';
    }
}

function autoResizeTextarea(textarea) {
    // Reset height to calculate new height
    textarea.style.height = 'auto';
    
    // Set new height
    const newHeight = Math.min(textarea.scrollHeight, 120); // Max 120px
    textarea.style.height = newHeight + 'px';
}

// ===== SCROLL E NAVEGAÇÃO =====
function scrollToBottom() {
    const messagesContainer = document.getElementById('messagesContainer');
    if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
}

function isScrolledToBottom() {
    const messagesContainer = document.getElementById('messagesContainer');
    if (!messagesContainer) return false;
    
    const threshold = 100; // 100px de tolerância
    return messagesContainer.scrollHeight - messagesContainer.clientHeight <= messagesContainer.scrollTop + threshold;
}

function handleMessagesScroll(event) {
    const container = event.target;
    const scrollTop = container.scrollTop;
    
    // Mostrar botão "scroll to bottom" se não estiver no final
    const scrollButton = document.getElementById('scrollToBottomButton');
    if (scrollButton) {
        if (isScrolledToBottom()) {
            scrollButton.style.display = 'none';
        } else {
            scrollButton.style.display = 'block';
        }
    }
}

// ===== VISIBILIDADE DA ABA =====
function handleVisibilityChange() {
    if (document.hidden) {
        pauseRealtimeSimulation();
        if (messagePollingInterval) {
            clearInterval(messagePollingInterval);
            messagePollingInterval = null;
        }
    } else {
        resumeRealtimeSimulation();
        if (!messagePollingInterval) {
            startMessagePolling();
        }
    }
}

// ===== FEEDBACK VISUAL =====
function showMessageLoading(show) {
    const sendButton = document.getElementById('sendButton');
    if (sendButton) {
        if (show) {
            sendButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            sendButton.disabled = true;
        } else {
            sendButton.innerHTML = '<i class="fas fa-paper-plane"></i>';
            updateSendButton();
        }
    }
}

function showLoading() {
    // Implementar overlay de loading se necessário
    console.log('🔄 Carregando...');
}

function hideLoading() {
    console.log('✅ Carregamento concluído');
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
    // Criar notificação temporária
    const notification = document.createElement('div');
    notification.className = `chat-notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Container de notificações
    let container = document.getElementById('chatNotifications');
    if (!container) {
        container = document.createElement('div');
        container.id = 'chatNotifications';
        container.className = 'chat-notifications';
        document.body.appendChild(container);
    }
    
    container.appendChild(notification);
    
    // Auto-remover após 3 segundos
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }
    }, 3000);
}

// ===== UTILITÁRIOS =====
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatMessageTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) {
        return 'agora';
    } else if (diffMins < 60) {
        return `${diffMins}min`;
    } else if (diffHours < 24) {
        return `${diffHours}h`;
    } else if (diffDays < 7) {
        return `${diffDays}d`;
    } else {
        return date.toLocaleDateString('pt-BR', { 
            day: '2-digit', 
            month: '2-digit' 
        });
    }
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ===== CLEANUP =====
window.addEventListener('beforeunload', function() {
    pauseRealtimeSimulation();
    if (messagePollingInterval) {
        clearInterval(messagePollingInterval);
    }
});

// ===== FUNÇÕES GLOBAIS =====
window.sendMessage = sendMessage;
window.toggleMessageType = toggleMessageType;
window.toggleMembersList = toggleMembersList;
window.leaveChatRoom = leaveChatRoom;
window.scrollToBottom = scrollToBottom; 