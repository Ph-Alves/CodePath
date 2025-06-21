/**
 * Rotas para Área do Usuário - CodePath
 * Fase 25 - Funcionalidades Interativas Pendentes
 */

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');

// ===== MIDDLEWARES =====
// Todas as rotas requerem autenticação
router.use(authMiddleware.requireAuth);

// ===== ROTAS DA INTERFACE =====

/**
 * GET /my-area
 * Página principal da área do usuário
 */
router.get('/my-area', userController.showMyArea);

/**
 * GET /test-user
 * Rota de teste simples
 */
router.get('/test-user', (req, res) => {
    res.send(`
        <html>
            <head><title>Teste User Routes</title></head>
            <body style="font-family: Arial; padding: 20px;">
                <h1>🧪 Teste - Rotas do Usuário</h1>
                <p>Se você está vendo esta mensagem, as rotas do usuário estão funcionando!</p>
                <p>Sessão: ${req.session?.user ? 'Autenticado' : 'Não autenticado'}</p>
                <p>User ID: ${req.session?.user?.id || 'N/A'}</p>
                <p><a href="/my-area">Ir para Minha Área</a></p>
                <p><a href="/dashboard">Voltar ao Dashboard</a></p>
            </body>
        </html>
    `);
});

// ===== ROTAS DA API =====

/**
 * GET /api/user/my-area-data
 * API para obter dados da área do usuário
 */
router.get('/api/user/my-area-data', userController.getMyAreaData);

/**
 * POST /api/user/update-profile
 * API para atualizar perfil do usuário
 */
router.post('/api/user/update-profile', userController.updateProfile);

module.exports = router; 