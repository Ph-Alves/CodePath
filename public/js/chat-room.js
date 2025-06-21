/**
 * JavaScript da Sala de Chat - CodePath
 * Funcionalidades específicas para salas de chat individuais
 * 
 * Funcionalidades:
 * - Envio de mensagens
 * - Polling de novas mensagens
 * - Gestão de membros
 * - Tipos de mensagem (texto/código)
 */

// ===== VARIÁVEIS GLOBAIS =====
let messagePollingInterval;
let currentMessageType = 'text';
let lastMessageId = 0;
let isPolling = false;
let isSending = false;

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Sala de Chat iniciada');
    
    // Configurar eventos
    setupEventListeners();
    
    // Inicializar funcionalidades
    initializeChatRoom();
    
    // Iniciar polling de mensagens
    startMessagePolling();
    
    // Configurar auto-resize do textarea
    setupAutoResize();
});

// ===== CONFIGURAÇÃO DE EVENTOS =====
function setupEventListeners() {
    const messageInput = document.getElementById('messageInput');
    const messageForm = document.getElementById('messageForm');
    
    // Monitorar input para habilitar/desabilitar botão
    messageInput.addEventListener('input', handleMessageInput);
    
    // Monitorar teclas para atalhos
    messageInput.addEventListener('keydown', handleMessageKeydown);
    
    // Scroll automático para novas mensagens
    const messagesContainer = document.getElementById('messagesContainer');
    if (messagesContainer) {
        messagesContainer.addEventListener('scroll', handleMessagesScroll);
    }
    
    // Detectar quando a aba perde/ganha foco para pausar polling
    document.addEventListener('visibilitychange', handleVisibilityChange);
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
            
        } else {
            showError(data.message || 'Erro ao enviar mensagem');
        }
    } catch (error) {
        console.error('Erro ao enviar mensagem:', error);
        showError('Erro de conexão');
    } finally {
        isSending = false;
        showMessageLoading(false);
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
    
    // Adicionar à lista
    messagesList.appendChild(messageElement);
    
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
    messageDiv.className = `message ${message.user_id === window.chatRoomData.userId ? 'own-message' : ''}`;
    messageDiv.dataset.messageId = message.id;
    
    const avatarHtml = message.avatar_url 
        ? `<img src="${message.avatar_url}" alt="${message.user_name}">`
        : `<div class="avatar-placeholder">${message.user_name.charAt(0)}</div>`;
    
    const messageContentHtml = message.message_type === 'code'
        ? `<pre><code>${escapeHtml(message.message)}</code></pre>`
        : escapeHtml(message.message);
    
    messageDiv.innerHTML = `
        <div class="message-avatar">
            ${avatarHtml}
        </div>
        <div class="message-content">
            <div class="message-header">
                <span class="message-author">${escapeHtml(message.user_name)}</span>
                <span class="message-time">${formatMessageTime(message.created_at)}</span>
            </div>
            <div class="message-text type-${message.message_type || 'text'}">
                ${messageContentHtml}
            </div>
        </div>
    `;
    
    return messageDiv;
}

// ===== TIPOS DE MENSAGEM =====
function toggleMessageType() {
    const typeIcon = document.getElementById('messageTypeIcon');
    const typeIndicator = document.getElementById('messageTypeIndicator');
    const messageInput = document.getElementById('messageInput');
    
    if (currentMessageType === 'text') {
        currentMessageType = 'code';
        typeIcon.className = 'fas fa-font';
        typeIndicator.textContent = 'Código';
        messageInput.placeholder = 'Digite seu código...';
        messageInput.style.fontFamily = 'monospace';
    } else {
        currentMessageType = 'text';
        typeIcon.className = 'fas fa-code';
        typeIndicator.textContent = 'Texto';
        messageInput.placeholder = 'Digite sua mensagem...';
        messageInput.style.fontFamily = '';
    }
}

// ===== GESTÃO DE MEMBROS =====
function toggleMembersList() {
    const sidebar = document.getElementById('membersSidebar');
    sidebar.classList.toggle('show');
}

