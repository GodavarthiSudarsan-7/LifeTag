const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { getEmergencyUrl } = require('../utils/urlHelper');

// Generate JWT token
const signToken = (user) => {
    return jwt.sign(
        { userId: user.user_id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'lifetag_jwt_super_secure_academic_key_2026',
        { expiresIn: '7d' }
    );
};

// 1. REGISTER
exports.register = async (req, res) => {
    try {
        const { email, password, fullName, dateOfBirth, gender, bloodGroup, phone, city } = req.body;

        if (!email || !password || !fullName || !dateOfBirth || !bloodGroup || !phone) {
            return res.status(400).json({ success: false, message: 'Please provide all required fields.' });
        }

        // Check if user already exists
        const [existing] = await db.query('SELECT user_id FROM users WHERE email = ?', [email.toLowerCase().trim()]);
        if (existing.length > 0) {
            return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Generate initial unique cryptographic QR token
        const randomPart = crypto.randomBytes(6).toString('hex').toUpperCase();
        const safeName = fullName.trim().split(' ')[0].toUpperCase().replace(/[^A-Z]/g, '');
        const qrToken = `LT-${safeName}-${randomPart}`;
        const qrUrl = getEmergencyUrl(qrToken);

        // Call Stored Procedure sp_register_user_full
        const [procResult] = await db.query(
            'CALL sp_register_user_full(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @new_id)',
            [
                email.toLowerCase().trim(),
                passwordHash,
                fullName.trim(),
                dateOfBirth,
                gender || 'Prefer not to say',
                bloodGroup,
                phone.trim(),
                city ? city.trim() : null,
                qrToken,
                qrUrl
            ]
        );

        const [[outParam]] = await db.query('SELECT @new_id AS user_id');
        const newUserId = outParam.user_id;

        // Fetch freshly created user & profile
        const [users] = await db.query(
            `SELECT u.user_id, u.email, u.role, p.full_name, p.blood_group, p.phone, p.city, p.profile_code, p.completion_percentage
             FROM users u
             JOIN user_profiles p ON u.user_id = p.user_id
             WHERE u.user_id = ?`,
            [newUserId]
        );

        const user = users[0];
        const token = signToken(user);

        return res.status(201).json({
            success: true,
            message: 'User registered successfully with initial Lifetag QR.',
            token,
            user,
            qrToken
        });
    } catch (err) {
        console.error('[Register Error]', err);
        return res.status(500).json({ success: false, message: err.message || 'Server error during registration.' });
    }
};

// 2. LOGIN
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required.' });
        }

        const [users] = await db.query(
            `SELECT u.user_id, u.email, u.password_hash, u.role, u.is_active,
                    p.full_name, p.blood_group, p.phone, p.city, p.photo_url, p.profile_code, p.completion_percentage
             FROM users u
             LEFT JOIN user_profiles p ON u.user_id = p.user_id
             WHERE u.email = ?`,
            [email.toLowerCase().trim()]
        );

        if (users.length === 0) {
            return res.status(401).json({ success: false, message: 'Invalid email or password.' });
        }

        const user = users[0];
        if (!user.is_active) {
            return res.status(403).json({ success: false, message: 'Account is deactivated. Contact support.' });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid email or password.' });
        }

        delete user.password_hash;
        const token = signToken(user);

        // Log audit
        await db.query(
            'INSERT INTO audit_logs (user_id, action, ip_address, details) VALUES (?, "USER_LOGIN", ?, "Web app login successful")',
            [user.user_id, req.ip || '127.0.0.1']
        );

        return res.json({
            success: true,
            message: 'Login successful.',
            token,
            user
        });
    } catch (err) {
        console.error('[Login Error]', err);
        return res.status(500).json({ success: false, message: 'Server error during login.' });
    }
};

// 3. GET CURRENT USER (ME)
exports.getMe = async (req, res) => {
    try {
        const [users] = await db.query(
            `SELECT u.user_id, u.email, u.role, u.created_at,
                    p.full_name, p.date_of_birth, p.gender, p.blood_group, p.phone,
                    p.address, p.city, p.photo_url, p.profile_code, p.completion_percentage
             FROM users u
             JOIN user_profiles p ON u.user_id = p.user_id
             WHERE u.user_id = ?`,
            [req.user.userId]
        );

        if (users.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        return res.json({ success: true, user: users[0] });
    } catch (err) {
        console.error('[GetMe Error]', err);
        return res.status(500).json({ success: false, message: 'Server error retrieving current user.' });
    }
};

// 4. FORGOT PASSWORD (Demo reset)
exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    return res.json({
        success: true,
        message: 'Password reset link simulated. For local demonstration, you can log in with demo password Password@123'
    });
};
