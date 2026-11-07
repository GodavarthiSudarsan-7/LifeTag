const db = require('../config/db');

// DASHBOARD OVERVIEW ANALYTICS
exports.getDashboardAnalytics = async (req, res) => {
    try {
        const userId = req.user.userId;

        // 1. Readiness score & stats
        const [readiness] = await db.query(
            'SELECT * FROM vw_user_emergency_readiness WHERE user_id = ?',
            [userId]
        );

        // 2. Active QR Tag
        const [tags] = await db.query(
            `SELECT * FROM qr_tags
             WHERE user_id = ? AND status = 'Active'
             ORDER BY created_at DESC LIMIT 1`,
            [userId]
        );

        // 3. Recent Scans Feed (for this user's tags)
        const [recentScans] = await db.query(
            `SELECT s.scan_id, s.scan_time, s.device_type, s.city, s.latitude, s.longitude, s.scan_status, t.label, t.qr_token
             FROM qr_scans s
             JOIN qr_tags t ON s.qr_id = t.qr_id
             WHERE t.user_id = ?
             ORDER BY s.scan_time DESC
             LIMIT 10`,
            [userId]
        );

        // 4. Contact summary
        const [contacts] = await db.query(
            'SELECT contact_id, contact_name, relationship, primary_phone, is_primary FROM emergency_contacts WHERE user_id = ? ORDER BY is_primary DESC',
            [userId]
        );

        // 5. Medical item counts
        const [condCount] = await db.query('SELECT COUNT(*) AS count FROM user_conditions WHERE user_id = ?', [userId]);
        const [allgCount] = await db.query('SELECT COUNT(*) AS count FROM user_allergies WHERE user_id = ?', [userId]);
        const [medCount] = await db.query('SELECT COUNT(*) AS count FROM user_medications WHERE user_id = ?', [userId]);

        return res.json({
            success: true,
            analytics: {
                readiness_score: readiness[0]?.readiness_score || 40,
                active_tag: tags[0] || null,
                total_scans: recentScans.length,
                recent_scans: recentScans,
                contacts,
                medical_counts: {
                    conditions: condCount[0].count,
                    allergies: allgCount[0].count,
                    medications: medCount[0].count
                }
            }
        });
    } catch (err) {
        console.error('[DashboardAnalytics Error]', err);
        return res.status(500).json({ success: false, message: 'Server error retrieving analytics.' });
    }
};
