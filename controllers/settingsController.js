/**
 * CodePath - Settings Controller
 * Fase 26 - Polish Final
 * 
 * Controlador para gerenciar configurações do usuário
 */

const userModel = require('../models/userModel');
const { getDatabase } = require('../models/database');
const bcrypt = require('bcrypt');

/**
 * Exibir página de configurações
 */
async function showSettings(req, res) {
    try {
        console.log('[SETTINGS] Carregando página de configurações...');
        
        const userId = req.session.user.id;
        
        // Buscar dados do usuário
        const user = await userModel.getUserById(userId);
        if (!user) {
            return res.redirect('/login');
        }
        
        // Buscar configurações do usuário
        const settings = await getUserSettings(userId);
        
        // Preparar dados para o template
        const templateData = {
            user: {
                name: user.name,
                email: user.email,
                birth_date: user.birth_date || '',
                education_level: user.education_level || ''
            },
            settings: settings,
            isSettingsPage: true,
            pageTitle: 'Configurações'
        };
        
        console.log('[SETTINGS] Página carregada com sucesso');
        res.render('pages/settings', templateData);
        
    } catch (error) {
        console.error('[SETTINGS] Erro ao carregar página:', error);
        res.status(500).render('pages/error', { 
            error: 'Erro ao carregar configurações',
            message: 'Tente novamente mais tarde'
        });
    }
}

/**
 * Atualizar perfil do usuário
 */
