const fetch = require('node-fetch'); // Instale com: npm install node-fetch

// Configurações do Directus
const DIRECTUS_URL = 'http://localhost:8055';
const ADMIN_EMAIL = 'admin@yourdomain.com'; // Altere no .env se necessário
const ADMIN_PASSWORD = 'your-admin-password-here'; // Altere no .env

// Função para autenticar e obter token
async function authenticate() {
    const response = await fetch(`${DIRECTUS_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD })
    });
    const data = await response.json();
    if (!response.ok) throw new Error('Falha na autenticação: ' + data.errors?.[0]?.message);
    return data.data.access_token;
}

// Função para criar coleção (ou pular se existir)
async function createCollection(token, collectionName, fields) {
    // Verificar se a coleção já existe
    const checkResponse = await fetch(`${DIRECTUS_URL}/collections/${collectionName}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (checkResponse.ok) {
        console.log(`Coleção ${collectionName} já existe. Pulando criação.`);
    } else {
        // Criar a coleção
        const collectionResponse = await fetch(`${DIRECTUS_URL}/collections`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                collection: collectionName,
                meta: { singleton: false },
                schema: {}
            })
        });
        if (!collectionResponse.ok) {
            const error = await collectionResponse.json();
            console.error(`Erro ao criar coleção ${collectionName}:`, error);
            return;
        }
        console.log(`Coleção ${collectionName} criada.`);
    }

    // Adicionar campos (mesmo se coleção existir)
    for (const field of fields) {
        // Verificar se campo já existe
        const fieldCheck = await fetch(`${DIRECTUS_URL}/fields/${collectionName}/${field.field}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (fieldCheck.ok) {
            console.log(`Campo ${field.field} já existe na ${collectionName}. Pulando.`);
            continue;
        }

        const fieldResponse = await fetch(`${DIRECTUS_URL}/fields/${collectionName}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(field)
        });
        if (!fieldResponse.ok) {
            const error = await fieldResponse.json();
            console.error(`Erro ao criar campo ${field.field} na coleção ${collectionName}:`, error);
        } else {
            console.log(`Campo ${field.field} adicionado à ${collectionName}.`);
        }
    }
}

// Definições das coleções e campos
const collections = [
    {
        name: 'pets_perdidos',
        fields: [
            { field: 'nome_pet', type: 'string', meta: { required: true } },
            { field: 'tipo_pet', type: 'string', meta: { required: true } },
            { field: 'raca', type: 'string' }, // Nota: Parece um bug no mapeamento, mas mantido
            { field: 'bairro', type: 'string' },
            { field: 'descricao', type: 'text', meta: { required: true } },
            { field: 'cidade', type: 'string', meta: { required: true } },
            { field: 'whatsapp', type: 'string', meta: { required: true } },
            { field: 'comprovante', type: 'files', meta: { special: ['files'] } },
            { field: 'fotos', type: 'files', meta: { special: ['files'] } }
        ]
    },
    {
        name: 'objetos_perdidos',
        fields: [
            { field: 'nome_responsavel', type: 'string', meta: { required: true } },
            { field: 'objeto_perdido', type: 'string', meta: { required: true } },
            { field: 'descricao_detalhada', type: 'text', meta: { required: true } },
            { field: 'data_horario', type: 'string', meta: { required: true } },
            { field: 'local_perdido', type: 'text', meta: { required: true } },
            { field: 'possibilidade_levado', type: 'text', meta: { required: true } },
            { field: 'nome_telefone_contato', type: 'string', meta: { required: true } },
            { field: 'recompensa', type: 'string', meta: { required: true } },
            { field: 'observacao', type: 'text' },
            { field: 'fotos', type: 'files', meta: { special: ['files'] } }
        ]
    },
    {
        name: 'reportagens',
        fields: [
            { field: 'whatsapp', type: 'string', meta: { required: true } },
            { field: 'cidade', type: 'string', meta: { required: true } },
            { field: 'bairro', type: 'string', meta: { required: true } },
            { field: 'problema', type: 'text', meta: { required: true } },
            { field: 'img_path', type: 'uuid', meta: { special: ['file'] } },
            { field: 'video_path', type: 'uuid', meta: { special: ['file'] } }
        ]
    }
];

// Função principal
async function setupCollections() {
    try {
        const token = await authenticate();
        console.log('Autenticado com sucesso.');

        for (const collection of collections) {
            await createCollection(token, collection.name, collection.fields);
        }

        console.log('Todas as coleções foram criadas com sucesso!');
    } catch (error) {
        console.error('Erro durante a configuração:', error.message);
    }
}

// Executar
setupCollections();