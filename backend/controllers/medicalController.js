const db = require('../config/db');

// 1. GET USER MEDICAL DOSSIER
exports.getMedicalInfo = async (req, res) => {
    try {
        const userId = req.user.userId;

        // Medical profile
        const [medicals] = await db.query(
            'SELECT * FROM medical_profiles WHERE user_id = ?',
            [userId]
        );

        if (medicals.length === 0) {
            return res.status(404).json({ success: false, message: 'Medical profile not found.' });
        }

        // Conditions
        const [conditions] = await db.query(
            `SELECT uc.condition_id, mc.name, mc.severity, mc.description, uc.diagnosed_year, uc.notes
             FROM user_conditions uc
             JOIN medical_conditions mc ON uc.condition_id = mc.condition_id
             WHERE uc.user_id = ?`,
            [userId]
        );

        // Allergies
        const [allergies] = await db.query(
            `SELECT ua.allergy_id, a.name, a.category, a.critical_level, ua.reaction, ua.notes
             FROM user_allergies ua
             JOIN allergies a ON ua.allergy_id = a.allergy_id
             WHERE ua.user_id = ?`,
            [userId]
        );

        // Medications
        const [medications] = await db.query(
            `SELECT um.medication_id, m.name, m.category, um.dosage, um.frequency, um.is_current
             FROM user_medications um
             JOIN medications m ON um.medication_id = m.medication_id
             WHERE um.user_id = ?`,
            [userId]
        );

        // Computed clinical risk tier via Stored Function
        const [[riskResult]] = await db.query(
            'SELECT fn_emergency_risk_index(?) AS clinical_risk_tier',
            [userId]
        );

        return res.json({
            success: true,
            medical: medicals[0],
            conditions,
            allergies,
            medications,
            clinical_risk_tier: riskResult.clinical_risk_tier || 'STANDARD'
        });
    } catch (err) {
        console.error('[GetMedical Error]', err);
        return res.status(500).json({ success: false, message: 'Server error retrieving medical info.' });
    }
};

// 2. GET MASTER CATALOGS (Dropdown options)
exports.getCatalogs = async (req, res) => {
    try {
        const [conditions] = await db.query('SELECT * FROM medical_conditions ORDER BY severity DESC, name ASC');
        const [allergies] = await db.query('SELECT * FROM allergies ORDER BY critical_level DESC, name ASC');
        const [medications] = await db.query('SELECT * FROM medications ORDER BY name ASC');

        return res.json({
            success: true,
            catalogs: {
                conditions,
                allergies,
                medications
            }
        });
    } catch (err) {
        console.error('[GetCatalogs Error]', err);
        return res.status(500).json({ success: false, message: 'Server error retrieving catalogs.' });
    }
};

// 3. UPDATE MEDICAL PRECAUTIONS & NOTES
exports.updateMedicalInfo = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { precautions, disability_info, emergency_notes, organ_donor } = req.body;

        await db.query(
            `UPDATE medical_profiles
             SET precautions = ?, disability_info = ?, emergency_notes = ?, organ_donor = ?, last_updated = NOW()
             WHERE user_id = ?`,
            [precautions || null, disability_info || null, emergency_notes || null, organ_donor ? 1 : 0, userId]
        );

        return res.json({ success: true, message: 'Medical information updated successfully.' });
    } catch (err) {
        console.error('[UpdateMedical Error]', err);
        return res.status(500).json({ success: false, message: 'Server error updating medical notes.' });
    }
};

// 4. ADD USER CONDITION
exports.addCondition = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { condition_id, diagnosed_year, notes } = req.body;

        if (!condition_id) {
            return res.status(400).json({ success: false, message: 'Condition ID is required.' });
        }

        await db.query(
            `INSERT INTO user_conditions (user_id, condition_id, diagnosed_year, notes)
             VALUES (?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE diagnosed_year = VALUES(diagnosed_year), notes = VALUES(notes)`,
            [userId, condition_id, diagnosed_year || null, notes || null]
        );

        return res.json({ success: true, message: 'Medical condition added.' });
    } catch (err) {
        console.error('[AddCondition Error]', err);
        return res.status(500).json({ success: false, message: 'Server error adding condition.' });
    }
};

// 5. REMOVE USER CONDITION
exports.removeCondition = async (req, res) => {
    try {
        const userId = req.user.userId;
        const conditionId = req.params.conditionId;

        await db.query(
            'DELETE FROM user_conditions WHERE user_id = ? AND condition_id = ?',
            [userId, conditionId]
        );

        return res.json({ success: true, message: 'Condition removed.' });
    } catch (err) {
        console.error('[RemoveCondition Error]', err);
        return res.status(500).json({ success: false, message: 'Server error removing condition.' });
    }
};

// 6. ADD USER ALLERGY
exports.addAllergy = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { allergy_id, reaction, notes } = req.body;

        if (!allergy_id) {
            return res.status(400).json({ success: false, message: 'Allergy ID is required.' });
        }

        await db.query(
            `INSERT INTO user_allergies (user_id, allergy_id, reaction, notes)
             VALUES (?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE reaction = VALUES(reaction), notes = VALUES(notes)`,
            [userId, allergy_id, reaction || null, notes || null]
        );

        return res.json({ success: true, message: 'Allergy recorded.' });
    } catch (err) {
        console.error('[AddAllergy Error]', err);
        return res.status(500).json({ success: false, message: 'Server error adding allergy.' });
    }
};

// 7. REMOVE USER ALLERGY
exports.removeAllergy = async (req, res) => {
    try {
        const userId = req.user.userId;
        const allergyId = req.params.allergyId;

        await db.query(
            'DELETE FROM user_allergies WHERE user_id = ? AND allergy_id = ?',
            [userId, allergyId]
        );

        return res.json({ success: true, message: 'Allergy removed.' });
    } catch (err) {
        console.error('[RemoveAllergy Error]', err);
        return res.status(500).json({ success: false, message: 'Server error removing allergy.' });
    }
};

// 8. ADD USER MEDICATION
exports.addMedication = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { medication_id, dosage, frequency } = req.body;

        if (!medication_id) {
            return res.status(400).json({ success: false, message: 'Medication ID is required.' });
        }

        await db.query(
            `INSERT INTO user_medications (user_id, medication_id, dosage, frequency, is_current)
             VALUES (?, ?, ?, ?, TRUE)
             ON DUPLICATE KEY UPDATE dosage = VALUES(dosage), frequency = VALUES(frequency)`,
            [userId, medication_id, dosage || null, frequency || null]
        );

        return res.json({ success: true, message: 'Medication recorded.' });
    } catch (err) {
        console.error('[AddMedication Error]', err);
        return res.status(500).json({ success: false, message: 'Server error adding medication.' });
    }
};

// 9. REMOVE USER MEDICATION
exports.removeMedication = async (req, res) => {
    try {
        const userId = req.user.userId;
        const medicationId = req.params.medicationId;

        await db.query(
            'DELETE FROM user_medications WHERE user_id = ? AND medication_id = ?',
            [userId, medicationId]
        );

        return res.json({ success: true, message: 'Medication removed.' });
    } catch (err) {
        console.error('[RemoveMedication Error]', err);
        return res.status(500).json({ success: false, message: 'Server error removing medication.' });
    }
};
