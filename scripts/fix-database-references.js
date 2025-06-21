#!/usr/bin/env node

/**
 * Script para corrigir referências ao database nos models
 * 
 * Este script substitui todas as referências diretas ao database
 * pela função getDatabase() do singleton.
 */

const fs = require('fs');
const path = require('path');

// Lista de arquivos de models para corrigir
const modelFiles = [
  'models/careerModel.js',
  'models/contentModel.js', 
  'models/notificationModel.js',
  'models/progressModel.js',
  'models/quizModel.js',
  'models/achievementModel.js',
  'models/xpModel.js'
];

console.log('🔧 Iniciando correção de referências ao database...\n');

modelFiles.forEach(filePath => {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  Arquivo não encontrado: ${filePath}`);
    return;
  }

  console.log(`📝 Corrigindo: ${filePath}`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  let changes = 0;
  
  // 1. Corrigir importação do database
  if (content.includes("const { database } = require('./database');")) {
    content = content.replace(
      "const { database } = require('./database');",
      "const { getDatabase } = require('./databaseConnection');"
    );
    changes++;
    console.log('   ✅ Importação corrigida');
  }
  
  // 2. Adicionar getDatabase() no início de cada função que usa database
  const functionRegex = /async function (\w+)\([^)]*\) \{[\s]*try \{/g;
  let match;
  const functionsToFix = [];
  
  while ((match = functionRegex.exec(content)) !== null) {
    const functionName = match[1];
    const startIndex = match.index;
    
    // Verificar se a função usa database
    const functionEnd = content.indexOf('\n}', startIndex);
    const functionContent = content.substring(startIndex, functionEnd);
    
    if (functionContent.includes('database.') && !functionContent.includes('const db = getDatabase();')) {
      functionsToFix.push({
        name: functionName,
        start: startIndex,
        content: functionContent
      });
    }
  }
  
  // 3. Corrigir cada função identificada
  functionsToFix.forEach(func => {
    const oldPattern = `async function ${func.name}(`;
    const functionStart = content.indexOf(oldPattern);
    const tryStart = content.indexOf('try {', functionStart);
    const insertPoint = tryStart + 6; // depois de "try {\n"
    
    // Inserir const db = getDatabase(); se não existir
    if (!content.substring(functionStart, functionStart + 500).includes('const db = getDatabase();')) {
      const beforeInsert = content.substring(0, insertPoint);
      const afterInsert = content.substring(insertPoint);
      content = beforeInsert + '\n    const db = getDatabase();' + afterInsert;
      changes++;
    }
  });
  
  // 4. Substituir todas as referências database. por db.
  const databaseRefs = content.match(/database\.(all|get|run)/g);
  if (databaseRefs) {
    content = content.replace(/database\.(all|get|run)/g, 'db.$1');
    changes += databaseRefs.length;
    console.log(`   ✅ ${databaseRefs.length} referências database. corrigidas`);
  }
  
  // 5. Salvar arquivo se houve mudanças
  if (changes > 0) {
    fs.writeFileSync(filePath, content);
    console.log(`   ✅ ${changes} correções aplicadas\n`);
  } else {
    console.log('   ℹ️  Nenhuma correção necessária\n');
  }
});

console.log('🎉 Correção de referências concluída!');
console.log('\n📋 Próximos passos:');
console.log('1. Testar o servidor: npm start');
console.log('2. Verificar se o login funciona');
console.log('3. Verificar se o dashboard carrega sem erros'); 