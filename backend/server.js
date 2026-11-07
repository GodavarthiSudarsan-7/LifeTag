const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static uploads serving
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Health Check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'UP',
        service: 'LIFETAG Emergency Backend API',
        database: process.env.DB_NAME || 'lifetag_db',
        timestamp: new Date().toISOString()
    });
});

// Mount Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/medical', require('./routes/medical'));
app.use('/api/contacts', require('./routes/contacts'));
app.use('/api/privacy', require('./routes/privacy'));
app.use('/api/qr', require('./routes/qr'));
app.use('/api/emergency', require('./routes/emergency'));
app.use('/api/analytics', require('./routes/analytics'));

// Serve frontend static assets if built
const frontendBuildPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendBuildPath));
app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
        return next();
    }
    const indexPath = path.join(frontendBuildPath, 'index.html');
    res.sendFile(indexPath, (err) => {
        if (err) {
            res.status(200).send('LifeTag Backend API is active. Frontend build will load here.');
        }
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('[Unhandled Error]', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error'
    });
});

app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`  LIFETAG API Server running on port ${PORT}`);
    console.log(`  Health Check : http://localhost:${PORT}/api/health`);
    console.log(`  Emergency URL: http://localhost:${PORT}/api/emergency/:token`);
    console.log(`====================================================`);
});

module.exports = app;
