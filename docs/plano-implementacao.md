# Plano de Implementação - CodePath

**Data de Criação:** 28 de Janeiro de 2025  
**Status:** Documento de Planejamento  
**Objetivo:** Roadmap para completar funcionalidades faltantes

---

## 🎯 **Resumo Executivo**

O projeto CodePath possui uma **base sólida** com 11 fases implementadas, mas necessita de **9 fases adicionais** para funcionamento completo. O foco deve ser nas **correções críticas** primeiro, seguidas por **funcionalidades essenciais**.

### 📊 **Status Atual**
- ✅ **11 fases concluídas** (estrutura e interface)
- 🔴 **1 fase crítica** (correções urgentes)
- 🟡 **7 fases importantes** (funcionalidades core)
- 🟢 **2 fases futuras** (melhorias)

---

## 🚨 **FASE CRÍTICA - PRIORIDADE MÁXIMA**

### **Fase 12: Correções de Banco e Estrutura** 
**⏱️ Tempo: 2-3 horas | 🔴 Crítica | 🎯 Deve ser feita PRIMEIRO**

#### **Problemas a Resolver:**
1. **Tabela `notifications` não existe no banco**
   - Erro: `SQLITE_ERROR: no such table: notifications`
   - Impacto: Sistema de notificações completamente quebrado

2. **Queries usam coluna `l.title` mas tabela tem `l.name`**
   - Erro: `SQLITE_ERROR: no such column: l.title`
   - Impacto: Página de progresso não carrega

3. **Inconsistência entre schema.sql e banco real**
   - Problema: Código assume estrutura que não existe
   - Impacto: Várias funcionalidades falham

#### **Tarefas Específicas:**
```bash
# 1. Backup do banco atual
cp db/codepath.db db/codepath_backup.db

# 2. Recriar banco com schema completo
sqlite3 db/codepath.db < db/schema.sql
sqlite3 db/codepath.db < db/seed.sql

# 3. Corrigir queries nos models
```

#### **Arquivos a Modificar:**
- `models/progressModel.js` - Linha ~125: `l.title` → `l.name`
- `models/quizModel.js` - Verificar queries obsoletas
- Validar todos os models que usam `notifications`

#### **Critério de Sucesso:**
- ✅ Página de progresso carrega sem erros
- ✅ Sistema de notificações funciona
- ✅ Não há erros de SQL nos logs

---

## 🟡 **FASES IMPORTANTES - SEMANA 1**

### **Fase 13: Sistema de Progresso Real**
**⏱️ Tempo: 4-6 horas | 🟡 Alta Prioridade**

**Objetivo:** Transformar progresso estático em sistema funcional

**Tarefas Principais:**
1. Criar botão "Marcar como Assistida" nas aulas
2. Implementar cálculo automático de progresso
3. Registrar timestamps reais de atividades
4. Atualizar métricas automaticamente

**Arquivos a Criar/Modificar:**
- `controllers/contentController.js` - Endpoint para marcar progresso
- `views/pages/lesson-view.mustache` - Botão de conclusão
- `public/js/content.js` - JavaScript para AJAX

**APIs Necessárias:**
- `POST /content/lesson/:id/complete`
- `GET /content/lesson/:id/status`

---

### **Fase 14: Sistema de XP e Gamificação**
**⏱️ Tempo: 3-4 horas | 🟡 Alta Prioridade**

**Objetivo:** Implementar lógica real de XP e níveis

**Sistema de Pontuação:**
- 🎯 Aula assistida: +50 XP
- 🧠 Quiz completado: +100 XP  
- 🏆 Pacote concluído: +500 XP
- 📅 Login diário: +10 XP

**Tarefas Principais:**
1. Criar modelo de XP com cálculos
2. Middleware para ganho automático
3. Notificações de subida de nível
4. Atualizar barra de progresso no dashboard

**Arquivos a Criar:**
- `models/xpModel.js`
- `middleware/xpMiddleware.js`
- `views/partials/xp-notification.mustache`

---

## 🟡 **FASES IMPORTANTES - SEMANA 2**

### **Fase 15: Navegação e Fluxo de Aulas**
**⏱️ Tempo: 2-3 horas | 🟡 Média Prioridade**

**Objetivo:** Implementar navegação funcional entre aulas

**Funcionalidades:**
- Botões "Próxima/Anterior" funcionais
- Sistema de pré-requisitos
- Redirecionamento automático

### **Fase 16: Sistema de Notificações Funcional**
**⏱️ Tempo: 2-3 horas | 🟡 Média Prioridade**

**Objetivo:** Integrar notificações com ações do usuário

**Funcionalidades:**
- Notificações automáticas por eventos
- Templates personalizados
- Polling em tempo real

