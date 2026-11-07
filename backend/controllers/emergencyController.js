const db = require('../config/db');
const { getEmergencyUrl } = require('../utils/urlHelper');

// Helper to determine device type from User-Agent
const detectDevice = (userAgent) => {
    if (!userAgent) return 'Unknown Device';
    if (/iPhone/i.test(userAgent)) return 'Apple iPhone';
    if (/iPad/i.test(userAgent)) return 'Apple iPad';
    if (/Android/i.test(userAgent)) return 'Android Smartphone';
    if (/Mobile/i.test(userAgent)) return 'Mobile Device';
    return 'Desktop Browser';
};

// 1. PUBLIC EMERGENCY PROFILE RETRIEVAL (NO LOGIN REQUIRED)
exports.getEmergencyProfile = async (req, res) => {
    try {
        const { token } = req.params;
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
        const userAgent = req.headers['user-agent'] || 'Unknown';
        const deviceType = detectDevice(userAgent);

        // Call Stored Procedure to record scan and check tag validity
        await db.query(
            'CALL sp_record_emergency_scan(?, ?, ?, ?, NULL, NULL, NULL, @scan_status, @user_id)',
            [token, ip, userAgent.substring(0, 250), deviceType]
        );

        const [[scanMeta]] = await db.query('SELECT @scan_status AS scan_status, @user_id AS user_id');
        const scanStatus = scanMeta.scan_status;
        const userId = scanMeta.user_id;

        if (scanStatus === 'NOT_FOUND') {
            return res.status(404).json({
                success: false,
                status: 'INVALID_TAG',
                message: 'This Lifetag QR code was not found or is unassigned.'
            });
        }

        if (scanStatus === 'BLOCKED') {
            return res.status(403).json({
                success: false,
                status: 'REVOKED_TAG',
                message: 'This Lifetag QR code has been REVOKED or reported LOST by its owner. Information is inaccessible for security.'
            });
        }

        // Fetch user emergency profile from public view
        const [profiles] = await db.query(
            'SELECT * FROM vw_emergency_profile_public WHERE qr_token = ?',
            [token]
        );

        if (profiles.length === 0) {
            return res.status(404).json({ success: false, message: 'Profile details unavailable.' });
        }

        const p = profiles[0];

        // Fetch emergency contacts (Primary first, then secondary if privacy allows)
        let contactsQuery = `
            SELECT contact_name, relationship, primary_phone, alt_phone, priority, is_primary
            FROM emergency_contacts
            WHERE user_id = ?
        `;
        if (!p.show_secondary_contacts) {
            contactsQuery += ' AND is_primary = TRUE';
        }
        contactsQuery += ' ORDER BY is_primary DESC, priority ASC';
        const [contacts] = await db.query(contactsQuery, [userId]);

        // Filter medical details based on privacy settings
        let conditions = [];
        if (p.show_conditions) {
            const [rows] = await db.query(
                `SELECT mc.name, mc.severity, uc.notes
                 FROM user_conditions uc
                 JOIN medical_conditions mc ON uc.condition_id = mc.condition_id
                 WHERE uc.user_id = ?`,
                [userId]
            );
            conditions = rows;
        }

        let allergies = [];
        if (p.show_allergies) {
            const [rows] = await db.query(
                `SELECT a.name, a.category, a.critical_level, ua.reaction
                 FROM user_allergies ua
                 JOIN allergies a ON ua.allergy_id = a.allergy_id
                 WHERE ua.user_id = ?`,
                [userId]
            );
            allergies = rows;
        }

        let medications = [];
        if (p.show_medications) {
            const [rows] = await db.query(
                `SELECT m.name, um.dosage, um.frequency
                 FROM user_medications um
                 JOIN medications m ON um.medication_id = m.medication_id
                 WHERE um.user_id = ? AND um.is_current = TRUE`,
                [userId]
            );
            medications = rows;
        }

        // Computed clinical risk tier via stored function
        const [[riskResult]] = await db.query('SELECT fn_emergency_risk_index(?) AS risk_tier', [userId]);

        // Structure public payload strictly honoring user privacy toggles
        const publicProfile = {
            qr_token: token,
            full_name: p.full_name,
            photo_url: p.show_photo ? p.photo_url : null,
            blood_group: p.show_blood_group ? p.blood_group : null,
            age: p.age,
            gender: p.gender,
            city: p.city,
            address: p.show_address ? p.address : null,
            precautions: p.show_precautions ? p.precautions : null,
            disability_info: p.show_disability ? p.disability_info : null,
            emergency_notes: p.emergency_notes,
            organ_donor: p.organ_donor,
            clinical_risk_tier: riskResult.risk_tier || 'STANDARD',
            conditions,
            allergies,
            medications,
            contacts,
            allow_location_prompt: Boolean(p.allow_location_prompt)
        };

        return res.json({
            success: true,
            status: 'ACTIVE',
            profile: publicProfile
        });
    } catch (err) {
        console.error('[EmergencyProfile Error]', err);
        return res.status(500).json({ success: false, message: 'Server error loading emergency profile.' });
    }
};

