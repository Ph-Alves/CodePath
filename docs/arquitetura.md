# 🏗️ Arquitetura do Projeto CodePath

## Visão Geral

O CodePath é uma aplicação web educacional construída com **Node.js**, **Express.js** e **SQLite**, seguindo o padrão **MVC (Model-View-Controller)** adaptado para templates **Mustache**. A arquitetura prioriza simplicidade, manutenibilidade e escalabilidade.

## 🎯 Princípios Arquiteturais

### 1. Separação de Responsabilidades
- **Models**: Acesso e manipulação de dados (SQLite)
- **Views**: Apresentação (Templates Mustache)
- **Controllers**: Lógica de negócio e fluxo de dados

### 2. Modularidade
- Arquivos organizados por funcionalidade
- Componentes reutilizáveis (partials)
- Middleware específicos para cada responsabilidade

### 3. Configuração Centralizada
- Variáveis de ambiente (.env)
- Configuração única do banco de dados
- Middleware globais no app.js

## 📁 Estrutura Implementada

```
CodePath/
├── 📄 app.js                          # ✅ Servidor principal configurado
├── 📄 package.json                    # ✅ Dependências e scripts
├── 📄 .env.example                    # ✅ Exemplo de configuração
├── 📄 .gitignore                      # ✅ Arquivos ignorados
├── 📄 README.md                       # ✅ Documentação principal
│
├── 📂 models/                         # ✅ Camada de Dados
│   └── 📄 database.js                 # ✅ Classe Database SQLite
│
├── 📂 db/                             # ✅ Banco de Dados
│   ├── 📄 codepath.db                 # ✅ Banco SQLite funcional
│   ├── 📄 schema.sql                  # ✅ Estrutura das tabelas
│   └── 📄 seed.sql                    # ✅ Dados iniciais
│
├── 📂 controllers/                    # 🔄 Lógica de Controle
├── 📂 routes/                         # 🔄 Definição de Rotas
├── 📂 middleware/                     # 🔄 Middlewares Customizados
│
├── 📂 views/                          # 🔄 Templates Mustache
│   ├── 📂 layouts/                    # Layout principal
│   ├── 📂 pages/                      # Páginas da aplicação
│   └── 📂 partials/                   # Componentes reutilizáveis
│
├── 📂 public/                         # 🔄 Arquivos Estáticos
│   ├── 📂 css/                        # Estilos CSS
│   ├── 📂 js/                         # Scripts JavaScript
│   └── 📂 images/                     # Imagens e ícones
│
├── 📂 tests/                          # 🔄 Scripts de Teste
└── 📂 docs/                           # ✅ Documentação
    ├── 📄 arquitetura.md              # ✅ Esta documentação
    └── 📄 db-schema.md                # ✅ Esquema do banco
```

**Legenda:**
- ✅ Implementado e funcional
- 🔄 Estrutura criada, aguardando implementação

## 🔧 Tecnologias e Dependências

### Backend Core
- **Node.js** (>=16.0.0) - Runtime JavaScript
- **Express.js** (^4.18.2) - Framework web
- **SQLite3** (^5.1.6) - Banco de dados

### Template Engine
- **Mustache-Express** (^1.3.2) - Templates sem lógica

### Segurança e Sessões
- **bcrypt** (^5.1.1) - Hash de senhas
- **express-session** (^1.17.3) - Gerenciamento de sessões

### Validação e Configuração
- **express-validator** (^7.0.1) - Validação de dados
- **dotenv** (^16.3.1) - Variáveis de ambiente
- **express-rate-limit** (^6.10.0) - Rate limiting

### Desenvolvimento
- **nodemon** (^3.0.1) - Auto-reload em desenvolvimento

## 🗄️ Camada de Dados

### Banco SQLite
```javascript
// Configuração centralizada em models/database.js
class Database {
  connect()     // Conecta ao SQLite
  initialize()  // Cria estrutura se necessário
  all()         // SELECT múltiplos resultados
  get()         // SELECT único resultado
  run()         // INSERT/UPDATE/DELETE
  close()       // Fecha conexão
}
```

### Estrutura de Tabelas
- **users** - Usuários e gamificação
- **packages** - Pacotes de tecnologia
- **career_profiles** - Perfis profissionais
- **lessons** - Aulas dos pacotes
- **quizzes** - Questionários de código
- **user_progress** - Progresso e métricas
- **user_sessions** - Sessões de autenticação

## 🌐 Camada de Apresentação

### Template Engine Mustache
```mustache
{{! Layout principal }}
{{> partials/header}}
<main>
  {{#user}}
    <h1>Bem-vindo de volta, {{name}}!</h1>
  {{/user}}
</main>
{{> partials/footer}}
```

