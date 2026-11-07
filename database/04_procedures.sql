-- ==========================================================
-- LIFETAG - Stored Procedures (lifetag_db)
-- Academic DBMS Requirement & Atomic Operations
-- ==========================================================

USE lifetag_db;

DELIMITER //

-- 1. Procedure: Atomic Registration with Full Initialization
DROP PROCEDURE IF EXISTS sp_register_user_full //
CREATE PROCEDURE sp_register_user_full(
    IN  p_email         VARCHAR(100),
    IN  p_password_hash VARCHAR(255),
    IN  p_full_name     VARCHAR(100),
    IN  p_dob           DATE,
    IN  p_gender        VARCHAR(20),
    IN  p_blood_group   VARCHAR(5),
    IN  p_phone         VARCHAR(20),
    IN  p_city          VARCHAR(80),
    IN  p_qr_token      VARCHAR(64),
    IN  p_qr_url        VARCHAR(255),
    OUT p_new_user_id   INT
)
proc_label: BEGIN
    DECLARE v_profile_code VARCHAR(30);
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    -- Check if email exists
    IF EXISTS (SELECT 1 FROM users WHERE email = p_email) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Registration failed: Email is already registered in LifeTag.';
    END IF;

    -- 1. Insert user credentials
    INSERT INTO users (email, password_hash, role, is_active)
    VALUES (p_email, p_password_hash, 'USER', TRUE);
    
    SET p_new_user_id = LAST_INSERT_ID();
    SET v_profile_code = CONCAT('LT-', LPAD(p_new_user_id, 5, '0'));

    -- 2. Insert user profile
    INSERT INTO user_profiles (
        user_id, full_name, date_of_birth, gender, blood_group, phone, city, profile_code, completion_percentage
    ) VALUES (
        p_new_user_id, p_full_name, p_dob, p_gender, p_blood_group, p_phone, p_city, v_profile_code, 55
    );

    -- 3. Insert default medical profile
    INSERT INTO medical_profiles (
        user_id, blood_group, precautions, emergency_notes, organ_donor
    ) VALUES (
        p_new_user_id, p_blood_group, 'No specific precautions logged yet.', 'Carry medical card in wallet.', FALSE
    );

    -- 4. Insert default privacy settings
    INSERT INTO privacy_settings (
        user_id, show_photo, show_blood_group, show_allergies, show_conditions,
        show_medications, show_precautions, show_disability, show_address,
        show_secondary_contacts, allow_location_prompt
    ) VALUES (
        p_new_user_id, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, FALSE, TRUE, TRUE
    );

    -- 5. Insert initial primary QR tag
    INSERT INTO qr_tags (
        user_id, qr_token, qr_url, status, label
    ) VALUES (
        p_new_user_id, p_qr_token, p_qr_url, 'Active', 'Primary Helmet Lifetag'
    );

    -- 6. Log registration
    INSERT INTO audit_logs (user_id, action, details)
    VALUES (p_new_user_id, 'USER_REGISTERED', CONCAT('User registered: ', p_full_name, ' (', p_email, ')'));

    COMMIT;
END //


