/**
 * Model de Chat - CodePath
 * Gerencia operações de banco de dados para sistema de chat e comunidade
 * 
 * Funcionalidades:
 * - Salas de chat por tecnologia
 * - Mensagens em tempo real
 * - Sistema de moderação
 * - Histórico de conversas
 * - Grupos de estudo
 */

const { getDatabase } = require('./databaseConnection');

/**
 * Criar nova sala de chat
 * @param {Object} roomData - Dados da sala
 * @returns {Object} Sala criada
 */
const createChatRoom = async (roomData) => {
    const { name, description, technology, type, createdBy, maxUsers } = roomData;
    const db = await getDatabase();
    
    const query = `
        INSERT INTO chat_rooms (name, description, technology, type, created_by, max_users, created_at)
        VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
    `;
    
    try {
        const result = await db.run(query, [name, description, technology, type, createdBy, maxUsers]);
        
        // Retornar a sala criada
        const createdRoom = await db.get(`
            SELECT cr.*, u.name as creator_name 
            FROM chat_rooms cr
            JOIN users u ON cr.created_by = u.id
            WHERE cr.id = ?
        `, [result.lastID]);
        
        return createdRoom;
    } catch (error) {
        console.error('Erro ao criar sala de chat:', error);
        throw error;
    }
};

/**
 * Buscar salas de chat disponíveis
 * @param {string} technology - Tecnologia específica (opcional)
 * @param {number} userId - ID do usuário para verificar participação
 * @returns {Array} Lista de salas
 */
const getChatRooms = async (technology = null, userId = null) => {
    const db = await getDatabase();
    
    let query = `
        SELECT 
            cr.*,
            u.name as creator_name,
            COUNT(DISTINCT crm.user_id) as member_count,
            CASE WHEN crm_user.user_id IS NOT NULL THEN 1 ELSE 0 END as is_member,
            (SELECT COUNT(*) FROM chat_messages cm WHERE cm.room_id = cr.id AND cm.created_at > datetime('now', '-1 hour')) as recent_messages
        FROM chat_rooms cr
        JOIN users u ON cr.created_by = u.id
        LEFT JOIN chat_room_members crm ON cr.id = crm.room_id
        LEFT JOIN chat_room_members crm_user ON cr.id = crm_user.room_id AND crm_user.user_id = ?
        WHERE cr.is_active = 1
    `;
    
    const params = [userId];
    
    if (technology) {
        query += ` AND cr.technology = ?`;
        params.push(technology);
    }
    
    query += `
        GROUP BY cr.id
        ORDER BY recent_messages DESC, cr.created_at DESC
    `;
    
    try {
        return await db.all(query, params);
    } catch (error) {
        console.error('Erro ao buscar salas de chat:', error);
        throw error;
    }
};

/**
 * Entrar em uma sala de chat
 * @param {number} roomId - ID da sala
 * @param {number} userId - ID do usuário
 * @returns {boolean} Sucesso da operação
 */
const joinChatRoom = async (roomId, userId) => {
    const db = await getDatabase();
    
    try {
        // Verificar se a sala existe e tem vagas
        const room = await db.get(`
            SELECT cr.*, COUNT(crm.user_id) as current_members 
            FROM chat_rooms cr
            LEFT JOIN chat_room_members crm ON cr.id = crm.room_id
            WHERE cr.id = ? AND cr.is_active = 1
            GROUP BY cr.id
        `, [roomId]);
        
        if (!room) {
            throw new Error('Sala não encontrada');
        }
        
        if (room.current_members >= room.max_users) {
            throw new Error('Sala lotada');
        }
        
        // Verificar se já é membro
        const existingMember = await db.get(`
            SELECT * FROM chat_room_members 
            WHERE room_id = ? AND user_id = ?
        `, [roomId, userId]);
        
        if (existingMember) {
            return true; // Já é membro
        }
        
        // Adicionar como membro
        await db.run(`
            INSERT INTO chat_room_members (room_id, user_id, joined_at)
            VALUES (?, ?, datetime('now'))
        `, [roomId, userId]);
        
        return true;
    } catch (error) {
        console.error('Erro ao entrar na sala:', error);
        throw error;
    }
};

