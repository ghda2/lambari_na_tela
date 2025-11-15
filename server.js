const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: true,
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration (must be before routes)
app.use(session({
    store: new SQLiteStore({
        db: 'sessions.db',
        dir: './data'
    }),
    secret: process.env.SESSION_SECRET || 'default-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        httpOnly: true,
        secure: false, // Set to true only in production with HTTPS
        sameSite: 'lax'
    }
}));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middleware to check admin authentication
function requireAuth(req, res, next) {
    if (req.session && req.session.isAuthenticated) {
        return next();
    }
    res.redirect('/admin/login.html');
}

// Admin login route
app.post('/admin/login', (req, res) => {
    const { username, password } = req.body;
    
    console.log('Tentativa de login:', { username });
    
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD || 'lambari2025';
    
    console.log('Credenciais esperadas:', { adminUsername, passwordMatch: password === adminPassword });
    
    if (username === adminUsername && password === adminPassword) {
        req.session.isAuthenticated = true;
        req.session.username = username;
        
        // Save session explicitly
        req.session.save((err) => {
            if (err) {
                console.error('Erro ao salvar sessão:', err);
                return res.status(500).json({ success: false, error: 'Erro ao salvar sessão' });
            }
            console.log('Login bem-sucedido! Sessão salva:', req.session);
            res.json({ success: true, message: 'Login realizado com sucesso' });
        });
    } else {
        console.log('Login falhou - credenciais incorretas');
        res.status(401).json({ success: false, error: 'Usuário ou senha incorretos' });
    }
});

// Admin logout route
app.post('/admin/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Erro ao fazer logout' });
        }
        res.json({ success: true, message: 'Logout realizado com sucesso' });
    });
});

// Check auth status
app.get('/admin/check-auth', (req, res) => {
    if (req.session && req.session.isAuthenticated) {
        res.json({ authenticated: true, username: req.session.username });
    } else {
        res.json({ authenticated: false });
    }
});

// Serve admin login page (public)
app.get('/admin/login.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin', 'login.html'));
});

// Serve admin index page (protected)
app.get('/admin/', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'admin', 'index.html'));
});

app.get('/admin/index.html', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'admin', 'index.html'));
});

// Protect all other admin routes
app.use('/admin', requireAuth, express.static(path.join(__dirname, 'admin')));

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

app.post('/propaganda-story', (req, res) => {
    res.redirect('/thank_you.html');
});

// Healthcheck endpoint for Docker
app.get('/healthz', (req, res) => {
    res.status(200).send('ok');
});

// Explicit routes for specific pages (must come before catch-all)
app.get('/objeto-perdido', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'objeto-perdido.html'));
});

app.get('/pet-perdido', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'pet-perdido.html'));
});

app.get('/propaganda', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'propaganda.html'));
});

app.get('/propaganda-story', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'propaganda-story.html'));
});

app.get('/forms', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'forms.html'));
});

// Catch all handler: send back index.html for client-side routing
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});