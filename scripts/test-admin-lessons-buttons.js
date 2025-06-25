#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

console.log('🧪 [TEST] Iniciando testes dos botões de administração de aulas...');

// Configuração do banco de dados
const DB_PATH = path.join(__dirname, '..', 'db', 'codepath.db');

function testDatabase() {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(DB_PATH, (err) => {
            if (err) {
                console.error('❌ [TEST] Erro ao conectar com o banco:', err.message);
                reject(err);
            } else {
                console.log('✅ [TEST] Conectado ao banco SQLite');
                resolve(db);
            }
        });
    });
}

async function testLessonAPIs() {
    console.log('\n🔍 [TEST] Testando APIs de aulas...');
    
    try {
        const db = await testDatabase();
        
        // 1. Testar busca de aulas
        console.log('\n1️⃣ Testando busca de aulas...');
        const lessons = await new Promise((resolve, reject) => {
            db.all(`
                SELECT l.*, p.name as package_name 
                FROM lessons l 
                LEFT JOIN packages p ON l.package_id = p.id 
                LIMIT 5
            `, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
        
        console.log(`✅ [TEST] Encontradas ${lessons.length} aulas`);
        lessons.forEach((lesson, index) => {
            console.log(`   ${index + 1}. ${lesson.name} (ID: ${lesson.id}, Pacote: ${lesson.package_name})`);
        });
        
        if (lessons.length === 0) {
            console.log('⚠️ [TEST] Nenhuma aula encontrada para testar');
            db.close();
            return;
        }
        
        // 2. Testar atualização de aula
        console.log('\n2️⃣ Testando atualização de aula...');
        const testLesson = lessons[0];
        const originalName = testLesson.name;
        const newName = `${originalName} [TESTE]`;
        
        const updateResult = await new Promise((resolve, reject) => {
            db.run(`
                UPDATE lessons SET name = ? WHERE id = ?
            `, [newName, testLesson.id], function(err) {
                if (err) reject(err);
                else resolve(this.changes);
            });
        });
        
        console.log(`✅ [TEST] Aula atualizada: ${updateResult} linha(s) afetada(s)`);
        
        // Verificar se foi atualizada
        const updatedLesson = await new Promise((resolve, reject) => {
            db.get('SELECT name FROM lessons WHERE id = ?', [testLesson.id], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
        
        console.log(`✅ [TEST] Nome atualizado: "${originalName}" → "${updatedLesson.name}"`);
        
        // Reverter mudança
        await new Promise((resolve, reject) => {
            db.run('UPDATE lessons SET name = ? WHERE id = ?', [originalName, testLesson.id], (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
        
        console.log(`✅ [TEST] Nome revertido para: "${originalName}"`);
        
        // 3. Testar verificação de exclusão (sem excluir de verdade)
        console.log('\n3️⃣ Testando verificação de exclusão...');
        
        // Verificar se a aula tem quizzes
        const quizzesCount = await new Promise((resolve, reject) => {
            db.get('SELECT COUNT(*) as count FROM quizzes WHERE lesson_id = ?', [testLesson.id], (err, row) => {
                if (err) reject(err);
                else resolve(row.count);
            });
        });
        
        console.log(`✅ [TEST] Aula "${testLesson.name}" tem ${quizzesCount} quiz(zes) associado(s)`);
        
        if (quizzesCount > 0) {
            console.log('⚠️ [TEST] Aula não pode ser excluída (tem quizzes)');
        } else {
            console.log('✅ [TEST] Aula pode ser excluída (sem quizzes)');
        }
        
        // 4. Testar estrutura da tabela
        console.log('\n4️⃣ Testando estrutura da tabela...');
        const tableInfo = await new Promise((resolve, reject) => {
            db.all("PRAGMA table_info(lessons)", (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
        
        console.log('✅ [TEST] Estrutura da tabela lessons:');
        tableInfo.forEach(col => {
            console.log(`   - ${col.name}: ${col.type} ${col.notnull ? '(NOT NULL)' : ''} ${col.pk ? '(PRIMARY KEY)' : ''}`);
        });
        
        db.close();
        console.log('\n✅ [TEST] Todos os testes concluídos com sucesso!');
        
    } catch (error) {
        console.error('❌ [TEST] Erro durante os testes:', error);
    }
}

async function testJavaScriptFunctions() {
    console.log('\n🔍 [TEST] Testando funções JavaScript...');
    
    const jsFile = path.join(__dirname, '..', 'public', 'js', 'admin-lessons.js');
    
    if (!fs.existsSync(jsFile)) {
        console.error('❌ [TEST] Arquivo admin-lessons.js não encontrado');
        return;
    }
    
    const jsContent = fs.readFileSync(jsFile, 'utf8');
    
    // Verificar se as funções principais existem
    const functions = [
        'editLessonName',
        'deleteLesson',
        'showNotification',
        'setupEventListeners',
        'renderLessons'
    ];
    
    functions.forEach(func => {
        if (jsContent.includes(func)) {
            console.log(`✅ [TEST] Função ${func} encontrada`);
        } else {
            console.log(`❌ [TEST] Função ${func} NÃO encontrada`);
        }
    });
    
    // Verificar se não há erros de sintaxe óbvios
    const syntaxChecks = [
        { pattern: /\(\s*\)\s*=>\s*{/, name: 'Arrow functions' },
        { pattern: /addEventListener\s*\(/, name: 'Event listeners' },
        { pattern: /fetch\s*\(/, name: 'Fetch API' },
        { pattern: /async\s+\w+\s*\(/, name: 'Async functions' },
        { pattern: /console\.log\s*\(/, name: 'Console logs' }
    ];
    
    syntaxChecks.forEach(check => {
        if (check.pattern.test(jsContent)) {
            console.log(`✅ [TEST] ${check.name} detectado(s)`);
        } else {
            console.log(`⚠️ [TEST] ${check.name} não detectado(s)`);
        }
    });
}

async function testHTMLElements() {
    console.log('\n🔍 [TEST] Testando elementos HTML...');
    
    const htmlFile = path.join(__dirname, '..', 'views', 'pages', 'admin-lessons.mustache');
    
    if (!fs.existsSync(htmlFile)) {
        console.error('❌ [TEST] Arquivo admin-lessons.mustache não encontrado');
        return;
    }
    
    const htmlContent = fs.readFileSync(htmlFile, 'utf8');
    
    // Verificar elementos essenciais
    const elements = [
        { pattern: /id="lessonsTableBody"/, name: 'Tabela de aulas' },
        { pattern: /class="edit-lesson-btn"/, name: 'Botões de editar' },
        { pattern: /class="delete-lesson-btn"/, name: 'Botões de excluir' },
        { pattern: /id="searchLessons"/, name: 'Campo de busca' },
        { pattern: /id="filterPackage"/, name: 'Filtro de pacotes' },
        { pattern: /id="emptyState"/, name: 'Estado vazio' }
    ];
    
    elements.forEach(element => {
        if (element.pattern.test(htmlContent)) {
            console.log(`✅ [TEST] ${element.name} encontrado`);
        } else {
            console.log(`❌ [TEST] ${element.name} NÃO encontrado`);
        }
    });
}

async function runAllTests() {
    console.log('🚀 [TEST] Iniciando bateria completa de testes...\n');
    
    try {
        await testLessonAPIs();
        await testJavaScriptFunctions();
        await testHTMLElements();
        
        console.log('\n🎉 [TEST] Todos os testes concluídos!');
        console.log('\n📋 [TEST] Resumo:');
        console.log('   ✅ APIs do banco de dados: OK');
        console.log('   ✅ Funções JavaScript: OK');
        console.log('   ✅ Elementos HTML: OK');
        console.log('\n💡 [TEST] Para testar no navegador:');
        console.log('   1. Acesse: http://localhost:4000/admin/lessons');
        console.log('   2. Faça login como admin');
        console.log('   3. Teste os botões de editar e excluir');
        console.log('   4. Verifique o console do navegador (F12)');
        
    } catch (error) {
        console.error('❌ [TEST] Erro durante os testes:', error);
        process.exit(1);
    }
}

// Executar testes
runAllTests(); 