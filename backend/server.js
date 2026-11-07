const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();

// ==========================================
// CONFIGURATION
// ==========================================

const PORT = process.env.PORT || 5000;

// ==========================================
// MIDDLEWARE
// ==========================================

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ==========================================
// DATABASE CONNECTION
// ==========================================

const db = require('./config/db');

// ==========================================
// HEALTH CHECK
// ==========================================

app.get('/api/health', async (req, res) => {
    try {
        // Check database connection
        await db.query('SELECT 1');

        res.status(200).json({
            status: 'UP',
            service: 'LIFETAG Emergency Backend API',
            database: 'lifetag_db',
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Health check database error:', error.message);

        res.status(500).json({
            status: 'DOWN',
            service: 'LIFETAG Emergency Backend API',
            database: 'Disconnected',
            error: error.message
        });
    }
});

// ==========================================
// API ROUTES
// ==========================================

app.use('/api/auth', require('./routes/auth'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/medical', require('./routes/medical'));
app.use('/api/contacts', require('./routes/contacts'));
app.use('/api/privacy', require('./routes/privacy'));
app.use('/api/qr', require('./routes/qr'));
app.use('/api/emergency', require('./routes/emergency'));
app.use('/api/analytics', require('./routes/analytics'));

// ==========================================
// FRONTEND BUILD CONFIGURATION
// ==========================================

const frontendPath = path.join(__dirname, '..', 'frontend', 'dist');

if (fs.existsSync(frontendPath)) {

    app.use(express.static(frontendPath));

    console.log('Frontend build found:', frontendPath);

} else {

    console.log('WARNING: Frontend build not found.');
    console.log('Run npm run build inside the frontend folder.');

}

// ==========================================
// FRONTEND ROUTING
// ==========================================

// Serve React application for frontend routes
app.use((req, res, next) => {

    // Do not redirect API requests
    if (
        req.path.startsWith('/api') ||
        req.path.startsWith('/uploads')
    ) {
        return next();
    }

    const indexPath = path.join(frontendPath, 'index.html');

    if (fs.existsSync(indexPath)) {
        return res.sendFile(indexPath);
    }

    return res.status(404).json({
        success: false,
        message: 'Frontend build not found. Please build the React application.'
    });

});

// ==========================================
// 404 HANDLER
// ==========================================

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Requested API endpoint not found',
        path: req.originalUrl
    });
});

// ==========================================
// GLOBAL ERROR HANDLER
// ==========================================

app.use((err, req, res, next) => {

    console.error('Server Error:', err.stack || err.message);

    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error'
    });

});

// ==========================================
// START SERVER
// ==========================================

const server = app.listen(PORT, '0.0.0.0', () => {

    console.log('');
    console.log('======================================');
    console.log('   LIFETAG BACKEND STARTED');
    console.log('======================================');

    console.log(`Backend Port : ${PORT}`);
    console.log(`Health Check : http://localhost:${PORT}/api/health`);
    console.log(`Emergency API: http://localhost:${PORT}/api/emergency/:token`);

    console.log('======================================');
    console.log('Server listening on all network interfaces');
    console.log('======================================');
    console.log('');

});

// ==========================================
// GRACEFUL SHUTDOWN
// ==========================================

process.on('SIGINT', () => {

    console.log('\nShutting down LIFETAG server...');

    server.close(() => {
        console.log('Server stopped.');
        process.exit(0);
    });

});

module.exports = app;