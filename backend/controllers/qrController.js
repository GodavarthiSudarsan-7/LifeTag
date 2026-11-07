const db = require('../config/db');
const QRCode = require('qrcode');
const crypto = require('crypto');
const { getEmergencyUrl } = require('../utils/urlHelper');

// 1. GET ACTIVE QR TAG
exports.getActiveTag = async (req, res) => {
    try {
        const userId = req.user.userId;
        const [tags] = await db.query(
            `SELECT * FROM qr_tags
             WHERE user_id = ? AND status = 'Active'
             ORDER BY created_at DESC
             LIMIT 1`,
            [userId]
        );

        if (tags.length === 0) {
            return res.json({ success: true, tag: null });
        }

        const tag = tags[0];
        // Ensure QR code always encodes the configured network base URL (e.g. http://10.3.153.154:5000)
        const targetUrl = getEmergencyUrl(tag.qr_token);

        const qrDataUrl = await QRCode.toDataURL(targetUrl, {
            errorCorrectionLevel: 'H',
            margin: 2,
            width: 512,
            color: {
                dark: '#0F172A',
                light: '#FFFFFF'
            }
        });

        // Scan count for this tag
        const [scans] = await db.query('SELECT COUNT(*) AS total FROM qr_scans WHERE qr_id = ?', [tag.qr_id]);

        return res.json({
            success: true,
            tag: {
                ...tag,
                qr_url: targetUrl,
                qr_image: qrDataUrl,
                total_scans: scans[0].total
            }
        });
    } catch (err) {
        console.error('[GetActiveTag Error]', err);
        return res.status(500).json({ success: false, message: 'Server error retrieving QR tag.' });
    }
};

// 2. REGENERATE QR TAG (Revokes old active tags)
exports.regenerateTag = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { label } = req.body;

        // Fetch user name for token prefix
        const [profiles] = await db.query('SELECT full_name FROM user_profiles WHERE user_id = ?', [userId]);
        const safeName = profiles[0]?.full_name ? profiles[0].full_name.trim().split(' ')[0].toUpperCase().replace(/[^A-Z]/g, '') : 'USER';
        const randomPart = crypto.randomBytes(6).toString('hex').toUpperCase();
        const newToken = `LT-${safeName}-${randomPart}`;
        const newUrl = getEmergencyUrl(newToken);

        // Call Stored Procedure sp_regenerate_qr_tag
        await db.query('CALL sp_regenerate_qr_tag(?, ?, ?, ?, @new_qr_id)', [
            userId,
            newToken,
            newUrl,
            label || 'Regenerated Helmet Tag'
        ]);

        const [[outParam]] = await db.query('SELECT @new_qr_id AS qr_id');

        const qrDataUrl = await QRCode.toDataURL(newUrl, {
            errorCorrectionLevel: 'H',
            margin: 2,
            width: 512,
            color: { dark: '#0F172A', light: '#FFFFFF' }
        });

        return res.json({
            success: true,
            message: 'Previous QR codes revoked. New secure Lifetag generated.',
            qr_id: outParam.qr_id,
            qr_token: newToken,
            qr_url: newUrl,
            qr_image: qrDataUrl
        });
    } catch (err) {
        console.error('[RegenerateTag Error]', err);
        return res.status(500).json({ success: false, message: 'Server error regenerating QR code.' });
    }
};

// 3. REVOKE TAG
exports.revokeTag = async (req, res) => {
    try {
        const userId = req.user.userId;
        const tagId = req.params.id;

        await db.query(
            `UPDATE qr_tags
             SET status = 'Revoked', revoked_at = NOW()
             WHERE qr_id = ? AND user_id = ?`,
            [tagId, userId]
        );

        await db.query(
            'INSERT INTO audit_logs (user_id, action, details) VALUES (?, "QR_REVOKED", CONCAT("Tag #", ?, " manually revoked by owner"))',
            [userId, tagId]
        );

        return res.json({ success: true, message: 'Lifetag revoked. Scans on this tag will now be blocked.' });
    } catch (err) {
        console.error('[RevokeTag Error]', err);
        return res.status(500).json({ success: false, message: 'Server error revoking QR tag.' });
    }
};

// 4. LIST ALL TAGS
exports.listTags = async (req, res) => {
    try {
        const userId = req.user.userId;
        const [tags] = await db.query(
            `SELECT t.*, COUNT(s.scan_id) AS total_scans
             FROM qr_tags t
             LEFT JOIN qr_scans s ON t.qr_id = s.qr_id
             WHERE t.user_id = ?
             GROUP BY t.qr_id
             ORDER BY t.created_at DESC`,
            [userId]
        );
        const resolvedTags = tags.map(t => ({
            ...t,
            qr_url: getEmergencyUrl(t.qr_token)
        }));
        return res.json({ success: true, tags: resolvedTags });
    } catch (err) {
        console.error('[ListTags Error]', err);
        return res.status(500).json({ success: false, message: 'Server error listing tags.' });
    }
};
