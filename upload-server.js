const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');

const app = express();
const PORT = 5000;

// --- Configuração ---
const UPLOAD_FOLDER = path.join(__dirname, 'public', 'uploads');
const ALLOWED_IMAGE_EXTENSIONS = new Set(['png', 'jpg', 'jpeg', 'gif', 'webp']);
const ALLOWED_VIDEO_EXTENSIONS = new Set(['mp4', 'mov', 'avi']);

// Garante que a pasta de uploads exista
fs.mkdirSync(UPLOAD_FOLDER, { recursive: true });

// --- Funções Utilitárias ---

function slugify(text) {
    if (!text) return '';
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')           // Substitui espaços por -
        .replace(/[^\w\-]+/g, '')       // Remove caracteres inválidos
        .replace(/\-\-+/g, '-');        // Substitui múltiplos - por um único -
}

function getFileExtension(filename) {
    return filename.split('.').pop().toLowerCase();
}

// --- Middlewares ---

// Habilita CORS para permitir requisições do frontend
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

// Configuração do Multer para guardar arquivos em memória para processamento
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 } // Limite de 50MB
});

// --- Rotas ---

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK' });
});

app.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Nenhum arquivo enviado' });
        }

        const baseName = req.body.baseName || '';
        const originalExt = getFileExtension(req.file.originalname);
        
        const isImage = ALLOWED_IMAGE_EXTENSIONS.has(originalExt);
        const isVideo = ALLOWED_VIDEO_EXTENSIONS.has(originalExt);

        if (!isImage && !isVideo) {
            return res.status(400).json({ error: 'Tipo de arquivo não permitido' });
        }

        let uniqueFilename;
        let finalBuffer;
        let finalExtension;

        const slug = slugify(baseName).substring(0, 80);
        const shortId = crypto.randomBytes(3).toString('hex');

        if (isImage) {
            finalExtension = 'webp';
            uniqueFilename = `${slug || 'imagem'}-${shortId}.${finalExtension}`;
            
            finalBuffer = await sharp(req.file.buffer)
                .resize({ width: 1920, withoutEnlargement: true }) // Redimensiona se for maior que 1920px
                .webp({ quality: 80 }) // Converte para WebP com 80% de qualidade
                .toBuffer();

        } else { // isVideo
            finalExtension = originalExt;
            uniqueFilename = `${slug || 'video'}-${shortId}.${finalExtension}`;
            finalBuffer = req.file.buffer;
        }

        const filepath = path.join(UPLOAD_FOLDER, uniqueFilename);
        await fs.promises.writeFile(filepath, finalBuffer);

        const relativePath = `/uploads/${uniqueFilename}`;
        
        return res.status(200).json({
            success: true,
            filepath: relativePath,
            filename: uniqueFilename
        });

    } catch (error) {
        console.error('Erro no upload:', error);
        if (error instanceof multer.MulterError) {
            return res.status(413).json({ error: `Arquivo muito grande: ${error.message}` });
        }
        return res.status(500).json({ error: 'Erro interno ao processar o arquivo.' });
    }
});

// --- Iniciar Servidor ---
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor de upload (Node.js) iniciado na porta ${PORT}`);
    console.log(`📁 Arquivos salvos em: ${UPLOAD_FOLDER}`);
});