// 2. SCANNER SHARE LOCATION (WITH EXPLICIT CONSENT)
exports.shareLocation = async (req, res) => {
    try {
        const { token } = req.params;
        const { latitude, longitude, city } = req.body;

        if (!latitude || !longitude) {
            return res.status(400).json({ success: false, message: 'Coordinates are required.' });
        }

        // Find recent scan id for this tag
        const [scans] = await db.query(
            `SELECT s.scan_id, t.user_id
             FROM qr_scans s
             JOIN qr_tags t ON s.qr_id = t.qr_id
             WHERE t.qr_token = ?
             ORDER BY s.scan_time DESC
             LIMIT 1`,
            [token]
        );

        if (scans.length > 0) {
            await db.query(
                `UPDATE qr_scans
                 SET latitude = ?, longitude = ?, city = ?
                 WHERE scan_id = ?`,
                [latitude, longitude, city || 'GPS Location Shared', scans[0].scan_id]
            );

            // Audit
            await db.query(
                'INSERT INTO audit_logs (user_id, action, details) VALUES (?, "SCAN_LOCATION_SHARED", CONCAT("Scanner shared location: ", ?, ", ", ?))',
                [scans[0].user_id, latitude, longitude]
            );
        }

        return res.json({ success: true, message: 'Emergency location received and shared with contacts.' });
    } catch (err) {
        console.error('[ShareLocation Error]', err);
        return res.status(500).json({ success: false, message: 'Server error saving location.' });
    }
};

// 3. TRIGGER EMERGENCY ALERT NOTIFICATION
exports.triggerAlert = async (req, res) => {
    try {
        const { token } = req.params;
        const { message, latitude, longitude, locationName } = req.body;

        const [tags] = await db.query(
            `SELECT t.qr_id, t.user_id, p.full_name
             FROM qr_tags t
             JOIN user_profiles p ON t.user_id = p.user_id
             WHERE t.qr_token = ? AND t.status = 'Active'`,
            [token]
        );

        if (tags.length === 0) {
            return res.status(404).json({ success: false, message: 'Active Lifetag not found.' });
        }

        const { qr_id, user_id, full_name } = tags[0];

        // Latest scan
        const [scans] = await db.query('SELECT scan_id FROM qr_scans WHERE qr_id = ? ORDER BY scan_time DESC LIMIT 1', [qr_id]);
        const scanId = scans.length > 0 ? scans[0].scan_id : null;

        // 1. Create emergency case record
        const [caseResult] = await db.query(
            `INSERT INTO emergency_cases (user_id, scan_id, location_name, latitude, longitude, description, status)
             VALUES (?, ?, ?, ?, ?, ?, 'OPEN')`,
            [
                user_id,
                scanId,
                locationName || 'Emergency Location from Scanner',
                latitude || null,
                longitude || null,
                message || 'Emergency scan notification dispatched by bystander.'
            ]
        );

        const emergencyId = caseResult.insertId;

        // 2. Fetch contacts to dispatch alerts
        const [contacts] = await db.query(
            'SELECT contact_id, contact_name, primary_phone FROM emergency_contacts WHERE user_id = ?',
            [user_id]
        );

        const mapsLink = latitude && longitude ? `https://maps.google.com/?q=${latitude},${longitude}` : '';
        const alertText = encodeURIComponent(
            `🚨 EMERGENCY ALERT via LIFETAG: ${full_name}'s emergency QR tag was just scanned! ` +
            `Please check immediately. Location: ${mapsLink || locationName || 'Not specified'}. View profile: ${getEmergencyUrl(token)}`
        );

        const notificationDispatches = [];
        for (const c of contacts) {
            const cleanPhone = c.primary_phone.replace(/[^0-9]/g, '');
            const whatsappUrl = `https://wa.me/${cleanPhone}?text=${alertText}`;
            const smsUrl = `sms:${cleanPhone}?body=${alertText}`;

            // Record notification in DB
            await db.query(
                `INSERT INTO notifications (emergency_id, contact_id, notification_type, status, message_payload)
                 VALUES (?, ?, 'SYSTEM', 'SENT', ?)`,
                [emergencyId, c.contact_id, decodeURIComponent(alertText)]
            );

            notificationDispatches.push({
                contact_name: c.contact_name,
                phone: c.primary_phone,
                whatsapp_url: whatsappUrl,
                sms_url: smsUrl
            });
        }

        return res.json({
            success: true,
            message: 'Emergency incident registered. Alerts dispatched to contacts.',
            emergencyId,
            dispatches: notificationDispatches
        });
    } catch (err) {
        console.error('[TriggerAlert Error]', err);
        return res.status(500).json({ success: false, message: 'Server error dispatching alert.' });
    }
};