async function updateProfile(req, res) {
    try {
        console.log('[SETTINGS] Atualizando perfil do usuário...');
        
        const userId = req.session.user.id;
        const { name, email, birth_date, education_level } = req.body;
        
        // Validações básicas
        if (!name || !email) {
            return res.status(400).json({
                success: false,
                message: 'Nome e email são obrigatórios'
            });
        }
        
        // Verificar se email já existe (se mudou)
        const currentUser = await userModel.getUserById(userId);
        if (email !== currentUser.email) {
            const existingUser = await userModel.getUserByEmail(email);
            if (existingUser && existingUser.id !== userId) {
                return res.status(400).json({
                    success: false,
                    message: 'Este email já está em uso'
                });
            }
        }
        
        // Atualizar dados do usuário
        const db = getDatabase();
        await db.run(`
            UPDATE users 
            SET name = ?, email = ?, birth_date = ?, education_level = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `, [name, email, birth_date || null, education_level || null, userId]);
        
        // Atualizar sessão
        req.session.user.name = name;
        req.session.user.email = email;
        
        console.log('[SETTINGS] Perfil atualizado com sucesso');
        res.json({
            success: true,
            message: 'Perfil atualizado com sucesso!'
        });
        
    } catch (error) {
        console.error('[SETTINGS] Erro ao atualizar perfil:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
}

/**
 * Alterar senha do usuário
 */
async function changePassword(req, res) {
    try {
        console.log('[SETTINGS] Alterando senha do usuário...');
        
        const userId = req.session.user.id;
        const { current_password, new_password, confirm_password } = req.body;
        
        // Validações básicas
        if (!current_password || !new_password || !confirm_password) {
            return res.status(400).json({
                success: false,
                message: 'Todos os campos são obrigatórios'
            });
        }
        
        if (new_password !== confirm_password) {
            return res.status(400).json({
                success: false,
                message: 'Nova senha e confirmação não coincidem'
            });
        }
        
        if (new_password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Nova senha deve ter pelo menos 6 caracteres'
            });
        }
        
        // Verificar senha atual
        const user = await userModel.getUserById(userId);
        const isCurrentPasswordValid = await bcrypt.compare(current_password, user.password);
        
        if (!isCurrentPasswordValid) {
            return res.status(400).json({
                success: false,
                message: 'Senha atual incorreta'
            });
        }
        
        // Criptografar nova senha
        const hashedNewPassword = await bcrypt.hash(new_password, 10);
        
        // Atualizar senha no banco
        const db = getDatabase();
        await db.run(`
            UPDATE users 
            SET password = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `, [hashedNewPassword, userId]);
        
        console.log('[SETTINGS] Senha alterada com sucesso');
        res.json({
            success: true,
            message: 'Senha alterada com sucesso!'
        });
        
    } catch (error) {
        console.error('[SETTINGS] Erro ao alterar senha:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
}

/**
 * Salvar configurações do usuário
 */
async function saveSettings(req, res) {
    try {
        console.log('[SETTINGS] Salvando configurações do usuário...');
        
        const userId = req.session.user.id;
        const settingsData = req.body;
        
        // Criar ou atualizar configurações
        await saveUserSettings(userId, settingsData);
        
        console.log('[SETTINGS] Configurações salvas com sucesso');
        res.json({
            success: true,
            message: 'Configurações salvas com sucesso!'
        });
        
    } catch (error) {
        console.error('[SETTINGS] Erro ao salvar configurações:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
}

/**
 * Exportar dados do usuário
 */
async function exportUserData(req, res) {
    try {
        console.log('[SETTINGS] Exportando dados do usuário...');
        
        const userId = req.session.user.id;
        
        // Buscar todos os dados do usuário
        const userData = await getUserDataForExport(userId);
        
        // Configurar headers para download
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="codepath-dados-usuario-${userId}.json"`);
        
        console.log('[SETTINGS] Dados exportados com sucesso');
        res.json(userData);
        
    } catch (error) {
        console.error('[SETTINGS] Erro ao exportar dados:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao exportar dados'
        });
    }
}

/**
 * Buscar configurações do usuário
 */
async function getUserSettings(userId) {
    try {
        const db = getDatabase();
        
        // Verificar se a tabela user_settings existe
        const tableExists = await db.get(`
            SELECT name FROM sqlite_master 
            WHERE type='table' AND name='user_settings'
        `);
        
        if (!tableExists) {
            // Criar tabela se não existir
            await db.run(`
                CREATE TABLE IF NOT EXISTS user_settings (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    settings_json TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id)
                )
            `);
        }
        
        // Buscar configurações do banco
        const settings = await db.get(`
            SELECT settings_json FROM user_settings 
            WHERE user_id = ?
        `, [userId]);
        
        if (settings) {
            return JSON.parse(settings.settings_json);
        }
        
        // Retornar configurações padrão se não existir
        return getDefaultSettings();
        
    } catch (error) {
        console.error('[SETTINGS] Erro ao buscar configurações:', error);
        return getDefaultSettings();
    }
}

/**
 * Salvar configurações do usuário
 */
async function saveUserSettings(userId, settingsData) {
    try {
        const db = getDatabase();
        
        // Converter para JSON
        const settingsJson = JSON.stringify(settingsData);
        
        // Verificar se já existe configuração
        const existing = await db.get(`
            SELECT id FROM user_settings WHERE user_id = ?
        `, [userId]);
        
        if (existing) {
            // Atualizar existente
            await db.run(`
                UPDATE user_settings 
                SET settings_json = ?, updated_at = CURRENT_TIMESTAMP
                WHERE user_id = ?
            `, [settingsJson, userId]);
        } else {
            // Criar novo
            await db.run(`
                INSERT INTO user_settings (user_id, settings_json)
                VALUES (?, ?)
            `, [userId, settingsJson]);
        }
        
    } catch (error) {
        console.error('[SETTINGS] Erro ao salvar configurações:', error);
        throw error;
    }
}

/**
 * Buscar todos os dados do usuário para exportação
 */
async function getUserDataForExport(userId) {
    try {
        const db = getDatabase();
        
        // Dados básicos do usuário
        const user = await userModel.getUserById(userId);
        
        // Progresso do usuário
        const progress = await db.all(`
            SELECT * FROM user_progress WHERE user_id = ?
        `, [userId]);
        
        // Conquistas do usuário
        const achievements = await db.all(`
            SELECT ua.*, a.name, a.description 
            FROM user_achievements ua
            JOIN achievements a ON ua.achievement_id = a.id
            WHERE ua.user_id = ?
        `, [userId]);
        
        // Configurações do usuário
        const settings = await getUserSettings(userId);
        
        // Histórico de quizzes
        const quizHistory = await db.all(`
            SELECT * FROM user_quiz_answers WHERE user_id = ?
        `, [userId]);
        
        return {
            export_date: new Date().toISOString(),
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                level: user.level,
                total_xp: user.total_xp,
                created_at: user.created_at
            },
            progress: progress,
            achievements: achievements,
            settings: settings,
            quiz_history: quizHistory
        };
        
    } catch (error) {
        console.error('[SETTINGS] Erro ao buscar dados para exportação:', error);
        throw error;
    }
}

/**
 * Configurações padrão
 */
function getDefaultSettings() {
    return {
        email_notifications: true,
        achievement_alerts: true,
        study_reminders: true,
        progress_updates: true,
        theme_mode: 'light',
        font_size: 'medium',
        animations: true,
        profile_visibility: false,
        activity_sharing: true,
        study_goal: 60,
        difficulty_level: 'beginner',
        auto_advance: false
    };
}

module.exports = {
    showSettings,
    updateProfile,
    changePassword,
    saveSettings,
    exportUserData
}; 