-- 2. Procedure: Regenerate QR Tag (Revokes old active tags and generates new)
DROP PROCEDURE IF EXISTS sp_regenerate_qr_tag //
CREATE PROCEDURE sp_regenerate_qr_tag(
    IN  p_user_id    INT,
    IN  p_new_token  VARCHAR(64),
    IN  p_new_url    VARCHAR(255),
    IN  p_label      VARCHAR(50),
    OUT p_new_qr_id  INT
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    -- Revoke existing active tags for this user
    UPDATE qr_tags
    SET status = 'Revoked', revoked_at = NOW()
    WHERE user_id = p_user_id AND status = 'Active';

    -- Insert newly generated active tag
    INSERT INTO qr_tags (user_id, qr_token, qr_url, status, label)
    VALUES (p_user_id, p_new_token, p_new_url, 'Active', IFNULL(p_label, 'Regenerated Helmet Tag'));

    SET p_new_qr_id = LAST_INSERT_ID();

    INSERT INTO audit_logs (user_id, action, details)
    VALUES (p_user_id, 'QR_REGENERATED', CONCAT('Regenerated tag #', p_new_qr_id, ' with token: ', p_new_token));

    COMMIT;
END //


-- 3. Procedure: Record an Emergency Scan Event
DROP PROCEDURE IF EXISTS sp_record_emergency_scan //
CREATE PROCEDURE sp_record_emergency_scan(
    IN  p_qr_token    VARCHAR(64),
    IN  p_ip          VARCHAR(45),
    IN  p_user_agent  VARCHAR(255),
    IN  p_device_type VARCHAR(50),
    IN  p_lat         DECIMAL(10, 7),
    IN  p_lng         DECIMAL(10, 7),
    IN  p_city        VARCHAR(100),
    OUT p_scan_status VARCHAR(20),
    OUT p_user_id     INT
)
BEGIN
    DECLARE v_qr_id  INT;
    DECLARE v_status VARCHAR(20);

    SELECT qr_id, user_id, status 
    INTO v_qr_id, p_user_id, v_status
    FROM qr_tags
    WHERE qr_token = p_qr_token
    LIMIT 1;

    IF v_qr_id IS NULL THEN
        SET p_scan_status = 'NOT_FOUND';
        SET p_user_id = NULL;
    ELSEIF v_status <> 'Active' THEN
        SET p_scan_status = 'BLOCKED';
        INSERT INTO qr_scans (qr_id, ip_address, user_agent, device_type, latitude, longitude, city, scan_status)
        VALUES (v_qr_id, p_ip, p_user_agent, p_device_type, p_lat, p_lng, p_city, 'BLOCKED');
    ELSE
        SET p_scan_status = 'SUCCESS';
        INSERT INTO qr_scans (qr_id, ip_address, user_agent, device_type, latitude, longitude, city, scan_status)
        VALUES (v_qr_id, p_ip, p_user_agent, p_device_type, p_lat, p_lng, p_city, 'SUCCESS');
    END IF;
END //


-- 4. Procedure: User Emergency Stats Summary (IN & OUT params demonstration)
DROP PROCEDURE IF EXISTS sp_user_emergency_summary //
CREATE PROCEDURE sp_user_emergency_summary(
    IN  p_user_id         INT,
    OUT p_total_contacts  INT,
    OUT p_active_token    VARCHAR(64),
    OUT p_readiness_score INT,
    OUT p_total_scans     INT
)
BEGIN
    SELECT COUNT(*) INTO p_total_contacts
    FROM emergency_contacts
    WHERE user_id = p_user_id;

    SELECT qr_token INTO p_active_token
    FROM qr_tags
    WHERE user_id = p_user_id AND status = 'Active'
    ORDER BY created_at DESC
    LIMIT 1;

    SELECT readiness_score INTO p_readiness_score
    FROM vw_user_emergency_readiness
    WHERE user_id = p_user_id
    LIMIT 1;

    SELECT COUNT(s.scan_id) INTO p_total_scans
    FROM qr_scans s
    JOIN qr_tags t ON s.qr_id = t.qr_id
    WHERE t.user_id = p_user_id;
END //


-- 5. Procedure demonstrating EXPLICIT CURSOR (Academic DBMS requirement)
-- Iterates through emergency contacts to build a formatted dispatch list
DROP PROCEDURE IF EXISTS sp_cursor_emergency_dispatch_list //
CREATE PROCEDURE sp_cursor_emergency_dispatch_list(
    IN p_user_id INT
)
BEGIN
    DECLARE v_done INT DEFAULT FALSE;
    DECLARE v_name VARCHAR(100);
    DECLARE v_rel  VARCHAR(50);
    DECLARE v_phone VARCHAR(20);
    DECLARE v_prio INT;

    -- Declare cursor
    DECLARE cur_contacts CURSOR FOR
        SELECT contact_name, relationship, primary_phone, priority
        FROM emergency_contacts
        WHERE user_id = p_user_id
        ORDER BY priority ASC;

    -- Declare NOT FOUND handler
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_done = TRUE;

    -- Temporary table to hold formatted results
    CREATE TEMPORARY TABLE IF NOT EXISTS tmp_dispatch_queue (
        dispatch_order INT,
        formatted_entry VARCHAR(255)
    );
    DELETE FROM tmp_dispatch_queue;

    OPEN cur_contacts;

    read_loop: LOOP
        FETCH cur_contacts INTO v_name, v_rel, v_phone, v_prio;
        IF v_done THEN
            LEAVE read_loop;
        END IF;

        INSERT INTO tmp_dispatch_queue VALUES (
            v_prio,
            CONCAT('Call Priority #', v_prio, ': ', v_name, ' (', v_rel, ') - Tel: ', v_phone)
        );
    END LOOP;

    CLOSE cur_contacts;

    -- Return the cursor output
    SELECT * FROM tmp_dispatch_queue ORDER BY dispatch_order ASC;
END //

DELIMITER ;