async function leaveChatRoom(roomId) {
    if (!confirm('Tem certeza que deseja sair desta sala?')) return;
    
    try {
        const response = await fetch(`/chat/api/rooms/${roomId}/leave`, {
            method: 'POST'
        });
        
        const data = await response.json();
        
        if (data.success) {
            showSuccess('Você saiu da sala');
            setTimeout(() => {
                window.location.href = '/chat';
            }, 1000);
        } else {
            showError(data.message || 'Erro ao sair da sala');
        }
    } catch (error) {
        console.error('Erro ao sair da sala:', error);
        showError('Erro de conexão');
    }
}

// ===== MANIPULAÇÃO DE INPUT =====
function handleMessageInput(event) {
    updateCharacterCount();
    updateSendButton();
    autoResizeTextarea(event.target);
}

function handleMessageKeydown(event) {
    // Enter para enviar (Shift+Enter para nova linha)
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        document.getElementById('messageForm').dispatchEvent(new Event('submit'));
    }
    
    // Esc para limpar
    if (event.key === 'Escape') {
        event.target.value = '';
        updateCharacterCount();
        updateSendButton();
    }
}

function updateCharacterCount() {
    const messageInput = document.getElementById('messageInput');
    const characterCount = document.getElementById('characterCount');
    const currentLength = messageInput.value.length;
    
    characterCount.textContent = `${currentLength}/1000`;
    
    if (currentLength > 800) {
        characterCount.style.color = '#ef4444';
    } else if (currentLength > 600) {
        characterCount.style.color = '#f59e0b';
    } else {
        characterCount.style.color = '#6b7280';
    }
}

function updateSendButton() {
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    const hasText = messageInput.value.trim().length > 0;
    
    sendButton.disabled = !hasText || isSending;
    sendButton.style.opacity = hasText ? '1' : '0.5';
}

// ===== AUTO-RESIZE TEXTAREA =====
function setupAutoResize() {
    const messageInput = document.getElementById('messageInput');
    autoResizeTextarea(messageInput);
}

function autoResizeTextarea(textarea) {
    textarea.style.height = 'auto';
    const newHeight = Math.min(textarea.scrollHeight, 120); // Máximo 5 linhas
    textarea.style.height = newHeight + 'px';
}

// ===== SCROLL AUTOMÁTICO =====
function scrollToBottom() {
    const messagesContainer = document.getElementById('messagesContainer');
    if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
}

function isScrolledToBottom() {
    const container = document.getElementById('messagesContainer');
    if (!container) return true;
    
    const threshold = 50; // 50px de tolerância
    return container.scrollHeight - container.scrollTop - container.clientHeight < threshold;
}

function handleMessagesScroll(event) {
    // Implementar carregamento de mensagens antigas quando scroll chegar ao topo
    const container = event.target;
    if (container.scrollTop === 0) {
        // TODO: Carregar mensagens mais antigas
        console.log('🔄 Carregar mensagens antigas');
    }
}

// ===== VISIBILIDADE DA ABA =====
function handleVisibilityChange() {
    if (document.hidden) {
        console.log('⏸️ Pausando polling - aba oculta');
    } else {
        console.log('▶️ Retomando polling - aba visível');
        // Fazer polling imediato ao voltar
        setTimeout(pollNewMessages, 500);
    }
}

// ===== ESTADOS VISUAIS =====
function showMessageLoading(show) {
    const loadingState = document.getElementById('messageLoadingState');
    if (loadingState) {
        loadingState.classList.toggle('hidden', !show);
    }
}

function showSuccess(message) {
    console.log('✅', message);
    // TODO: Implementar toast de sucesso
}

function showError(message) {
    console.error('❌', message);
    // TODO: Implementar toast de erro
}

function showInfo(message) {
    console.log('ℹ️', message);
    // TODO: Implementar toast de info
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
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
        const minutes = Math.floor((now - date) / (1000 * 60));
        return minutes <= 1 ? 'agora' : `${minutes}min`;
    } else if (diffInHours < 24) {
        return `${Math.floor(diffInHours)}h`;
    } else {
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}

// ===== CLEANUP =====
window.addEventListener('beforeunload', function() {
    if (messagePollingInterval) {
        clearInterval(messagePollingInterval);
    }
}); 