/**
 * Sair de uma sala de chat
 * @param {number} roomId - ID da sala
 * @param {number} userId - ID do usuário
 * @returns {boolean} Sucesso da operação
 */
const leaveChatRoom = async (roomId, userId) => {
    const db = await getDatabase();
    
    const query = `
        DELETE FROM chat_room_members 
        WHERE room_id = ? AND user_id = ?
    `;
    
    try {
        const result = await db.run(query, [roomId, userId]);
        return result.changes > 0;
    } catch (error) {
        console.error('Erro ao sair da sala:', error);
        throw error;
    }
};

/**
 * Enviar mensagem no chat
 * @param {Object} messageData - Dados da mensagem
 * @returns {Object} Mensagem criada
 */
const sendMessage = async (messageData) => {
    const { roomId, userId, message, messageType } = messageData;
    const db = await getDatabase();
    
    try {
        // Verificar se o usuário é membro da sala
        const membership = await db.get(`
            SELECT * FROM chat_room_members 
            WHERE room_id = ? AND user_id = ?
        `, [roomId, userId]);
        
        if (!membership) {
            throw new Error('Usuário não é membro desta sala');
        }
        
        // Inserir mensagem
        const result = await db.run(`
            INSERT INTO chat_messages (room_id, user_id, message, message_type, created_at)
            VALUES (?, ?, ?, ?, datetime('now'))
        `, [roomId, userId, message, messageType || 'text']);
        
        // Retornar mensagem com dados do usuário
        const createdMessage = await db.get(`
            SELECT cm.*, u.name as user_name, u.avatar_url
            FROM chat_messages cm
            JOIN users u ON cm.user_id = u.id
            WHERE cm.id = ?
        `, [result.lastID]);
        
        return createdMessage;
    } catch (error) {
        console.error('Erro ao enviar mensagem:', error);
        throw error;
    }
};

/**
 * Buscar mensagens de uma sala
 * @param {number} roomId - ID da sala
 * @param {number} limit - Limite de mensagens
 * @param {number} offset - Offset para paginação
 * @returns {Array} Lista de mensagens
 */
const getRoomMessages = async (roomId, limit = 50, offset = 0) => {
    const db = await getDatabase();
    
    const query = `
        SELECT 
            cm.*,
            u.name as user_name,
            u.avatar_url,
            CASE 
                WHEN datetime('now', '-5 minutes') < cm.created_at THEN 'Agora'
                WHEN datetime('now', '-1 hour') < cm.created_at THEN 'Há pouco'
                WHEN datetime('now', '-1 day') < cm.created_at THEN 'Hoje'
                ELSE strftime('%d/%m às %H:%M', cm.created_at)
            END as time_display
        FROM chat_messages cm
        JOIN users u ON cm.user_id = u.id
        WHERE cm.room_id = ? AND cm.is_deleted = 0
        ORDER BY cm.created_at DESC
        LIMIT ? OFFSET ?
    `;
    
    try {
        const messages = await db.all(query, [roomId, limit, offset]);
        return messages.reverse(); // Retornar em ordem cronológica
    } catch (error) {
        console.error('Erro ao buscar mensagens:', error);
        throw error;
    }
};

/**
 * Buscar membros de uma sala
 * @param {number} roomId - ID da sala
 * @returns {Array} Lista de membros
 */
const getRoomMembers = async (roomId) => {
    const db = await getDatabase();
    
    const query = `
        SELECT 
            u.id,
            u.name,
            u.avatar_url,
            u.level,
            crm.joined_at,
            CASE WHEN crm.is_moderator = 1 THEN 'moderator' ELSE 'member' END as role
        FROM chat_room_members crm
        JOIN users u ON crm.user_id = u.id
        WHERE crm.room_id = ?
        ORDER BY crm.is_moderator DESC, crm.joined_at ASC
    `;
    
    try {
        return await db.all(query, [roomId]);
    } catch (error) {
        console.error('Erro ao buscar membros da sala:', error);
        throw error;
    }
};

