const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve static files for the admin panel
app.use('/admin', express.static(path.join(__dirname, 'admin')));

// Serve uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        // Preserve the original filename with minimal sanitization
        const safeName = file.originalname.replace(/[^a-zA-Z0-9._\- ]/g, '_');
        cb(null, safeName);
    }
});

const upload = multer({ storage: storage });

// Handle file upload
app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    // Return the relative path using forward slashes for URL compatibility
    const relativePath = `/uploads/${req.file.filename}`;
    res.json({ filepath: relativePath });
});

// Handle form submissions (redirect to thank you page)
app.post('/videos', (req, res) => {
    res.redirect('/thank_you.html');
});

app.post('/objeto-perdido', (req, res) => {
    res.redirect('/thank_you.html');
});

app.post('/pet-perdido', (req, res) => {
    res.redirect('/thank_you.html');
});

app.post('/propaganda', (req, res) => {
    res.redirect('/thank_you.html');
});

// Catch all handler: send back index.html for client-side routing
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});