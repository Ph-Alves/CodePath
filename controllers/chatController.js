/**
 * Controller de Chat - CodePath
 * Gerencia funcionalidades de chat e comunidade
 * 
 * Funcionalidades:
 * - Salas de chat por tecnologia
 * - Mensagens em tempo real
 * - Grupos de estudo
 * - Moderação de conteúdo
 * - Simulação de dados para demonstração
 */

const chatModel = require('../models/chatModel');

/**
 * Exibir página principal do chat
 */
const showChatPage = async (req, res) => {
    try {
        const userId = req.session.user.id;
        
        // Buscar salas do usuário
        const userRooms = await chatModel.getUserRooms(userId);
        
        // Buscar salas públicas disponíveis
        const publicRooms = await chatModel.getChatRooms(null, userId);
        
        // Buscar grupos de estudo
        const studyGroups = await chatModel.getStudyGroups(null, userId);
        
        // Tecnologias disponíveis para filtro
        const technologies = ['C', 'Python', 'Java', 'JavaScript', 'HTML/CSS', 'C#'];
        
        // Adicionar dados simulados para melhor experiência
        const enhancedPublicRooms = enhanceRoomsWithMockData(publicRooms);
        const enhancedStudyGroups = enhanceGroupsWithMockData(studyGroups);
        
        res.render('pages/chat', {
            user: req.session.user,
            userRooms: userRooms,
            publicRooms: enhancedPublicRooms,
            studyGroups: enhancedStudyGroups,
            technologies: technologies,
            title: 'Chat - CodePath',
            // Dados para simulação no frontend
            mockData: {
                totalUsers: 127,
                onlineUsers: 43,
                activeRooms: enhancedPublicRooms.length,
                totalMessages: 2847
            }
        });
    } catch (error) {
        console.error('Erro ao carregar página de chat:', error);
        res.status(500).render('pages/error', {
            message: 'Erro interno do servidor',
            user: req.session.user
        });
    }
};

/**
 * Exibir sala de chat específica
 */
const showChatRoom = async (req, res) => {
    try {
        const roomId = parseInt(req.params.roomId);
        const userId = req.session.user.id;
        
        // Verificar se o usuário é membro da sala
        const userRooms = await chatModel.getUserRooms(userId);
        const userRoom = userRooms.find(room => room.id === roomId);
        
        if (!userRoom) {
            return res.status(403).render('pages/error', {
                message: 'Você não tem acesso a esta sala',
                user: req.session.user
            });
        }
        
        // Buscar mensagens recentes
        const messages = await chatModel.getRoomMessages(roomId, 50, 0);
        
        // Buscar membros da sala
        const members = await chatModel.getRoomMembers(roomId);
        
        // Adicionar dados simulados para mensagens
        const enhancedMessages = enhanceMessagesWithMockData(messages, userId);
        const enhancedMembers = enhanceMembersWithMockData(members);
        
        res.render('pages/chat-room', {
            user: req.session.user,
            room: userRoom,
            messages: enhancedMessages,
            members: enhancedMembers,
            title: `${userRoom.name} - Chat`,
            // Dados para simulação no frontend
            chatRoomData: {
                roomId: roomId,
                userId: userId,
                userName: req.session.user.name,
                userAvatar: req.session.user.avatar || '👤'
            }
        });
    } catch (error) {
        console.error('Erro ao carregar sala de chat:', error);
        res.status(500).render('pages/error', {
            message: 'Erro interno do servidor',
            user: req.session.user
        });
    }
};

/**
 * API: Buscar salas de chat
 */