### Organização de Views
- **layouts/main.mustache** - Layout base HTML5
- **pages/** - Páginas específicas da aplicação
- **partials/** - Componentes reutilizáveis

## 🎮 Sistema de Gamificação

### Elementos Implementados
```javascript
// Dados do usuário para gamificação
{
  level: 5,           // Nível do usuário
  xp_points: 1250,    // Pontos de experiência
  streak_days: 2,     // Dias consecutivos
  progress: {
    lessons_watched: 3,
    courses_completed: 1,
    challenges_delivered: 1,
    quizzes_completed: 2
  }
}
```

## 🔐 Segurança

### Configurações Implementadas
- **Foreign Keys** habilitadas no SQLite
- **Sessions** com cookies seguros
- **Rate Limiting** configurado
- **Sanitização** de dados de entrada

### Headers de Segurança
```javascript
// Configurados no app.js
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }
}));
```

## 📊 Fluxo de Dados

### Requisição HTTP
```
Cliente → Express → Middleware → Controller → Model → Database
                                     ↓
Cliente ← View ← Template ← Controller ← Model ← Database
```

### Exemplo Prático
```javascript
// 1. Rota (routes/dashboardRoutes.js)
app.get('/dashboard', dashboardController.index);

// 2. Controller (controllers/dashboardController.js)
const user = await userModel.findById(req.session.userId);
const progress = await progressModel.getUserProgress(req.session.userId);

// 3. Model (models/userModel.js)
return database.get('SELECT * FROM users WHERE id = ?', [id]);

// 4. View (views/pages/dashboard.mustache)
<h1>Bem-vindo de volta, {{user.name}}!</h1>
```

## 🔄 Middleware Pipeline

### Ordem de Execução
1. **express.urlencoded()** - Parse de formulários
2. **express.json()** - Parse de JSON
3. **express.static()** - Arquivos estáticos
4. **express-session** - Gerenciamento de sessões
5. **res.locals** - Dados globais para views
6. **Rotas específicas** - Controllers da aplicação
7. **404 Handler** - Páginas não encontradas
8. **Error Handler** - Tratamento de erros

## 🚀 Inicialização da Aplicação

### Sequência de Startup
```javascript
async function startServer() {
  1. Carregar variáveis de ambiente (.env)
  2. Inicializar banco de dados (database.connect())
  3. Verificar/criar estrutura (database.initialize())
  4. Configurar middleware do Express
  5. Registrar rotas da aplicação
  6. Iniciar servidor HTTP (app.listen())
}
```

## 📈 Performance

### Otimizações Implementadas
- **Índices de banco** para consultas frequentes
- **Conexão singleton** para SQLite
- **Middleware eficientes** sem processamento desnecessário
- **Arquivos estáticos** servidos diretamente pelo Express

### Métricas de Desenvolvimento
- **Startup time**: ~500ms
- **Database connection**: ~50ms
- **Memory usage**: ~30MB base

## 🧪 Ambiente de Desenvolvimento

### Scripts Disponíveis
```json
{
  "start": "node app.js",           // Produção
  "dev": "nodemon app.js",          // Desenvolvimento
  "test:manual": "node tests/manual-test.js"
}
```

### Rotas de Teste
- `GET /` - Status do servidor e banco
- `GET /test-db` - Dados detalhados do banco

## 📋 Próximas Implementações

### Fase 3 - Autenticação
- **authController.js** - Login/logout/registro
- **authRoutes.js** - Rotas de autenticação
- **auth.js middleware** - Verificação de sessões

### Fase 4 - Layout Base
- **main.mustache** - Layout principal com sidebar
- **partials/** - Header, footer, sidebar
- **global.css** - Estilos base do design roxo

### Fase 5 - Dashboard
- **dashboardController.js** - Métricas e progresso
- **dashboard.mustache** - Interface "Bem-vindo de volta"
- **Integração completa** com dados reais

## 🔍 Padrões de Código

### Nomenclatura
- **Arquivos**: camelCase (userController.js)
- **Variáveis**: camelCase (userName)
- **Constantes**: UPPER_CASE (DB_PATH)
- **Classes**: PascalCase (Database)

### Estrutura de Arquivos
```javascript
/**
 * Cabeçalho explicativo
 */

// Imports
const express = require('express');

// Configurações
const config = { ... };

// Implementação
class/function implementation

// Exports
module.exports = { ... };
```

---

**Versão:** 1.0.0  
**Última Atualização:** Dezembro 2024  
**Status:** ✅ Fases 1-2 Implementadas | 🔄 Fases 3-11 Planejadas 