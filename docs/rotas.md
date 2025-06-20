# Documentação de Rotas - CodePath

**Última Atualização:** 19 de Dezembro de 2024  
**Status:** Fases 1-4 implementadas  

## 📋 Resumo das Rotas

| Método | Rota | Status | Descrição | Fase |
|--------|------|--------|-----------|------|
| GET | `/` | ✅ | Página inicial (redireciona conforme autenticação) | 3 |
| GET | `/login` | ✅ | Tela de login | 3 |
| POST | `/login` | ✅ | Processar login | 3 |
| GET | `/register` | ✅ | Tela de cadastro | 3 |
| POST | `/register` | ✅ | Processar cadastro | 3 |
| POST | `/logout` | ✅ | Realizar logout | 3 |
| GET | `/dashboard` | ✅ | Dashboard principal do usuário | 4 |
| GET | `/careers` | ⏳ | Página de pacotes de tecnologia | 6 |
| GET | `/my-area` | ⏳ | Minha área do usuário | 5 |
| GET | `/performance` | ⏳ | Página de desempenho | 9 |
| GET | `/settings` | ⏳ | Configurações do usuário | 5 |

**Legenda:**
- ✅ Implementada e funcional
- ⏳ Planejada (próximas fases)
- ❌ Não implementada

---

## ✅ Rotas Implementadas

### Autenticação e Usuários

#### GET `/`
**Descrição:** Página inicial da aplicação  
**Status:** ✅ Implementada  
**Controlador:** `authController.redirectToLogin`  
**Middleware:** Nenhum  
**Comportamento:**
- Se usuário não autenticado: redireciona para `/login`
- Se usuário autenticado: redireciona para `/dashboard`

**Exemplo de Resposta:**
```
Status: 302 (Redirect)
Location: /login ou /dashboard
```

---

#### GET `/login`
**Descrição:** Exibe a tela de login  
**Status:** ✅ Implementada  
**Controlador:** `authController.showLogin`  
**Template:** `views/pages/login.mustache`  
**Middleware:** Nenhum  

**Comportamento:**
- Exibe formulário de login com design roxo/gradiente
- Inclui link para página de cadastro
- Mostra mensagens de erro se houver

**Template Data:**
```javascript
{
  title: 'Login - CodePath',
  error: null // ou mensagem de erro
}
```

**CSS:** `public/css/login.css`

---

#### POST `/login`
**Descrição:** Processa dados de login  
**Status:** ✅ Implementada  
**Controlador:** `authController.processLogin`  
**Middleware:** `express.urlencoded()`  

**Parâmetros do Body:**
```javascript
{
  email: String,    // Email do usuário
  password: String  // Senha do usuário
}
```

**Comportamento:**
- Valida credenciais no banco de dados
- Cria sessão se válido
- Redireciona para dashboard ou retorna erro

**Respostas:**
- **Sucesso:** Redirect 302 para `/dashboard`
- **Erro:** Render login com mensagem de erro

---

#### GET `/register`
**Descrição:** Exibe a tela de cadastro  
**Status:** ✅ Implementada  
**Controlador:** `authController.showRegister`  
**Template:** `views/pages/register.mustache`  

**Template Data:**
```javascript
{
  title: 'Cadastro - CodePath',
  error: null
}
```

---

#### POST `/register`
**Descrição:** Processa cadastro de novo usuário  
**Status:** ✅ Implementada  
**Controlador:** `authController.processRegister`  

**Parâmetros do Body:**
```javascript
{
  name: String,     // Nome completo
  email: String,    // Email único
  password: String  // Senha (será criptografada)
}
```

**Comportamento:**
- Valida dados de entrada
- Verifica se email já existe
- Criptografa senha com bcrypt
- Insere no banco de dados
- Cria sessão automática
- Redireciona para dashboard

---

#### POST `/logout`
**Descrição:** Realiza logout do usuário  
**Status:** ✅ Implementada  
**Controlador:** `authController.logout`  
**Middleware:** `requireAuth`  

