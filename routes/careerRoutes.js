/**
 * CodePath - Rotas de Carreiras
 * 
 * Este arquivo define todas as rotas relacionadas a:
 * - Pacotes de tecnologia
 * - Perfis profissionais
 * - Progresso nos pacotes
 */

const express = require('express');
const router = express.Router();
const careerController = require('../controllers/careerController');

// ========================================
// PÁGINAS PRINCIPAIS
// ========================================

/**
 * Página de pacotes de tecnologia
 * Exibe todos os pacotes disponíveis (C, Python, Java, etc.)
 * com progresso do usuário
 */
router.get('/careers', careerController.showCareersPage);

/**
 * Página de perfis profissionais
 * Permite ao usuário selecionar seu perfil profissional
 * (Desenvolvedor, Gestor, Suporte, etc.)
 */
router.get('/career-profiles', careerController.showCareerProfilesPage);

/**
 * Página de detalhes de um pacote específico
 * Mostra informações completas do pacote e suas aulas
 */
router.get('/careers/package/:id', careerController.showPackageDetails);

// ========================================
// AÇÕES DE PROGRESSO
// ========================================

/**
 * Iniciar progresso em um pacote
 * Cria um novo registro de progresso para o usuário
 */
router.post('/careers/package/:id/start', careerController.startPackage);

/**
 * Continuar progresso em um pacote
 * Atualiza o pacote atual do usuário e redireciona para estudos
 */
router.post('/careers/package/:id/continue', careerController.continuePackage);

/**
 * Selecionar perfil profissional
 * Define o perfil profissional do usuário
 */
router.post('/career-profiles/select', careerController.selectCareerProfile);

// ========================================
// APIs PARA DADOS DINÂMICOS
// ========================================

/**
 * API para buscar dados de um pacote específico
 * Retorna JSON com dados do pacote e progresso do usuário
 */
router.get('/api/careers/package/:id', careerController.getPackageData);

// ========================================
// EXPORTAÇÃO
// ========================================

module.exports = router; 