const getChatRooms = async (req, res) => {
    try {
        const { technology } = req.query;
        const userId = req.session.user.id;
        
        const rooms = await chatModel.getChatRooms(technology, userId);
        
        // Adicionar dados simulados
        const enhancedRooms = enhanceRoomsWithMockData(rooms);
        
        res.json({
            success: true,
            rooms: enhancedRooms,
            stats: {
                total: enhancedRooms.length,
                technology: technology || 'Todas',
                timestamp: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('Erro ao buscar salas:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar salas'
        });
    }
};

/**
 * API: Criar nova sala de chat
 */
const createChatRoom = async (req, res) => {
    try {
        const { name, description, technology, type, maxUsers } = req.body;
        const userId = req.session.user.id;
        
        // Validações básicas
        if (!name || !description || !technology) {
            return res.status(400).json({
                success: false,
                message: 'Nome, descrição e tecnologia são obrigatórios'
            });
        }
        
        // Validações adicionais
        if (name.trim().length < 3) {
            return res.status(400).json({
                success: false,
                message: 'Nome deve ter pelo menos 3 caracteres'
            });
        }
        
        if (description.trim().length < 10) {
            return res.status(400).json({
                success: false,
                message: 'Descrição deve ter pelo menos 10 caracteres'
            });
        }
        
        const roomData = {
            name: name.trim(),
            description: description.trim(),
            technology,
            type: type || 'public',
            createdBy: userId,
            maxUsers: maxUsers || 50
        };
        
        const newRoom = await chatModel.createChatRoom(roomData);
        
        // Adicionar criador como membro
        await chatModel.joinChatRoom(newRoom.id, userId);
        
        // Adicionar dados simulados para a nova sala
        const enhancedRoom = enhanceRoomWithMockData(newRoom);
        
        res.json({
            success: true,
            message: 'Sala criada com sucesso',
            room: enhancedRoom
        });
    } catch (error) {
        console.error('Erro ao criar sala:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao criar sala'
        });
    }
};

/**
 * API: Entrar em sala de chat
 */
const joinChatRoom = async (req, res) => {
    try {
        const roomId = parseInt(req.params.roomId);
        const userId = req.session.user.id;
        
        const success = await chatModel.joinChatRoom(roomId, userId);
        
        if (success) {
            res.json({
                success: true,
                message: 'Entrou na sala com sucesso',
                timestamp: new Date().toISOString()
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'Não foi possível entrar na sala'
            });
        }
    } catch (error) {
        console.error('Erro ao entrar na sala:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Erro ao entrar na sala'
        });
    }
};

/**
 * API: Sair de sala de chat
 */
const leaveChatRoom = async (req, res) => {
    try {
        const roomId = parseInt(req.params.roomId);
        const userId = req.session.user.id;
        
        const success = await chatModel.leaveChatRoom(roomId, userId);
        
        if (success) {
            res.json({
                success: true,
                message: 'Saiu da sala com sucesso',
                timestamp: new Date().toISOString()
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'Não foi possível sair da sala'
            });
        }
    } catch (error) {
        console.error('Erro ao sair da sala:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao sair da sala'
        });
    }
};

/**
 * API: Enviar mensagem
 */
const sendMessage = async (req, res) => {
    try {
        const roomId = parseInt(req.params.roomId);
        const userId = req.session.user.id;
        const { message, messageType } = req.body;
        
        // Validações
        if (!message || message.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Mensagem não pode estar vazia'
            });
        }
        
        if (message.trim().length > 1000) {
            return res.status(400).json({
                success: false,
                message: 'Mensagem muito longa (máximo 1000 caracteres)'
            });
        }
        
        // Verificar se usuário é membro da sala
        const userRooms = await chatModel.getUserRooms(userId);
        const isRoomMember = userRooms.some(room => room.id === roomId);
        
        if (!isRoomMember) {
            return res.status(403).json({
                success: false,
                message: 'Você não tem permissão para enviar mensagens nesta sala'
            });
        }
        
        const messageData = {
            roomId,
            userId,
            message: message.trim(),
            messageType: messageType || 'text'
        };
        
        const newMessage = await chatModel.sendMessage(messageData);
        
        // Adicionar dados do usuário à mensagem
        const enhancedMessage = {
            ...newMessage,
            user_name: req.session.user.name,
            user_avatar: req.session.user.avatar || '👤',
            is_own: true
        };
        
        res.json({
            success: true,
            message: enhancedMessage,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Erro ao enviar mensagem:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao enviar mensagem'
        });
    }
};

/**
 * API: Buscar mensagens da sala
 */
