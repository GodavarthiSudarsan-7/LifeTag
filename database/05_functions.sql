-- ==========================================================
-- LIFETAG - Stored Functions (lifetag_db)
-- Academic DBMS Requirement
-- ==========================================================

USE lifetag_db;

DELIMITER //

-- 1. Function: Calculate exact age from Date of Birth
DROP FUNCTION IF EXISTS fn_calculate_age //
CREATE FUNCTION fn_calculate_age(p_dob DATE)
RETURNS INT
DETERMINISTIC
READS SQL DATA
BEGIN
    IF p_dob IS NULL THEN
        RETURN 0;
    END IF;
    RETURN TIMESTAMPDIFF(YEAR, p_dob, CURDATE());
END //


-- 2. Function: Emergency Medical Risk Index
-- Determines clinical severity tier for first responders
DROP FUNCTION IF EXISTS fn_emergency_risk_index //
CREATE FUNCTION fn_emergency_risk_index(p_user_id INT)
RETURNS VARCHAR(20)
READS SQL DATA
BEGIN
    DECLARE v_anaphylactic_count INT DEFAULT 0;
    DECLARE v_critical_cond_count INT DEFAULT 0;
    DECLARE v_total_conditions INT DEFAULT 0;

    -- Count life-threatening allergies
    SELECT COUNT(*) INTO v_anaphylactic_count
    FROM user_allergies ua
    JOIN allergies a ON ua.allergy_id = a.allergy_id
    WHERE ua.user_id = p_user_id AND a.critical_level = 'Anaphylactic';

    -- Count critical conditions (e.g. Heart Disease, Severe Asthma, Epilepsy)
    SELECT COUNT(*) INTO v_critical_cond_count
    FROM user_conditions uc
    JOIN medical_conditions c ON uc.condition_id = c.condition_id
    WHERE uc.user_id = p_user_id AND c.severity = 'Critical';

    SELECT COUNT(*) INTO v_total_conditions
    FROM user_conditions
    WHERE user_id = p_user_id;

    IF v_anaphylactic_count > 0 OR v_critical_cond_count > 0 THEN
        RETURN 'CRITICAL_ALERT';
    ELSEIF v_total_conditions >= 2 THEN
        RETURN 'HIGH_ATTENTION';
    ELSEIF v_total_conditions = 1 THEN
        RETURN 'MODERATE';
    ELSE
        RETURN 'STANDARD';
    END IF;
END //


-- 3. Function: Primary Contact Quick String
DROP FUNCTION IF EXISTS fn_primary_contact_summary //
CREATE FUNCTION fn_primary_contact_summary(p_user_id INT)
RETURNS VARCHAR(150)
READS SQL DATA
BEGIN
    DECLARE v_summary VARCHAR(150);

    SELECT CONCAT(contact_name, ' (', relationship, ') - ', primary_phone)
    INTO v_summary
    FROM emergency_contacts
    WHERE user_id = p_user_id
    ORDER BY is_primary DESC, priority ASC
    LIMIT 1;

    RETURN IFNULL(v_summary, 'No emergency contact registered');
END //

DELIMITER ;