**Comportamento:**
- Destroi sessão do usuário
- Redireciona para página de login

---

### Dashboard e Interface Principal

#### GET `/dashboard`
**Descrição:** Dashboard principal do usuário logado  
**Status:** ✅ Implementada  
**Controlador:** `authController.showDashboard`  
**Template:** `views/pages/dashboard.mustache`  
**Layout:** `views/layouts/main.mustache`  
**Middleware:** `requireAuth`  

**Template Data:**
```javascript
{
  title: 'Dashboard - CodePath',
  user: {
    name: 'Nome do Usuário',
    level: 3,
    xp: 1250,
    xpToNext: 1500,
    streak: 2
  },
  metrics: {
    lessons: 12,
    courses: 3,
    challenges: 8,
    quizzes: 15
  },
  packagesInProgress: [
    {
      name: 'Linguagem C',
      progress: 65,
      lessons: 8,
      totalLessons: 12,
      color: '#3B82F6'
    },
    {
      name: 'Python Básico',
      progress: 30,
      lessons: 3,
      totalLessons: 10,
      color: '#10B981'
    }
  ],
  recentActivity: [
    {
      type: 'lesson',
      title: 'Variáveis em C',
      time: 'há 2 horas',
      icon: 'play'
    },
    {
      type: 'quiz',
      title: 'Quiz: Estruturas de Dados',
      time: 'ontem',
      icon: 'check'
    }
  ]
}
```

**Funcionalidades:**
- ✅ Exibe métricas do usuário (dados mockados)
- ✅ Seção "Continue Estudando" com pacotes em progresso
- ✅ Atividade recente
- ✅ Cards de ações rápidas
- ✅ Modal de progresso (placeholder)
- ✅ Layout responsivo com sidebar

**CSS:** `public/css/dashboard.css`  
**JavaScript:** `public/js/dashboard.js`

---

## ⏳ Rotas Planejadas (Próximas Fases)

### Fase 5 - Dashboard e Métricas

#### GET `/my-area`
**Descrição:** Área pessoal do usuário  
**Status:** ⏳ Planejada  
**Funcionalidades Previstas:**
- Perfil do usuário
- Configurações pessoais
- Histórico de atividades
- Certificados conquistados

#### GET `/settings`
**Descrição:** Configurações da conta  
**Status:** ⏳ Planejada  
**Funcionalidades Previstas:**
- Alterar dados pessoais
- Trocar senha
- Preferências de notificação
- Configurações de privacidade

### Fase 6 - Sistema de Carreiras

#### GET `/careers`
**Descrição:** Página de pacotes de tecnologia  
**Status:** ⏳ Planejada  
**Funcionalidades Previstas:**
- Lista de pacotes (C, Python, Java, etc.)
- Filtros por categoria
- Detalhes de cada pacote
- Botão "Começar" ou "Continuar"

#### GET `/careers/packages/:package`
**Descrição:** Detalhes de um pacote específico  
**Status:** ⏳ Planejada  

#### POST `/careers/packages/:package/start`
**Descrição:** Iniciar um novo pacote  
**Status:** ⏳ Planejada  

#### GET `/career-profiles`
**Descrição:** Seleção de perfis profissionais  
**Status:** ⏳ Planejada  

### Fase 7 - Sistema de Conteúdos

#### GET `/content/:id`
**Descrição:** Visualizar conteúdo específico  
**Status:** ⏳ Planejada  

#### POST `/content/:id/complete`
**Descrição:** Marcar conteúdo como concluído  
**Status:** ⏳ Planejada  

### Fase 8 - Sistema de Questionários

#### GET `/quiz/:id`
**Descrição:** Exibir questionário  
**Status:** ⏳ Planejada  

#### POST `/quiz/:id/submit`
**Descrição:** Submeter respostas do questionário  
**Status:** ⏳ Planejada  

### Fase 9 - Sistema de Progresso