const getRoomMessages = async (req, res) => {
    try {
        const roomId = parseInt(req.params.roomId);
        const { since, limit } = req.query;
        const userId = req.session.user.id;
        
        // Verificar se usuário é membro da sala
        const userRooms = await chatModel.getUserRooms(userId);
        const isRoomMember = userRooms.some(room => room.id === roomId);
        
        if (!isRoomMember) {
            return res.status(403).json({
                success: false,
                message: 'Você não tem permissão para ver mensagens desta sala'
            });
        }
        
        const messages = await chatModel.getRoomMessages(
            roomId, 
            parseInt(limit) || 50, 
            parseInt(since) || 0
        );
        
        // Adicionar dados simulados para demonstração
        const enhancedMessages = enhanceMessagesWithMockData(messages, userId);
        
        res.json({
            success: true,
            messages: enhancedMessages,
            stats: {
                count: enhancedMessages.length,
                since: since || 0,
                timestamp: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('Erro ao buscar mensagens:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar mensagens'
        });
    }
};

/**
 * API: Buscar membros da sala
 */
const getRoomMembers = async (req, res) => {
    try {
        const roomId = parseInt(req.params.roomId);
        const userId = req.session.user.id;
        
        // Verificar se usuário é membro da sala
        const userRooms = await chatModel.getUserRooms(userId);
        const isRoomMember = userRooms.some(room => room.id === roomId);
        
        if (!isRoomMember) {
            return res.status(403).json({
                success: false,
                message: 'Você não tem permissão para ver membros desta sala'
            });
        }
        
        const members = await chatModel.getRoomMembers(roomId);
        const enhancedMembers = enhanceMembersWithMockData(members);
        
        res.json({
            success: true,
            members: enhancedMembers,
            stats: {
                total: enhancedMembers.length,
                online: enhancedMembers.filter(m => m.status === 'online').length,
                timestamp: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('Erro ao buscar membros:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar membros'
        });
    }
};

/**
 * Exibir grupos de estudo
 */
const showStudyGroups = async (req, res) => {
    try {
        const userId = req.session.user.id;
        const { technology } = req.query;
        
        const studyGroups = await chatModel.getStudyGroups(technology, userId);
        const enhancedGroups = enhanceGroupsWithMockData(studyGroups);
        
        res.render('pages/study-groups', {
            user: req.session.user,
            studyGroups: enhancedGroups,
            selectedTechnology: technology,
            title: 'Grupos de Estudo - CodePath'
        });
    } catch (error) {
        console.error('Erro ao carregar grupos de estudo:', error);
        res.status(500).render('pages/error', {
            message: 'Erro interno do servidor',
            user: req.session.user
        });
    }
};

/**
 * API: Criar grupo de estudos
 */
const createStudyGroup = async (req, res) => {
    try {
        const { name, description, technology, schedule, maxMembers } = req.body;
        const userId = req.session.user.id;
        
        // Validações
        if (!name || !description || !technology || !schedule) {
            return res.status(400).json({
                success: false,
                message: 'Todos os campos são obrigatórios'
            });
        }
        
        if (name.trim().length < 3) {
            return res.status(400).json({
                success: false,
                message: 'Nome deve ter pelo menos 3 caracteres'
            });
        }
        
        const groupData = {
            name: name.trim(),
            description: description.trim(),
            technology,
            schedule: schedule.trim(),
            createdBy: userId,
            maxMembers: maxMembers || 10
        };
        
        const newGroup = await chatModel.createStudyGroup(groupData);
        
        // Adicionar criador como membro
        await chatModel.joinStudyGroup(newGroup.id, userId);
        
        res.json({
            success: true,
            message: 'Grupo de estudos criado com sucesso',
            group: newGroup
        });
    } catch (error) {
        console.error('Erro ao criar grupo de estudos:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao criar grupo de estudos'
        });
    }
};

/**
 * API: Buscar grupos de estudo
 */
const getStudyGroups = async (req, res) => {
    try {
        const { technology } = req.query;
        const userId = req.session.user.id;
        
        const groups = await chatModel.getStudyGroups(technology, userId);
        const enhancedGroups = enhanceGroupsWithMockData(groups);
        
        res.json({
            success: true,
            groups: enhancedGroups,
            stats: {
                total: enhancedGroups.length,
                technology: technology || 'Todas',
                timestamp: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('Erro ao buscar grupos de estudo:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar grupos de estudo'
        });
    }
};

/**
 * API: Entrar em grupo de estudos
 */
const joinStudyGroup = async (req, res) => {
    try {
        const groupId = parseInt(req.params.groupId);
        const userId = req.session.user.id;
        
        const success = await chatModel.joinStudyGroup(groupId, userId);
        
        if (success) {
            res.json({
                success: true,
                message: 'Entrou no grupo de estudos com sucesso',
                timestamp: new Date().toISOString()
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'Não foi possível entrar no grupo'
            });
        }
    } catch (error) {
        console.error('Erro ao entrar no grupo:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Erro ao entrar no grupo'
        });
    }
};

// ===== FUNÇÕES AUXILIARES PARA DADOS SIMULADOS =====

/**
 * Adicionar dados simulados às salas para melhor experiência
 */
function enhanceRoomsWithMockData(rooms) {
    const avatars = ['👩‍💻', '👨‍💻', '👩‍🎓', '👨‍🎓', '👩‍💼', '👨‍💼', '👩‍🔬', '👨‍🔬'];
    
    return rooms.map(room => ({
        ...room,
        recent_messages: room.recent_messages || Math.floor(Math.random() * 25) + 5,
        member_count: room.member_count || Math.floor(Math.random() * 20) + 3,
        creator_avatar: avatars[Math.floor(Math.random() * avatars.length)],
        last_activity: new Date(Date.now() - Math.random() * 3600000).toISOString(), // Última hora
        activity_level: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low'
    }));
}

/**
 * Adicionar dados simulados a uma sala específica
 */
function enhanceRoomWithMockData(room) {
    const avatars = ['👩‍💻', '👨‍💻', '👩‍🎓', '👨‍🎓'];
    
    return {
        ...room,
        recent_messages: 0,
        member_count: 1,
        creator_avatar: avatars[Math.floor(Math.random() * avatars.length)],
        last_activity: new Date().toISOString(),
        activity_level: 'low'
    };
}

/**
 * Adicionar dados simulados às mensagens
 */
function enhanceMessagesWithMockData(messages, currentUserId) {
    const avatars = ['👩‍💻', '👨‍💻', '👩‍🎓', '👨‍🎓', '👩‍💼', '👨‍💼'];
    
    return messages.map(message => ({
        ...message,
        user_avatar: message.user_avatar || avatars[Math.floor(Math.random() * avatars.length)],
        is_own: message.user_id === currentUserId,
        message_type: message.message_type || 'text'
    }));
}

/**
 * Adicionar dados simulados aos membros
 */
function enhanceMembersWithMockData(members) {
    const avatars = ['👩‍💻', '👨‍💻', '👩‍🎓', '👨‍🎓', '👩‍💼', '👨‍💼'];
    const statuses = ['online', 'away', 'online', 'online']; // Mais chances de estar online
    
    return members.map(member => ({
        ...member,
        avatar: member.avatar || avatars[Math.floor(Math.random() * avatars.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        last_seen: new Date(Date.now() - Math.random() * 7200000).toISOString() // Últimas 2 horas
    }));
}

/**
 * Adicionar dados simulados aos grupos de estudo
 */
function enhanceGroupsWithMockData(groups) {
    return groups.map(group => ({
        ...group,
        member_count: group.member_count || Math.floor(Math.random() * 8) + 2,
        next_meeting: new Date(Date.now() + Math.random() * 604800000).toISOString(), // Próxima semana
        activity_score: Math.floor(Math.random() * 100) + 1
    }));
}

module.exports = {
    showChatPage,
    showChatRoom,
    getChatRooms,
    createChatRoom,
    joinChatRoom,
    leaveChatRoom,
    sendMessage,
    getRoomMessages,
    getRoomMembers,
    showStudyGroups,
    createStudyGroup,
    getStudyGroups,
    joinStudyGroup
}; 