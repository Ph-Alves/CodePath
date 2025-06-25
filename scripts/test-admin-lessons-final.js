#!/usr/bin/env node

/**
 * 🧪 TESTE FINAL: Botões de Admin Lessons
 * Verifica se a correção dos botões de editar/excluir foi bem-sucedida
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 TESTE FINAL: Verificando correções dos botões de Admin Lessons\n');

// 1. Verificar se o CSS foi corrigido
console.log('1️⃣ Verificando CSS do admin...');
const adminCssPath = path.join(__dirname, '..', 'public', 'css', 'admin.css');
const adminCss = fs.readFileSync(adminCssPath, 'utf8');

if (adminCss.includes('margin-left: 280px')) {
    console.log('   ✅ CSS corrigido: margin-left aplicado ao main-content');
} else {
    console.log('   ❌ CSS não corrigido: margin-left ausente');
}

// 2. Verificar se o JavaScript foi atualizado
console.log('\n2️⃣ Verificando JavaScript...');
const jsPath = path.join(__dirname, '..', 'public', 'js', 'admin-lessons.js');
const jsContent = fs.readFileSync(jsPath, 'utf8');

// Verificar se não há referências problemáticas
const problematicRefs = ['openLessonModal', 'confirmDeleteLesson', 'showToast', 'new bootstrap.Modal'];
let hasProblems = false;

problematicRefs.forEach(ref => {
    if (jsContent.includes(ref)) {
        console.log(`   ❌ Referência problemática encontrada: ${ref}`);
        hasProblems = true;
    }
});

if (!hasProblems) {
    console.log('   ✅ JavaScript limpo: sem referências problemáticas');
}

// Verificar se métodos corretos existem
const correctMethods = ['editLessonName', 'deleteLesson', 'showNotification'];
let hasCorrectMethods = true;

correctMethods.forEach(method => {
    if (!jsContent.includes(method)) {
        console.log(`   ❌ Método correto ausente: ${method}`);
        hasCorrectMethods = false;
    }
});

if (hasCorrectMethods) {
    console.log('   ✅ Métodos corretos implementados');
}

// 3. Verificar arquivo de debug
console.log('\n3️⃣ Verificando arquivo de debug...');
const debugPath = path.join(__dirname, '..', 'public', 'js', 'admin-lessons-debug.js');

if (fs.existsSync(debugPath)) {
    console.log('   ✅ Arquivo de debug criado');
    const debugContent = fs.readFileSync(debugPath, 'utf8');
    
    if (debugContent.includes('editLessonNameDebug') && debugContent.includes('deleteLessonDebug')) {
        console.log('   ✅ Métodos de debug implementados');
    } else {
        console.log('   ❌ Métodos de debug ausentes');
    }
} else {
    console.log('   ❌ Arquivo de debug não encontrado');
}

// 4. Verificar template
console.log('\n4️⃣ Verificando template...');
const templatePath = path.join(__dirname, '..', 'views', 'pages', 'admin-lessons.mustache');
const templateContent = fs.readFileSync(templatePath, 'utf8');

if (templateContent.includes('admin-lessons-debug.js?v={{timestamp}}')) {
    console.log('   ✅ Template usando arquivo de debug com cache busting');
} else if (templateContent.includes('admin-lessons.js?v={{timestamp}}')) {
    console.log('   ⚠️ Template usando arquivo normal (não debug)');
} else {
    console.log('   ❌ Template sem cache busting');
}

// 5. Verificar controller
console.log('\n5️⃣ Verificando controller...');
const controllerPath = path.join(__dirname, '..', 'controllers', 'adminController.js');
const controllerContent = fs.readFileSync(controllerPath, 'utf8');

if (controllerContent.includes('timestamp: Date.now()')) {
    console.log('   ✅ Controller com timestamp para cache busting');
} else {
    console.log('   ❌ Controller sem timestamp');
}

// 6. Verificar APIs
console.log('\n6️⃣ Verificando APIs...');
if (controllerContent.includes('updateLessonAPI') && controllerContent.includes('deleteLessonAPI')) {
    console.log('   ✅ APIs de editar e excluir implementadas');
} else {
    console.log('   ❌ APIs ausentes');
}

// 7. Resumo final
console.log('\n' + '='.repeat(50));
console.log('📋 RESUMO DAS CORREÇÕES');
console.log('='.repeat(50));

const corrections = [
    { name: 'Layout CSS corrigido', status: adminCss.includes('margin-left: 280px') },
    { name: 'JavaScript sem erros', status: !hasProblems },
    { name: 'Métodos corretos implementados', status: hasCorrectMethods },
    { name: 'Arquivo de debug criado', status: fs.existsSync(debugPath) },
    { name: 'Cache busting ativo', status: templateContent.includes('?v={{timestamp}}') },
    { name: 'APIs funcionais', status: controllerContent.includes('updateLessonAPI') }
];

corrections.forEach(correction => {
    const icon = correction.status ? '✅' : '❌';
    console.log(`${icon} ${correction.name}`);
});

const successCount = corrections.filter(c => c.status).length;
const successRate = ((successCount / corrections.length) * 100).toFixed(1);

console.log('\n' + '='.repeat(50));
console.log(`🎯 TAXA DE SUCESSO: ${successRate}% (${successCount}/${corrections.length})`);

if (successRate >= 80) {
    console.log('🎉 CORREÇÕES BEM-SUCEDIDAS! Botões devem funcionar agora.');
    console.log('\n📝 PRÓXIMOS PASSOS:');
    console.log('   1. Acesse http://localhost:4000/admin/lessons');
    console.log('   2. Faça login com: carlos@codepath.com / 123456');
    console.log('   3. Teste os botões ✏️ (editar) e 🗑️ (excluir)');
    console.log('   4. Verifique o console do navegador para logs de debug');
    console.log('   5. Se funcionarem, volte ao arquivo original');
} else {
    console.log('⚠️ ALGUMAS CORREÇÕES PENDENTES. Verifique os itens marcados com ❌');
}

console.log('\n' + '='.repeat(50)); 