-- ==========================================================
-- LIFETAG - Triggers (lifetag_db)
-- Academic DBMS Requirement & Business Integrity
-- ==========================================================

USE lifetag_db;

DELIMITER //

-- 1. Trigger: Block scans on Revoked/Lost QR tags
DROP TRIGGER IF EXISTS trg_qr_scan_before_insert //
CREATE TRIGGER trg_qr_scan_before_insert
BEFORE INSERT ON qr_scans
FOR EACH ROW
BEGIN
    DECLARE v_status VARCHAR(20);
    SELECT status INTO v_status FROM qr_tags WHERE qr_id = NEW.qr_id LIMIT 1;

    IF v_status IS NULL OR v_status <> 'Active' THEN
        SET NEW.scan_status = 'BLOCKED';
    END IF;
END //

-- 2. Trigger: Automatically audit new emergency cases
DROP TRIGGER IF EXISTS trg_case_after_insert //
CREATE TRIGGER trg_case_after_insert
AFTER INSERT ON emergency_cases
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (user_id, action, action_time, details)
    VALUES (
        NEW.user_id,
        'EMERGENCY_REPORTED',
        NOW(),
        CONCAT('Emergency Case #', NEW.emergency_id, ' opened at ', IFNULL(NEW.location_name, 'Unknown Coordinates'))
    );
END //

-- 3. Trigger: Set revoked_at timestamp when QR tag is revoked
DROP TRIGGER IF EXISTS trg_qrtag_before_update //
CREATE TRIGGER trg_qrtag_before_update
BEFORE UPDATE ON qr_tags
FOR EACH ROW
BEGIN
    IF NEW.status = 'Revoked' AND OLD.status <> 'Revoked' THEN
        SET NEW.revoked_at = NOW();
    END IF;
END //

-- 4. Trigger: Log user profile updates to audit_logs
DROP TRIGGER IF EXISTS trg_profile_after_update //
CREATE TRIGGER trg_profile_after_update
AFTER UPDATE ON user_profiles
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (user_id, action, action_time, details)
    VALUES (
        NEW.user_id,
        'PROFILE_UPDATED',
        NOW(),
        CONCAT('User profile updated for ', NEW.full_name, '. Completion: ', NEW.completion_percentage, '%')
    );
END //

DELIMITER ;