/**
 * Buscar salas do usuário
 * @param {number} userId - ID do usuário
 * @returns {Array} Lista de salas que o usuário participa
 */
const getUserRooms = async (userId) => {
    const db = await getDatabase();
    
    const query = `
        SELECT 
            cr.*,
            crm.joined_at,
            crm.is_moderator,
            COUNT(DISTINCT crm_all.user_id) as member_count,
            (SELECT COUNT(*) FROM chat_messages cm WHERE cm.room_id = cr.id AND cm.created_at > crm.last_read_at) as unread_count,
            (SELECT cm.message FROM chat_messages cm WHERE cm.room_id = cr.id ORDER BY cm.created_at DESC LIMIT 1) as last_message
        FROM chat_room_members crm
        JOIN chat_rooms cr ON crm.room_id = cr.id
        LEFT JOIN chat_room_members crm_all ON cr.id = crm_all.room_id
        WHERE crm.user_id = ? AND cr.is_active = 1
        GROUP BY cr.id
        ORDER BY cr.updated_at DESC
    `;
    
    try {
        return await db.all(query, [userId]);
    } catch (error) {
        console.error('Erro ao buscar salas do usuário:', error);
        throw error;
    }
};

/**
 * Criar grupo de estudo
 * @param {Object} groupData - Dados do grupo
 * @returns {Object} Grupo criado
 */
const createStudyGroup = async (groupData) => {
    const { name, description, technology, schedule, createdBy, maxMembers } = groupData;
    const db = await getDatabase();
    
    try {
        // Criar sala de chat para o grupo
        const roomResult = await createChatRoom({
            name: `Grupo: ${name}`,
            description: `Grupo de estudo: ${description}`,
            technology,
            type: 'study_group',
            createdBy,
            maxUsers: maxMembers
        });
        
        // Criar entrada na tabela de grupos de estudo
        const groupResult = await db.run(`
            INSERT INTO study_groups (name, description, technology, schedule, created_by, chat_room_id, max_members, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
        `, [name, description, technology, schedule, createdBy, roomResult.id, maxMembers]);
        
        // Adicionar criador como membro e moderador
        await db.run(`
            UPDATE chat_room_members 
            SET is_moderator = 1 
            WHERE room_id = ? AND user_id = ?
        `, [roomResult.id, createdBy]);
        
        return {
            id: groupResult.lastID,
            chatRoomId: roomResult.id,
            ...groupData
        };
    } catch (error) {
        console.error('Erro ao criar grupo de estudo:', error);
        throw error;
    }
};

/**
 * Buscar grupos de estudo
 * @param {string} technology - Tecnologia específica (opcional)
 * @param {number} userId - ID do usuário
 * @returns {Array} Lista de grupos
 */
const getStudyGroups = async (technology = null, userId = null) => {
    const db = await getDatabase();
    
    let query = `
        SELECT 
            sg.*,
            u.name as creator_name,
            cr.id as chat_room_id,
            COUNT(DISTINCT crm.user_id) as member_count,
            CASE WHEN crm_user.user_id IS NOT NULL THEN 1 ELSE 0 END as is_member
        FROM study_groups sg
        JOIN users u ON sg.created_by = u.id
        JOIN chat_rooms cr ON sg.chat_room_id = cr.id
        LEFT JOIN chat_room_members crm ON cr.id = crm.room_id
        LEFT JOIN chat_room_members crm_user ON cr.id = crm_user.room_id AND crm_user.user_id = ?
        WHERE sg.is_active = 1
    `;
    
    const params = [userId];
    
    if (technology) {
        query += ` AND sg.technology = ?`;
        params.push(technology);
    }
    
    query += `
        GROUP BY sg.id
        ORDER BY sg.created_at DESC
    `;
    
    try {
        return await db.all(query, params);
    } catch (error) {
        console.error('Erro ao buscar grupos de estudo:', error);
        throw error;
    }
};

module.exports = {
    createChatRoom,
    getChatRooms,
    joinChatRoom,
    leaveChatRoom,
    sendMessage,
    getRoomMessages,
    getRoomMembers,
    getUserRooms,
    createStudyGroup,
    getStudyGroups
}; 