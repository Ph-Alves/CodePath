# Casos de Uso - CodePath

**Última Atualização:** 19 de Dezembro de 2024  
**Status:** Fases 1-4 implementadas  

## 📋 Resumo dos Casos de Uso

### ✅ Implementados
- **UC001** - Cadastro de Usuário
- **UC002** - Login de Usuário
- **UC003** - Logout de Usuário
- **UC004** - Visualizar Dashboard
- **UC005** - Navegação pela Interface

### ⏳ Planejados
- **UC006** - Selecionar Carreira
- **UC007** - Iniciar Pacote de Tecnologia
- **UC008** - Visualizar Conteúdo
- **UC009** - Responder Questionário
- **UC010** - Acompanhar Progresso

---

## ✅ Casos de Uso Implementados

### UC001 - Cadastro de Usuário

**Ator Principal:** Visitante  
**Objetivo:** Criar uma nova conta na plataforma CodePath  
**Status:** ✅ Implementado  

**Pré-condições:**
- Usuário não possui conta na plataforma
- Usuário acessa a página de cadastro

**Fluxo Principal:**
1. Usuário acessa `/register`
2. Sistema exibe formulário de cadastro
3. Usuário preenche:
   - Nome completo
   - Email
   - Senha
4. Usuário clica em "Cadastrar"
5. Sistema valida dados
6. Sistema criptografa senha
7. Sistema salva usuário no banco
8. Sistema cria sessão automática
9. Sistema redireciona para dashboard

**Fluxos Alternativos:**
- **3a.** Email já existe
  - Sistema exibe erro "Email já cadastrado"
  - Usuário corrige dados
- **3b.** Dados inválidos
  - Sistema exibe mensagens de validação
  - Usuário corrige dados

**Pós-condições:**
- Usuário cadastrado no sistema
- Sessão criada
- Usuário redirecionado para dashboard

**Arquivos Envolvidos:**
- `views/pages/register.mustache`
- `controllers/authController.js` (processRegister)
- `models/userModel.js`

---

### UC002 - Login de Usuário

**Ator Principal:** Usuário Cadastrado  
**Objetivo:** Acessar a plataforma com credenciais  
**Status:** ✅ Implementado  

**Pré-condições:**
- Usuário possui conta na plataforma
- Usuário não está logado

**Fluxo Principal:**
1. Usuário acessa `/login`
2. Sistema exibe formulário de login
3. Usuário preenche:
   - Email
   - Senha
4. Usuário clica em "Entrar"
5. Sistema valida credenciais
6. Sistema cria sessão
7. Sistema redireciona para dashboard

**Fluxos Alternativos:**
- **5a.** Credenciais inválidas
  - Sistema exibe erro "Email ou senha incorretos"
  - Usuário tenta novamente

**Pós-condições:**
- Usuário autenticado
- Sessão ativa
- Acesso ao dashboard

**Arquivos Envolvidos:**
- `views/pages/login.mustache`
- `controllers/authController.js` (processLogin)
- `public/css/login.css`

---

### UC003 - Logout de Usuário

**Ator Principal:** Usuário Logado  
**Objetivo:** Sair da plataforma  
**Status:** ✅ Implementado  

**Pré-condições:**
- Usuário está logado
- Usuário possui sessão ativa

**Fluxo Principal:**
1. Usuário clica em "Sair" na sidebar
2. Sistema destrói sessão
3. Sistema redireciona para login

**Pós-condições:**
- Sessão destruída
- Usuário redirecionado para login

**Arquivos Envolvidos:**
- `views/partials/sidebar.mustache`
- `controllers/authController.js` (logout)

---

### UC004 - Visualizar Dashboard

**Ator Principal:** Usuário Logado  
**Objetivo:** Visualizar informações pessoais e progresso  
**Status:** ✅ Implementado  

**Pré-condições:**
- Usuário está logado
- Usuário acessa `/dashboard`

**Fluxo Principal:**
1. Sistema verifica autenticação
2. Sistema carrega dados do usuário
3. Sistema carrega métricas (mockadas)
4. Sistema carrega pacotes em progresso
5. Sistema carrega atividade recente
6. Sistema exibe dashboard completo

**Informações Exibidas:**
- **Boas-vindas:** "Bem-vindo de volta, [Nome]!"
- **Progresso do usuário:** Nível, XP, streak
- **Métricas:** Aulas, cursos, desafios, questionários
- **Continue Estudando:** Pacotes em progresso
- **Atividade Recente:** Últimas ações
- **Ações Rápidas:** Botões de navegação

