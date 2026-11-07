const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../public/uploads/avatars');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
        cb(null, `avatar-user-${req.user.userId}-${uniqueSuffix}${ext}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowed = /jpeg|jpg|png|webp/;
        const mime = allowed.test(file.mimetype);
        const ext = allowed.test(path.extname(file.originalname).toLowerCase());
        if (mime && ext) return cb(null, true);
        cb(new Error('Only JPEG, PNG, and WebP images are allowed.'));
    }
});

router.get('/', auth, profileController.getProfile);
router.put('/', auth, profileController.updateProfile);
router.post('/avatar', auth, upload.single('avatar'), profileController.uploadAvatar);

module.exports = router;
