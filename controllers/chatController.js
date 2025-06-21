/**
 * Controller de Chat - CodePath
 * Gerencia funcionalidades de chat e comunidade
 * 
 * Funcionalidades:
 * - Salas de chat por tecnologia
 * - Mensagens em tempo real
 * - Grupos de estudo
 * - Moderação de conteúdo
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
        
        res.render('pages/chat', {
            user: req.session.user,
            userRooms: userRooms,
            publicRooms: publicRooms,
            studyGroups: studyGroups,
            technologies: technologies,
            title: 'Chat - CodePath'
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
        
        res.render('pages/chat-room', {
            user: req.session.user,
            room: userRoom,
            messages: messages,
            members: members,
            title: `${userRoom.name} - Chat`
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
        
        res.json({
            success: true,
            rooms: rooms
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
        
        res.json({
            success: true,
            message: 'Sala criada com sucesso',
            room: newRoom
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
                message: 'Entrou na sala com sucesso'
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
                message: 'Saiu da sala com sucesso'
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
        const { message, messageType } = req.body;
        const userId = req.session.user.id;
        
        if (!message || message.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Mensagem não pode estar vazia'
            });
        }
        
        if (message.length > 1000) {
            return res.status(400).json({
                success: false,
                message: 'Mensagem muito longa (máximo 1000 caracteres)'
            });
        }
        
        const messageData = {
            roomId,
            userId,
            message: message.trim(),
            messageType: messageType || 'text'
        };
        
        const newMessage = await chatModel.sendMessage(messageData);
        
        res.json({
            success: true,
            message: newMessage
        });
    } catch (error) {
        console.error('Erro ao enviar mensagem:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Erro ao enviar mensagem'
        });
    }
};

/**
 * API: Buscar mensagens de uma sala
 */
const getRoomMessages = async (req, res) => {
    try {
        const roomId = parseInt(req.params.roomId);
        const { limit = 50, offset = 0 } = req.query;
        
        const messages = await chatModel.getRoomMessages(roomId, parseInt(limit), parseInt(offset));
        
        res.json({
            success: true,
            messages: messages
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
 * API: Buscar membros de uma sala
 */
const getRoomMembers = async (req, res) => {
    try {
        const roomId = parseInt(req.params.roomId);
        
        const members = await chatModel.getRoomMembers(roomId);
        
        res.json({
            success: true,
            members: members
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
 * Exibir página de grupos de estudo
 */
const showStudyGroups = async (req, res) => {
    try {
        const userId = req.session.user.id;
        const { technology } = req.query;
        
        // Buscar grupos de estudo
        const studyGroups = await chatModel.getStudyGroups(technology, userId);
        
        // Tecnologias disponíveis
        const technologies = ['C', 'Python', 'Java', 'JavaScript', 'HTML/CSS', 'C#'];
        
        res.render('pages/study-groups', {
            user: req.session.user,
            studyGroups: studyGroups,
            technologies: technologies,
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
 * API: Criar grupo de estudo
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
        
        const groupData = {
            name: name.trim(),
            description: description.trim(),
            technology,
            schedule,
            createdBy: userId,
            maxMembers: maxMembers || 10
        };
        
        const newGroup = await chatModel.createStudyGroup(groupData);
        
        res.json({
            success: true,
            message: 'Grupo de estudo criado com sucesso',
            group: newGroup
        });
    } catch (error) {
        console.error('Erro ao criar grupo de estudo:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao criar grupo de estudo'
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
        
        res.json({
            success: true,
            groups: groups
        });
    } catch (error) {
        console.error('Erro ao buscar grupos de estudo:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar grupos de estudo'
        });
    }
};

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
    getStudyGroups
}; 