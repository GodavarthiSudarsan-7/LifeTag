const db = require('../config/db');

// 1. LIST CONTACTS
exports.getContacts = async (req, res) => {
    try {
        const [contacts] = await db.query(
            `SELECT * FROM emergency_contacts
             WHERE user_id = ?
             ORDER BY is_primary DESC, priority ASC`,
            [req.user.userId]
        );
        return res.json({ success: true, contacts });
    } catch (err) {
        console.error('[GetContacts Error]', err);
        return res.status(500).json({ success: false, message: 'Server error retrieving contacts.' });
    }
};

// 2. ADD CONTACT
exports.addContact = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { contact_name, relationship, primary_phone, alt_phone, is_primary } = req.body;

        if (!contact_name || !relationship || !primary_phone) {
            return res.status(400).json({ success: false, message: 'Name, relationship and phone are required.' });
        }

        // Check current contacts count
        const [existing] = await db.query('SELECT COUNT(*) AS count FROM emergency_contacts WHERE user_id = ?', [userId]);
        const priority = existing[0].count + 1;
        const makePrimary = is_primary || existing[0].count === 0;

        if (makePrimary) {
            await db.query('UPDATE emergency_contacts SET is_primary = FALSE WHERE user_id = ?', [userId]);
        }

        const [result] = await db.query(
            `INSERT INTO emergency_contacts (user_id, contact_name, relationship, primary_phone, alt_phone, priority, is_primary)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [userId, contact_name.trim(), relationship.trim(), primary_phone.trim(), alt_phone ? alt_phone.trim() : null, priority, makePrimary]
        );

        return res.status(201).json({
            success: true,
            message: 'Emergency contact added.',
            contactId: result.insertId
        });
    } catch (err) {
        console.error('[AddContact Error]', err);
        return res.status(500).json({ success: false, message: 'Server error adding contact.' });
    }
};

// 3. UPDATE CONTACT
exports.updateContact = async (req, res) => {
    try {
        const userId = req.user.userId;
        const contactId = req.params.id;
        const { contact_name, relationship, primary_phone, alt_phone, priority } = req.body;

        await db.query(
            `UPDATE emergency_contacts
             SET contact_name = ?, relationship = ?, primary_phone = ?, alt_phone = ?, priority = ?
             WHERE contact_id = ? AND user_id = ?`,
            [contact_name, relationship, primary_phone, alt_phone || null, priority || 1, contactId, userId]
        );

        return res.json({ success: true, message: 'Contact updated successfully.' });
    } catch (err) {
        console.error('[UpdateContact Error]', err);
        return res.status(500).json({ success: false, message: 'Server error updating contact.' });
    }
};

// 4. DELETE CONTACT
exports.deleteContact = async (req, res) => {
    try {
        const userId = req.user.userId;
        const contactId = req.params.id;

        const [contacts] = await db.query(
            'SELECT is_primary FROM emergency_contacts WHERE contact_id = ? AND user_id = ?',
            [contactId, userId]
        );

        if (contacts.length === 0) {
            return res.status(404).json({ success: false, message: 'Contact not found.' });
        }

        const wasPrimary = contacts[0].is_primary;
        await db.query('DELETE FROM emergency_contacts WHERE contact_id = ? AND user_id = ?', [contactId, userId]);

        // If the deleted contact was primary, promote the next priority contact to primary
        if (wasPrimary) {
            await db.query(
                `UPDATE emergency_contacts
                 SET is_primary = TRUE, priority = 1
                 WHERE user_id = ?
                 ORDER BY priority ASC
                 LIMIT 1`,
                [userId]
            );
        }

        return res.json({ success: true, message: 'Contact deleted.' });
    } catch (err) {
        console.error('[DeleteContact Error]', err);
        return res.status(500).json({ success: false, message: 'Server error deleting contact.' });
    }
};

// 5. SET PRIMARY CONTACT
exports.setPrimaryContact = async (req, res) => {
    try {
        const userId = req.user.userId;
        const contactId = req.params.id;

        // Atomic toggle
        await db.query('UPDATE emergency_contacts SET is_primary = FALSE WHERE user_id = ?', [userId]);
        await db.query('UPDATE emergency_contacts SET is_primary = TRUE, priority = 1 WHERE contact_id = ? AND user_id = ?', [contactId, userId]);

        return res.json({ success: true, message: 'Primary emergency contact set.' });
    } catch (err) {
        console.error('[SetPrimary Error]', err);
        return res.status(500).json({ success: false, message: 'Server error updating primary contact.' });
    }
};
