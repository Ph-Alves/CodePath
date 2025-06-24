const http = require('http');

// Função para fazer requisição HTTP
function makeRequest(options, data = null) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    const response = JSON.parse(body);
                    resolve({ status: res.statusCode, data: response });
                } catch (e) {
                    resolve({ status: res.statusCode, data: body });
                }
            });
        });

        req.on('error', reject);
        
        if (data) {
            req.write(JSON.stringify(data));
        }
        
        req.end();
    });
}

async function testAdminPackagesAPI() {
    console.log('🧪 Testando APIs de Administração de Pacotes...\n');

    // Configurações da requisição
    const baseOptions = {
        hostname: 'localhost',
        port: 4000,
        headers: {
            'Content-Type': 'application/json',
            // Simular sessão de admin (em produção seria um cookie de sessão)
            'Cookie': 'connect.sid=s%3A...' // Placeholder
        }
    };

    try {
        // Teste 1: Listar pacotes
        console.log('1️⃣ Testando GET /admin/api/packages...');
        const listResponse = await makeRequest({
            ...baseOptions,
            path: '/admin/api/packages',
            method: 'GET'
        });
        
        console.log(`   Status: ${listResponse.status}`);
        console.log(`   Pacotes encontrados: ${listResponse.data.packages ? listResponse.data.packages.length : 'N/A'}`);
        
        if (listResponse.status === 200) {
            console.log('   ✅ API de listagem funcionando');
        } else {
            console.log('   ❌ Erro na API de listagem');
            console.log('   Resposta:', listResponse.data);
        }

        // Teste 2: Buscar estatísticas
        console.log('\n2️⃣ Testando GET /admin/api/packages/stats...');
        const statsResponse = await makeRequest({
            ...baseOptions,
            path: '/admin/api/packages/stats',
            method: 'GET'
        });
        
        console.log(`   Status: ${statsResponse.status}`);
        if (statsResponse.status === 200) {
            console.log('   ✅ API de estatísticas funcionando');
            console.log('   Stats:', statsResponse.data);
        } else {
            console.log('   ❌ Erro na API de estatísticas');
        }

        // Teste 3: Criar pacote (teste)
        console.log('\n3️⃣ Testando POST /admin/api/packages...');
        const newPackage = {
            name: 'Teste Package',
            description: 'Pacote de teste criado automaticamente',
            difficulty: 'Iniciante',
            duration_hours: 10,
            rating: 4.5,
            tags: 'teste,automation',
            prerequisites: 'Nenhum',
            is_active: true
        };

        const createResponse = await makeRequest({
            ...baseOptions,
            path: '/admin/api/packages',
            method: 'POST'
        }, newPackage);
        
        console.log(`   Status: ${createResponse.status}`);
        if (createResponse.status === 201) {
            console.log('   ✅ API de criação funcionando');
            console.log('   Package ID:', createResponse.data.packageId);
        } else {
            console.log('   ❌ Erro na API de criação');
            console.log('   Resposta:', createResponse.data);
        }

    } catch (error) {
        console.error('❌ Erro durante os testes:', error.message);
        console.log('\n💡 Dicas de solução:');
        console.log('   - Verificar se o servidor está rodando na porta 4000');
        console.log('   - Verificar se você está logado como admin');
        console.log('   - Verificar logs do servidor para mais detalhes');
    }

    console.log('\n🏁 Testes concluídos!');
}

// Executar testes
testAdminPackagesAPI(); 