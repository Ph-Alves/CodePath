# 🚀 CodePath

> **Descubra o seu caminho na tecnologia**  
> Trilhas de estudo pensadas pra onde você quer ir!

## 📋 Sobre o Projeto

O **CodePath** é uma plataforma web educacional moderna, desenvolvida para jovens que desejam descobrir e trilhar seu caminho na área de tecnologia. Com um design atrativo em tons de roxo e interface intuitiva, a plataforma oferece pacotes de estudo organizados por tecnologias e perfis profissionais.

## ✨ Funcionalidades Principais

- **🎯 Pacotes de Tecnologia**: C, Front-end (HTML/CSS), Python, Java, Back-end (JS), C#
- **👥 Perfis Profissionais**: Desenvolvedor de Software, Gestor de Projeto, Analista de Suporte, Administrador de Banco de Dados, Segurança da Informação
- **📊 Dashboard Personalizado**: Acompanhamento de progresso com métricas detalhadas
- **🧩 Sistema de Questionários**: Interface interativa para prática de código
- **🎮 Gamificação**: Sistema de XP, streak de dias e conquistas
- **📱 Design Responsivo**: Interface adaptável para desktop e mobile

## 🛠️ Tecnologias Utilizadas

- **Backend**: Node.js, Express.js
- **Template Engine**: Mustache
- **Banco de Dados**: SQLite
- **Frontend**: HTML5, CSS3, JavaScript
- **Autenticação**: Sessions + bcrypt
- **Outras**: express-session, express-validator, dotenv

## 🚀 Instalação e Execução

### Pré-requisitos
- Node.js >= 16.0.0
- npm ou yarn

### Passos para instalação

1. **Clone o repositório**
   ```bash
   git clone <url-do-repositorio>
   cd codepath
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente**
   ```bash
   cp .env.example .env
   # Edite o arquivo .env conforme necessário
   ```

4. **Execute o servidor**
   ```bash
   # Desenvolvimento (com nodemon)
   npm run dev
   
   # Produção
   npm start
   ```

5. **Acesse a aplicação**
   ```
   http://localhost:4000              # Página principal com status do banco
   http://localhost:4000/test-db      # Página de teste com dados detalhados
   ```

## 📁 Estrutura do Projeto

```
CodePath/
├── app.js                 # Arquivo principal do servidor (✅ Configurado)
├── package.json           # Dependências e scripts (✅ Completo)
├── controllers/           # Lógica de controle das rotas
├── models/               # Acesso e manipulação de dados
│   └── database.js       # ✅ Classe Database SQLite configurada
├── routes/               # Definição de rotas modulares
├── views/                # Templates Mustache
│   ├── layouts/          # Layouts principais
│   ├── pages/            # Páginas da aplicação
│   └── partials/         # Componentes reutilizáveis
├── public/               # Arquivos estáticos
│   ├── css/              # Estilos CSS
│   ├── js/               # Scripts JavaScript
│   └── images/           # Imagens e ícones
├── db/                   # Banco de dados SQLite
│   ├── codepath.db       # ✅ Banco SQLite funcional
│   ├── schema.sql        # ✅ Esquema completo (6 tabelas)
│   └── seed.sql          # ✅ Dados iniciais (Carlos Pereira, pacotes, perfis)
├── middleware/           # Middlewares customizados
├── tests/                # Scripts de teste
└── docs/                 # Documentação do projeto
```

## 🎨 Design System

- **Paleta Principal**: Tons de roxo (#8B5CF6, #A855F7) com gradientes
- **Tipografia**: Fonte sans-serif moderna
- **Componentes**: Cards brancos com sombras, botões arredondados
- **Layout**: Sidebar fixa roxa, área principal com gradiente

## 📋 Status do Desenvolvimento

### ✅ Fase 1 - Estrutura Inicial (Completa)
- [x] Configuração do projeto e dependências
- [x] Servidor Express básico funcionando
- [x] Estrutura de pastas organizada
- [x] Arquivos de configuração (.env, .gitignore)

### ✅ Fase 2 - Configuração do Banco de Dados (Completa)
- [x] Conexão SQLite configurada e funcional
- [x] Esquema do banco implementado (6 tabelas)
- [x] Classe Database com métodos utilitários
- [x] Dados iniciais inseridos (Carlos Pereira, 6 pacotes, 6 perfis)
- [x] Rotas de teste para validação do banco
- [x] Integração completa com o servidor Express

### 🔄 Próximas Fases
- [ ] Fase 3: Sistema de Autenticação
- [ ] Fase 4: Layout Base e Navegação
- [ ] Fase 5: Dashboard Principal
- [ ] Fase 6: Sistema de Carreiras
- [ ] Fase 7: Sistema de Conteúdos
- [ ] Fase 8: Sistema de Questionários
- [ ] Fase 9: Sistema de Progresso
- [ ] Fase 10: Notificações e Melhorias de UX
- [ ] Fase 11: Testes e Documentação Final

## 🤝 Contribuição

Este projeto segue as melhores práticas de desenvolvimento:

- **Código Limpo**: Comentários explicativos e estrutura organizada
- **Modularidade**: Separação clara de responsabilidades
- **Documentação**: Documentação técnica completa
- **Testes**: Validação manual e automática

## 📝 Scripts Disponíveis

```bash
npm start          # Iniciar servidor em produção
npm run dev        # Iniciar servidor em desenvolvimento (nodemon)
npm run test:manual # Executar testes manuais automatizados
```

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

**CodePath** - Transformando o aprendizado em tecnologia através de uma experiência visual e educacional única.

*Versão atual: 1.2.0 (Fases 1-2 Implementadas)*  
*Última atualização: Dezembro 2024* 