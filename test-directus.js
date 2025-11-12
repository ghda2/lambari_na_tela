const fetch = require('node-fetch');
const fs = require('fs');

const DIRECTUS_URL = 'http://localhost:8055';

// Teste 1: Upload de arquivo
async function testUpload() {
    console.log('Testando upload de arquivo...');
    const formData = new FormData();
    // Simular um arquivo (criar um buffer simples)
    const fileBuffer = Buffer.from('Teste de imagem', 'utf8');
    formData.append('file', new Blob([fileBuffer], { type: 'image/png' }), 'teste.png');

    try {
        const response = await fetch(`${DIRECTUS_URL}/files`, {
            method: 'POST',
            body: formData
        });
        const result = await response.json();
        console.log('Upload result:', result);
        return result.data?.id;
    } catch (error) {
        console.error('Erro no upload:', error.message);
    }
}

// Teste 2: Criar item
async function testCreateItem(fileId) {
    console.log('Testando criação de item...');
    const payload = {
        nome_pet: 'Teste Pet',
        tipo_pet: 'Cachorro',
        cidade: 'Teste City',
        whatsapp: '11999999999',
        comprovante: fileId ? [fileId] : null,
        fotos: fileId ? [fileId] : null
    };

    try {
        const response = await fetch(`${DIRECTUS_URL}/items/pets_perdidos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        const result = await response.json();
        console.log('Create item result:', result);
    } catch (error) {
        console.error('Erro na criação:', error.message);
    }
}

// Executar testes
async function runTests() {
    const fileId = await testUpload();
    await testCreateItem(fileId);
}

runTests();