**Pós-condições:**
- Dashboard exibido com dados atualizados
- Usuário pode navegar para outras seções

**Arquivos Envolvidos:**
- `views/pages/dashboard.mustache`
- `views/layouts/main.mustache`
- `controllers/authController.js` (showDashboard)
- `public/css/dashboard.css`
- `public/js/dashboard.js`

---

### UC005 - Navegação pela Interface

**Ator Principal:** Usuário Logado  
**Objetivo:** Navegar entre seções da plataforma  
**Status:** ✅ Implementado  

**Pré-condições:**
- Usuário está logado
- Interface carregada

**Componentes de Navegação:**

#### Sidebar
- **Dashboard:** Página principal
- **Carreiras:** Pacotes de tecnologia (planejado)
- **Minha Área:** Perfil pessoal (planejado)
- **Desempenho:** Estatísticas (planejado)
- **Configurações:** Ajustes da conta (planejado)

#### Header/Topbar
- **Breadcrumb:** Navegação contextual
- **Notificações:** Sistema de alertas (estrutura)
- **Menu do Usuário:** Perfil e logout

#### Funcionalidades Responsivas
- **Mobile:** Toggle de sidebar
- **Tablet/Desktop:** Sidebar fixa
- **Dropdowns:** Notificações e menu do usuário

**Arquivos Envolvidos:**
- `views/partials/sidebar.mustache`
- `views/partials/header.mustache`
- `public/js/main.js`
- `public/css/global.css`
- `public/css/responsive.css`

---

## ⏳ Casos de Uso Planejados

### UC006 - Selecionar Carreira

**Ator Principal:** Usuário Logado  
**Objetivo:** Escolher carreira profissional desejada  
**Status:** ⏳ Planejado (Fase 6)  

**Pré-condições:**
- Usuário está logado
- Usuário acessa seção de carreiras

**Fluxo Principal:**
1. Usuário acessa `/careers`
2. Sistema exibe pacotes disponíveis:
   - Linguagem C
   - Front-end (HTML/CSS)
   - Python
   - Java
   - Back-end (JavaScript)
   - C#
3. Usuário seleciona pacote desejado
4. Sistema exibe detalhes do pacote
5. Usuário clica em "Começar" ou "Continuar"
6. Sistema registra escolha
7. Sistema redireciona para conteúdo

**Informações dos Pacotes:**
- Nome e descrição
- Número de aulas
- Duração estimada
- Nível de dificuldade
- Progresso atual (se iniciado)

---

### UC007 - Iniciar Pacote de Tecnologia

**Ator Principal:** Usuário Logado  
**Objetivo:** Começar estudos em uma tecnologia específica  
**Status:** ⏳ Planejado (Fase 6)  

**Pré-condições:**
- Usuário selecionou carreira
- Pacote disponível

**Fluxo Principal:**
1. Sistema cria registro de progresso
2. Sistema marca primeira aula como disponível
3. Sistema atualiza dashboard
4. Sistema redireciona para primeira aula

---

### UC008 - Visualizar Conteúdo

**Ator Principal:** Usuário Logado  
**Objetivo:** Estudar material educacional  
**Status:** ⏳ Planejado (Fase 7)  

**Pré-condições:**
- Usuário iniciou pacote
- Conteúdo disponível

**Fluxo Principal:**
1. Usuário acessa conteúdo
2. Sistema exibe material
3. Usuário estuda conteúdo
4. Usuário marca como concluído
5. Sistema atualiza progresso
6. Sistema libera próximo conteúdo

---

### UC009 - Responder Questionário

**Ator Principal:** Usuário Logado  
**Objetivo:** Avaliar conhecimento adquirido  
**Status:** ⏳ Planejado (Fase 8)  

**Pré-condições:**
- Usuário completou conteúdos relacionados
- Questionário disponível

**Fluxo Principal:**
1. Sistema exibe questionário
2. Usuário responde questões
3. Usuário submete respostas
4. Sistema calcula nota
5. Sistema exibe resultado
6. Sistema atualiza progresso

**Tipos de Questões:**
- Múltipla escolha
- Código para digitação
- Verdadeiro/falso
- Preenchimento de lacunas

---

### UC010 - Acompanhar Progresso

**Ator Principal:** Usuário Logado  
**Objetivo:** Visualizar estatísticas e evolução  
**Status:** ⏳ Planejado (Fase 9)  