#### GET `/performance`
**Descrição:** Página de desempenho e estatísticas  
**Status:** ⏳ Planejada  
**Funcionalidades Previstas:**
- Gráficos de progresso
- Estatísticas detalhadas
- Comparação com outros usuários
- Metas e objetivos

#### GET `/api/progress/:package`
**Descrição:** API de dados de progresso  
**Status:** ⏳ Planejada  
**Formato:** JSON

---

## 🔧 Middleware Implementado

### `requireAuth`
**Localização:** `middleware/auth.js`  
**Descrição:** Verifica se usuário está autenticado  
**Uso:** Rotas protegidas que requerem login  

**Comportamento:**
- Verifica se existe sessão ativa
- Se não autenticado: redireciona para `/login`
- Se autenticado: continua para próximo middleware/controlador

**Exemplo de Uso:**
```javascript
app.get('/dashboard', requireAuth, authController.showDashboard);
```

---

## 📊 Estatísticas das Rotas

### Por Status
- **✅ Implementadas:** 7 rotas
- **⏳ Planejadas:** 12+ rotas
- **📈 Progresso:** ~37% das rotas principais

### Por Funcionalidade
- **Autenticação:** 6/6 rotas implementadas ✅
- **Dashboard:** 1/4 rotas implementadas (25%)
- **Carreiras:** 0/4 rotas implementadas (0%)
- **Conteúdos:** 0/3 rotas implementadas (0%)
- **Questionários:** 0/3 rotas implementadas (0%)
- **Progresso:** 0/2 rotas implementadas (0%)

---

## 🔍 Detalhes Técnicos

### Configuração do Express
```javascript
// app.js
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
  secret: 'codepath-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));
```

### Template Engine
- **Engine:** Mustache Express
- **Configuração:** `app.engine('mustache', mustacheExpress())`
- **View Engine:** `app.set('view engine', 'mustache')`
- **Views Directory:** `app.set('views', __dirname + '/views')`

### Arquivos Estáticos
- **Diretório:** `public/`
- **CSS:** `public/css/`
- **JavaScript:** `public/js/`
- **Imagens:** `public/images/`

---

## 🚀 Próximos Passos

### Imediato (Próxima Semana)
1. **Implementar rotas da Fase 5**
   - `/my-area`
   - `/settings`
   - APIs de métricas

2. **Refinar rotas existentes**
   - Melhorar validação de dados
   - Adicionar tratamento de erros
   - Otimizar queries do banco

### Médio Prazo (Próximas 2-4 semanas)
1. **Implementar Fase 6 - Carreiras**
   - `/careers` com listagem de pacotes
   - `/careers/packages/:package` para detalhes
   - Sistema de seleção de carreiras

2. **APIs e Integração**
   - Endpoints JSON para dados dinâmicos
   - Integração com dados reais do banco
   - Sistema de cache para performance

### Longo Prazo (1-3 meses)
1. **Completar todas as fases**
2. **Implementar APIs RESTful completas**
3. **Adicionar autenticação avançada (JWT)**
4. **Sistema de permissões e roles**

---

## 📝 Convenções de Nomenclatura

### Rotas
- **Substantivos no plural:** `/users`, `/careers`, `/contents`
- **Kebab-case:** `/career-profiles`, `/my-area`
- **Parâmetros com dois pontos:** `/quiz/:id`, `/content/:id`

### Controladores
- **camelCase:** `showDashboard`, `processLogin`
- **Verbos descritivos:** `show`, `process`, `create`, `update`, `delete`

### Templates
- **Kebab-case:** `dashboard.mustache`, `career-profiles.mustache`
- **Extensão:** `.mustache`
- **Organização:** `pages/` para páginas, `partials/` para componentes

---

**Documento mantido por:** Equipe de Desenvolvimento CodePath  
**Próxima Atualização:** Após implementação da Fase 5  
**Referência:** Baseado em `docs/projeto-codepath-completo.md` 