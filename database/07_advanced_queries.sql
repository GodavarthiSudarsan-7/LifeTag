-- ==========================================================
-- LIFETAG - Advanced DBMS SQL Implementation Showcase
-- Covering all Academic DBMS Syllabus Requirements
-- ==========================================================

USE lifetag_db;

-- ----------------------------------------------------------
-- 1. JOINS DEMONSTRATION
-- ----------------------------------------------------------

-- 1A. INNER JOIN: Retrieve active emergency profiles with primary contact
SELECT 
    p.profile_code,
    p.full_name,
    p.blood_group,
    p.city,
    c.contact_name AS emergency_contact,
    c.relationship,
    c.primary_phone
FROM user_profiles p
INNER JOIN emergency_contacts c 
    ON p.user_id = c.user_id AND c.is_primary = TRUE;

-- 1B. LEFT OUTER JOIN: All users with their registered medical conditions (including users with none)
SELECT 
    p.full_name,
    p.blood_group,
    IFNULL(mc.name, 'No Chronic Conditions') AS condition_name,
    IFNULL(mc.severity, 'N/A') AS severity,
    uc.diagnosed_year
FROM user_profiles p
LEFT OUTER JOIN user_conditions uc ON p.user_id = uc.user_id
LEFT OUTER JOIN medical_conditions mc ON uc.condition_id = mc.condition_id
ORDER BY p.full_name;

-- 1C. RIGHT OUTER JOIN: All medical catalog conditions and which registered users have them
SELECT 
    mc.name AS catalog_condition,
    mc.severity,
    p.full_name AS patient_name
FROM user_conditions uc
JOIN user_profiles p ON uc.user_id = p.user_id
RIGHT OUTER JOIN medical_conditions mc ON uc.condition_id = mc.condition_id
ORDER BY mc.severity DESC;

-- 1D. FULL OUTER JOIN Simulation (MySQL Union of Left and Right):
-- Comprehensive alignment of all allergies catalog items vs diagnosed users
SELECT 
    a.name AS allergy_name,
    a.critical_level,
    p.full_name AS affected_user
FROM allergies a
LEFT JOIN user_allergies ua ON a.allergy_id = ua.allergy_id
LEFT JOIN user_profiles p ON ua.user_id = p.user_id

UNION

SELECT 
    a.name AS allergy_name,
    a.critical_level,
    p.full_name AS affected_user
FROM user_allergies ua
RIGHT JOIN allergies a ON ua.allergy_id = a.allergy_id
LEFT JOIN user_profiles p ON ua.user_id = p.user_id;

-- 1E. SELF JOIN: Compare contacts of the same user to find relationships sharing phone numbers
SELECT 
    c1.user_id,
    c1.contact_name AS contact_1,
    c2.contact_name AS contact_2,
    c1.primary_phone AS shared_phone
FROM emergency_contacts c1
JOIN emergency_contacts c2 
    ON c1.user_id = c2.user_id 
   AND c1.contact_id < c2.contact_id
   AND c1.primary_phone = c2.primary_phone;


-- ----------------------------------------------------------
-- 2. SUBQUERIES DEMONSTRATION
-- ----------------------------------------------------------

-- 2A. Single-Row Subquery: Find user(s) with maximum number of logged emergency scans
SELECT 
    p.full_name,
    p.blood_group,
    p.phone
FROM user_profiles p
WHERE p.user_id = (
    SELECT t.user_id
    FROM qr_tags t
    JOIN qr_scans s ON t.qr_id = s.qr_id
    GROUP BY t.user_id
    ORDER BY COUNT(s.scan_id) DESC
    LIMIT 1
);

-- 2B. Multiple-Row Subquery (IN): Users with Anaphylactic (life-threatening) allergies
SELECT 
    profile_code,
    full_name,
    blood_group,
    city
FROM user_profiles
WHERE user_id IN (
    SELECT ua.user_id
    FROM user_allergies ua
    JOIN allergies a ON ua.allergy_id = a.allergy_id
    WHERE a.critical_level = 'Anaphylactic'
);

-- 2C. Multiple-Row Subquery (ANY / SOME): Users older than ANY user living in Visakhapatnam
SELECT 
    full_name,
    date_of_birth,
    city,
    TIMESTAMPDIFF(YEAR, date_of_birth, CURDATE()) AS age
FROM user_profiles
WHERE date_of_birth < ANY (
    SELECT date_of_birth 
    FROM user_profiles 
    WHERE city = 'Visakhapatnam'
);

-- 2D. Correlated Subquery (EXISTS): Users who have at least one active QR tag with recorded scans
SELECT 
    p.profile_code,
    p.full_name,
    p.city
FROM user_profiles p
WHERE EXISTS (
    SELECT 1
    FROM qr_tags t
    JOIN qr_scans s ON t.qr_id = s.qr_id
    WHERE t.user_id = p.user_id
      AND t.status = 'Active'
);

-- 2E. Correlated Subquery with Aggregation: Users whose emergency readiness is above the platform average
SELECT 
    r1.user_id,
    r1.full_name,
    r1.readiness_score
FROM vw_user_emergency_readiness r1
WHERE r1.readiness_score > (
    SELECT AVG(r2.readiness_score)
    FROM vw_user_emergency_readiness r2
);


-- ----------------------------------------------------------
-- 3. STORED ROUTINES EXECUTION SAMPLES
-- ----------------------------------------------------------

-- 3A. Execute Function: Age and Risk Severity for User 2 (Priya)
SELECT 
    p.full_name,
    fn_calculate_age(p.date_of_birth) AS calculated_age,
    fn_emergency_risk_index(p.user_id) AS clinical_risk_tier,
    fn_primary_contact_summary(p.user_id) AS primary_dispatch_target
FROM user_profiles p
WHERE p.user_id = 2;

-- 3B. Execute Procedure: Call sp_user_emergency_summary with OUT parameters
CALL sp_user_emergency_summary(1, @contacts, @token, @readiness, @scans);
SELECT 
    @contacts  AS total_emergency_contacts,
    @token     AS active_qr_token,
    @readiness AS emergency_readiness_pct,
    @scans     AS total_scans_logged;

-- 3C. Execute Explicit Cursor Procedure: Emergency Call Priority Queue
CALL sp_cursor_emergency_dispatch_list(1);