**Pré-condições:**
- Usuário possui atividades registradas
- Dados de progresso disponíveis

**Fluxo Principal:**
1. Usuário acessa `/performance`
2. Sistema calcula estatísticas
3. Sistema exibe gráficos e métricas:
   - Progresso por pacote
   - Tempo de estudo
   - Notas dos questionários
   - Streak de dias
   - Comparação com outros usuários

---

## 🎯 Cenários de Teste

### Cenário 1: Primeiro Acesso
**Situação:** Usuário novo acessando a plataforma  
**Passos:**
1. Acessa site pela primeira vez
2. Clica em "Cadastre-se"
3. Preenche formulário
4. Confirma cadastro
5. É redirecionado para dashboard
6. Explora interface

**Resultado Esperado:** Usuário cadastrado e familiarizado com a interface

### Cenário 2: Uso Diário
**Situação:** Usuário retornando para continuar estudos  
**Passos:**
1. Faz login
2. Visualiza dashboard
3. Clica em "Continuar" em pacote em progresso
4. Estuda conteúdo
5. Responde questionário
6. Verifica progresso

**Resultado Esperado:** Progresso atualizado e usuário engajado

### Cenário 3: Exploração de Carreiras
**Situação:** Usuário explorando diferentes tecnologias  
**Passos:**
1. Acessa seção de carreiras
2. Compara pacotes disponíveis
3. Lê descrições e requisitos
4. Seleciona novo pacote
5. Inicia estudos

**Resultado Esperado:** Usuário encontra tecnologia de interesse

---

## 📊 Métricas de Sucesso

### Cadastro e Autenticação
- **Taxa de conversão:** Visitantes → Usuários cadastrados
- **Taxa de retenção:** Usuários que retornam após cadastro
- **Tempo de cadastro:** Duração do processo

### Engajamento
- **Sessões por usuário:** Frequência de acesso
- **Tempo por sessão:** Duração média de uso
- **Páginas por sessão:** Navegação na plataforma

### Aprendizado
- **Pacotes iniciados:** Quantos usuários começam estudos
- **Taxa de conclusão:** Usuários que completam pacotes
- **Progresso médio:** Avanço típico dos usuários

### Interface
- **Taxa de clique:** Elementos mais utilizados
- **Tempo de carregamento:** Performance das páginas
- **Erros de interface:** Problemas reportados

---

## 🔄 Fluxos de Integração

### Fluxo Completo do Usuário
```
Visitante → Cadastro → Login → Dashboard → 
Carreiras → Pacote → Conteúdo → Questionário → 
Progresso → Certificado
```

### Fluxo de Dados
```
Frontend → Controller → Model → Database → 
Model → Controller → Template → Frontend
```

### Fluxo de Sessão
```
Login → Criar Sessão → Middleware Auth → 
Rotas Protegidas → Logout → Destruir Sessão
```

---

## 🚀 Roadmap de Implementação

### Fase 5 - Dashboard Funcional
- [ ] UC006 - Métricas reais do usuário
- [ ] UC010 - Progresso básico
- [ ] Integração com banco de dados

### Fase 6 - Sistema de Carreiras
- [ ] UC006 - Selecionar Carreira
- [ ] UC007 - Iniciar Pacote
- [ ] Interface de pacotes

### Fase 7 - Conteúdos
- [ ] UC008 - Visualizar Conteúdo
- [ ] Sistema de navegação entre aulas
- [ ] Marcação de progresso

### Fase 8 - Questionários
- [ ] UC009 - Responder Questionário
- [ ] Interface de questões
- [ ] Sistema de avaliação

### Fase 9 - Progresso Avançado
- [ ] UC010 - Acompanhar Progresso (completo)
- [ ] Gráficos e estatísticas
- [ ] Comparações e rankings

---

## 📝 Observações Técnicas

### Dados Mockados (Atual)
- Métricas do dashboard são estáticas
- Pacotes em progresso são exemplos
- Atividade recente é simulada

### Integração Futura
- Dados reais do banco SQLite
- Cálculos dinâmicos de progresso
- Sincronização em tempo real

### Performance
- Carregamento otimizado de dados
- Cache de informações frequentes
- Paginação para listas grandes

---

**Documento mantido por:** Equipe de Desenvolvimento CodePath  
**Próxima Atualização:** Após implementação da Fase 5  
**Referência:** Baseado em funcionalidades implementadas e planejadas 