### **Fase 17: Sistema de Conquistas e Streak**
**⏱️ Tempo: 3-4 horas | 🟡 Média Prioridade**

**Objetivo:** Implementar gamificação avançada

**Conquistas Planejadas:**
- 🎯 Primeira aula assistida
- 🔥 Streak de 7 dias
- 🧠 10 quizzes completados
- 📚 Primeiro pacote concluído

### **Fase 18: Validação e Segurança**
**⏱️ Tempo: 2-3 horas | 🟡 Média Prioridade**

**Objetivo:** Fortalecer segurança e validação

**Funcionalidades:**
- Validação completa de inputs
- Sanitização de dados
- Proteção CSRF
- Limpeza automática de sessões

---

## 🟢 **FASES FUTURAS - MELHORIAS**

### **Fase 19: UX/UI Melhorias**
**⏱️ Tempo: 4-5 horas | 🟢 Baixa Prioridade**

- Estados de loading
- Animações melhoradas
- Micro-interações

### **Fase 20: Performance e Otimização**
**⏱️ Tempo: 3-4 horas | 🟢 Baixa Prioridade**

- Cache inteligente
- Otimização de queries
- Compressão de assets

---

## 📅 **Cronograma Recomendado**

### **Dia 1: Correções Críticas**
- ⏰ **2-3 horas:** Fase 12 (Correções de Banco)
- 🎯 **Objetivo:** Sistema funcionando sem erros

### **Semana 1: Funcionalidades Core**
- 📅 **Dia 2-3:** Fase 13 (Progresso Real)
- 📅 **Dia 4-5:** Fase 14 (XP e Gamificação)

### **Semana 2: Funcionalidades Avançadas**
- 📅 **Dia 1:** Fase 15 (Navegação)
- 📅 **Dia 2:** Fase 16 (Notificações)
- 📅 **Dia 3-4:** Fase 17 (Conquistas)
- 📅 **Dia 5:** Fase 18 (Segurança)

### **Semana 3: Refinamentos (Opcional)**
- 📅 **Dia 1-3:** Fase 19 (UX/UI)
- 📅 **Dia 4-5:** Fase 20 (Performance)

---

## 🛠️ **Checklist por Fase**

### **Antes de Começar Qualquer Fase:**
- [ ] Fazer backup do banco de dados
- [ ] Criar branch específica para a fase
- [ ] Ler documentação da fase completa
- [ ] Preparar ambiente de teste

### **Durante a Implementação:**
- [ ] Seguir critérios técnicos estabelecidos
- [ ] Testar cada funcionalidade implementada
- [ ] Manter código comentado e limpo
- [ ] Validar responsividade

### **Antes de Concluir a Fase:**
- [ ] Todos os critérios de sucesso atendidos
- [ ] Não há erros nos logs
- [ ] Interface responsiva funcionando
- [ ] Documentação atualizada
- [ ] Commit com mensagem clara

---

## 🎯 **Critérios de Sucesso Globais**

### **Após Fase 12 (Crítica):**
- ✅ Sistema carrega sem erros de SQL
- ✅ Todas as páginas acessíveis
- ✅ Notificações funcionando

### **Após Fases 13-14 (Core):**
- ✅ Progresso atualiza automaticamente
- ✅ XP é ganho ao completar atividades
- ✅ Dashboard mostra dados reais

### **Após Fases 15-18 (Avançadas):**
- ✅ Navegação fluida entre aulas
- ✅ Sistema de conquistas operacional
- ✅ Segurança robusta implementada

### **Após Fases 19-20 (Melhorias):**
- ✅ UX polida e profissional
- ✅ Performance otimizada
- ✅ Sistema pronto para produção

---

## 📞 **Suporte e Recursos**

### **Documentação de Referência:**
- `docs/arquitetura.md` - Estrutura do projeto
- `docs/db-schema.md` - Esquema do banco
- `docs/rotas.md` - APIs disponíveis
- `docs/casos-de-uso.md` - Fluxos do usuário

### **Ferramentas de Debug:**
- Logs do servidor: Console do Node.js
- Banco de dados: SQLite Browser
- Frontend: DevTools do navegador
- Performance: `tests/performance-test.js`

### **Comandos Úteis:**
```bash
# Iniciar servidor
npm start

# Verificar banco
sqlite3 db/codepath.db ".tables"

# Backup
cp db/codepath.db db/backup_$(date +%Y%m%d).db

# Logs em tempo real
tail -f logs/app.log
```

---

**Documento mantido por:** Equipe de Desenvolvimento CodePath  
**Próxima Revisão:** Após cada fase concluída  
**Versão:** 1.0 