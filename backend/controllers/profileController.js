const db = require('../config/db');

// Calculate profile completion percentage based on filled fields
const calculateCompletion = (profile, medical, contactCount) => {
    let score = 20; // Base account creation
    if (profile.full_name && profile.phone) score += 20;
    if (profile.blood_group) score += 15;
    if (profile.date_of_birth && profile.city) score += 15;
    if (profile.photo_url) score += 10;
    if (contactCount > 0) score += 10;
    if (medical && (medical.precautions || medical.emergency_notes)) score += 10;
    return Math.min(100, score);
};

// 1. GET PROFILE
exports.getProfile = async (req, res) => {
    try {
        const [profiles] = await db.query(
            `SELECT p.*, u.email, u.role
             FROM user_profiles p
             JOIN users u ON p.user_id = u.user_id
             WHERE p.user_id = ?`,
            [req.user.userId]
        );

        if (profiles.length === 0) {
            return res.status(404).json({ success: false, message: 'Profile not found.' });
        }

        const [contacts] = await db.query('SELECT COUNT(*) AS count FROM emergency_contacts WHERE user_id = ?', [req.user.userId]);
        const [medicals] = await db.query('SELECT * FROM medical_profiles WHERE user_id = ?', [req.user.userId]);

        const completion = calculateCompletion(profiles[0], medicals[0], contacts[0].count);

        return res.json({
            success: true,
            profile: {
                ...profiles[0],
                completion_percentage: completion
            }
        });
    } catch (err) {
        console.error('[GetProfile Error]', err);
        return res.status(500).json({ success: false, message: 'Server error retrieving profile.' });
    }
};

// 2. UPDATE PROFILE
exports.updateProfile = async (req, res) => {
    try {
        const { full_name, date_of_birth, gender, blood_group, phone, address, city } = req.body;

        if (!full_name || !phone || !blood_group) {
            return res.status(400).json({ success: false, message: 'Full name, phone, and blood group are required.' });
        }

        // Fetch contacts & medical for completion score
        const [contacts] = await db.query('SELECT COUNT(*) AS count FROM emergency_contacts WHERE user_id = ?', [req.user.userId]);
        const [medicals] = await db.query('SELECT * FROM medical_profiles WHERE user_id = ?', [req.user.userId]);

        const tempProf = { full_name, phone, blood_group, date_of_birth, city, photo_url: req.body.photo_url };
        const completion = calculateCompletion(tempProf, medicals[0], contacts[0].count);

        await db.query(
            `UPDATE user_profiles
             SET full_name = ?, date_of_birth = ?, gender = ?, blood_group = ?, phone = ?,
                 address = ?, city = ?, completion_percentage = ?, updated_at = NOW()
             WHERE user_id = ?`,
            [full_name, date_of_birth, gender, blood_group, phone, address, city, completion, req.user.userId]
        );

        // Keep medical_profiles blood_group in sync
        await db.query(
            'UPDATE medical_profiles SET blood_group = ? WHERE user_id = ?',
            [blood_group, req.user.userId]
        );

        return res.json({
            success: true,
            message: 'Profile updated successfully.',
            completion_percentage: completion
        });
    } catch (err) {
        console.error('[UpdateProfile Error]', err);
        return res.status(500).json({ success: false, message: 'Server error updating profile.' });
    }
};

// 3. UPLOAD AVATAR
exports.uploadAvatar = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No image file uploaded.' });
        }

        const photoUrl = `/uploads/avatars/${req.file.filename}`;
        await db.query(
            'UPDATE user_profiles SET photo_url = ?, updated_at = NOW() WHERE user_id = ?',
            [photoUrl, req.user.userId]
        );

        return res.json({
            success: true,
            message: 'Profile photograph uploaded successfully.',
            photo_url: photoUrl
        });
    } catch (err) {
        console.error('[UploadAvatar Error]', err);
        return res.status(500).json({ success: false, message: 'Server error uploading avatar.' });
    }
};
