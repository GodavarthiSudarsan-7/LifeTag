const db = require('../config/db');

// 1. GET PRIVACY SETTINGS
exports.getPrivacySettings = async (req, res) => {
    try {
        const [settings] = await db.query(
            'SELECT * FROM privacy_settings WHERE user_id = ?',
            [req.user.userId]
        );

        if (settings.length === 0) {
            // Default initialization if absent
            await db.query('INSERT INTO privacy_settings (user_id) VALUES (?)', [req.user.userId]);
            const [newSettings] = await db.query('SELECT * FROM privacy_settings WHERE user_id = ?', [req.user.userId]);
            return res.json({ success: true, settings: newSettings[0] });
        }

        return res.json({ success: true, settings: settings[0] });
    } catch (err) {
        console.error('[GetPrivacy Error]', err);
        return res.status(500).json({ success: false, message: 'Server error retrieving privacy settings.' });
    }
};

// 2. UPDATE PRIVACY SETTINGS
exports.updatePrivacySettings = async (req, res) => {
    try {
        const userId = req.user.userId;
        const {
            show_photo,
            show_blood_group,
            show_allergies,
            show_conditions,
            show_medications,
            show_precautions,
            show_disability,
            show_address,
            show_secondary_contacts,
            allow_location_prompt
        } = req.body;

        await db.query(
            `UPDATE privacy_settings
             SET show_photo = ?, show_blood_group = ?, show_allergies = ?, show_conditions = ?,
                 show_medications = ?, show_precautions = ?, show_disability = ?, show_address = ?,
                 show_secondary_contacts = ?, allow_location_prompt = ?, updated_at = NOW()
             WHERE user_id = ?`,
            [
                show_photo !== undefined ? show_photo : true,
                show_blood_group !== undefined ? show_blood_group : true,
                show_allergies !== undefined ? show_allergies : true,
                show_conditions !== undefined ? show_conditions : true,
                show_medications !== undefined ? show_medications : true,
                show_precautions !== undefined ? show_precautions : true,
                show_disability !== undefined ? show_disability : true,
                show_address !== undefined ? show_address : false,
                show_secondary_contacts !== undefined ? show_secondary_contacts : true,
                allow_location_prompt !== undefined ? allow_location_prompt : true,
                userId
            ]
        );

        return res.json({ success: true, message: 'Privacy preferences saved.' });
    } catch (err) {
        console.error('[UpdatePrivacy Error]', err);
        return res.status(500).json({ success: false, message: 'Server error updating privacy settings.' });
    }
};
