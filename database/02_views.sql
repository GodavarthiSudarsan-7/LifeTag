-- ==========================================================
-- LIFETAG - Views Definition (lifetag_db)
-- Academic DBMS Requirement & Application Query Views
-- ==========================================================

USE lifetag_db;

-- 1. View: Complete Emergency Profile for QR Scans
-- Resolves user, active tag, medical profile, and primary contact
CREATE OR REPLACE VIEW vw_emergency_profile_public AS
SELECT 
    t.qr_token,
    t.status AS tag_status,
    u.user_id,
    p.full_name,
    p.photo_url,
    p.blood_group,
    TIMESTAMPDIFF(YEAR, p.date_of_birth, CURDATE()) AS age,
    p.gender,
    p.city,
    m.precautions,
    m.disability_info,
    m.emergency_notes,
    m.organ_donor,
    ps.show_photo,
    ps.show_blood_group,
    ps.show_allergies,
    ps.show_conditions,
    ps.show_medications,
    ps.show_precautions,
    ps.show_disability,
    ps.show_address,
    ps.show_secondary_contacts,
    ps.allow_location_prompt
FROM qr_tags t
JOIN users u ON t.user_id = u.user_id
JOIN user_profiles p ON u.user_id = p.user_id
JOIN medical_profiles m ON u.user_id = m.user_id
JOIN privacy_settings ps ON u.user_id = ps.user_id
WHERE u.is_active = TRUE;

-- 2. View: Active QR Tags Directory with Scan Counts
CREATE OR REPLACE VIEW vw_active_qr_directory AS
SELECT 
    t.qr_id,
    t.user_id,
    p.full_name,
    p.profile_code,
    t.qr_token,
    t.label,
    t.status,
    t.created_at,
    COUNT(s.scan_id) AS total_scans,
    MAX(s.scan_time) AS last_scanned_at
FROM qr_tags t
JOIN user_profiles p ON t.user_id = p.user_id
LEFT JOIN qr_scans s ON t.qr_id = s.qr_id
GROUP BY t.qr_id, t.user_id, p.full_name, p.profile_code, t.qr_token, t.label, t.status, t.created_at;

-- 3. View: Emergency Readiness Score Calculation
-- Computes readiness percentage dynamically based on complete profile data
CREATE OR REPLACE VIEW vw_user_emergency_readiness AS
SELECT 
    u.user_id,
    p.full_name,
    p.blood_group,
    (
        (CASE WHEN p.photo_url IS NOT NULL AND p.photo_url != '' THEN 15 ELSE 0 END) +
        (CASE WHEN p.phone IS NOT NULL AND p.phone != '' THEN 15 ELSE 0 END) +
        (CASE WHEN p.blood_group IS NOT NULL THEN 20 ELSE 0 END) +
        (CASE WHEN (SELECT COUNT(*) FROM emergency_contacts c WHERE c.user_id = u.user_id) >= 1 THEN 25 ELSE 0 END) +
        (CASE WHEN (SELECT COUNT(*) FROM user_conditions uc WHERE uc.user_id = u.user_id) +
                   (SELECT COUNT(*) FROM user_allergies ua WHERE ua.user_id = u.user_id) +
                   (SELECT COUNT(*) FROM user_medications um WHERE um.user_id = u.user_id) > 0 
              THEN 15 ELSE 5 END) +
        (CASE WHEN (SELECT COUNT(*) FROM qr_tags qt WHERE qt.user_id = u.user_id AND qt.status = 'Active') >= 1 THEN 10 ELSE 0 END)
    ) AS readiness_score,
    (SELECT COUNT(*) FROM emergency_contacts c WHERE c.user_id = u.user_id) AS total_contacts,
    (SELECT COUNT(*) FROM qr_tags qt WHERE qt.user_id = u.user_id AND qt.status = 'Active') AS active_tags
FROM users u
JOIN user_profiles p ON u.user_id = p.user_id;

-- 4. View: Scan Logs with Location and User Meta
CREATE OR REPLACE VIEW vw_scan_activity_feed AS
SELECT 
    s.scan_id,
    s.qr_id,
    t.qr_token,
    t.user_id,
    p.full_name AS victim_name,
    s.scan_time,
    s.device_type,
    s.city,
    s.latitude,
    s.longitude,
    s.scan_status
FROM qr_scans s
JOIN qr_tags t ON s.qr_id = t.qr_id
JOIN user_profiles p ON t.user_id = p.user_id;
