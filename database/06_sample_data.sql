-- ==========================================================
-- LIFETAG - Seed & Sample Data (lifetag_db)
-- Comprehensive realistic dataset for Emergency Testing
-- ==========================================================

USE lifetag_db;

-- ----------------------------------------------------------
-- 1. Master Catalogs
-- ----------------------------------------------------------
INSERT INTO medical_conditions (name, severity, description) VALUES
('Asthma', 'Moderate', 'Chronic respiratory condition with airway constriction'),
('Type 1 Diabetes', 'High', 'Insulin-dependent autoimmune condition; hypoglycemia risk'),
('Type 2 Diabetes', 'Moderate', 'Adult-onset insulin resistance; oral medication management'),
('Hypertension', 'Moderate', 'Chronic elevated arterial blood pressure'),
('Coronary Artery Disease', 'Critical', 'Compromised myocardial blood supply; cardiac arrest risk'),
('Epilepsy', 'Critical', 'Neurological disorder characterized by recurrent unprovoked seizures'),
('Severe Hemophilia', 'Critical', 'Genetic blood clotting factor deficiency; uncontrolled bleeding risk'),
('Chronic Kidney Disease', 'High', 'Reduced glomerular filtration; dialysis/transplant consideration'),
('Hypothyroidism', 'Low', 'Underactive thyroid gland managed with levothyroxine')
ON DUPLICATE KEY UPDATE name=name;

INSERT INTO allergies (name, category, critical_level) VALUES
('Penicillin & Beta-lactams', 'Drug', 'Anaphylactic'),
('Peanuts & Tree Nuts', 'Food', 'Anaphylactic'),
('Sulfa Drugs (Sulfonamides)', 'Drug', 'Severe'),
('Latex & Natural Rubber', 'Environmental', 'Moderate'),
('Ibuprofen & NSAIDs', 'Drug', 'Severe'),
('Bee & Wasp Venom', 'Insect', 'Anaphylactic'),
('Shellfish & Crustaceans', 'Food', 'Severe'),
('Ciprofloxacin', 'Drug', 'Moderate'),
('Contrast Dye (Iodinated)', 'Drug', 'Severe')
ON DUPLICATE KEY UPDATE name=name;

INSERT INTO medications (name, category) VALUES
('Salbutamol Inhaler (100mcg)', 'Bronchodilator'),
('Insulin Glargine (Lantus)', 'Basal Insulin'),
('Amlodipine (5mg)', 'Calcium Channel Blocker'),
('Aspirin (75mg)', 'Antiplatelet / Antithrombotic'),
('Levetiracetam (500mg)', 'Anticonvulsant / Antiepileptic'),
('Metformin (500mg)', 'Oral Hypoglycemic'),
('Clopidogrel (75mg)', 'Antiplatelet'),
('EpiPen Auto-Injector (0.3mg)', 'Emergency Sympathomimetic'),
('Atorvastatin (20mg)', 'Statin / Lipid-lowering'),
('Levothyroxine (50mcg)', 'Thyroid Hormone')
ON DUPLICATE KEY UPDATE name=name;

-- ----------------------------------------------------------
-- 2. Core Users & Credentials
-- Password for all seed users is: Password@123
-- Hash: $2a$10$/jc3yAo2jjtkqabvenLtHef3ofFvc4ToKhkLr9YOLRHI5b5IaW9Fq
-- ----------------------------------------------------------
INSERT INTO users (user_id, email, password_hash, role, is_active) VALUES
(1, 'sudarsan@lifetag.in', '$2a$10$/jc3yAo2jjtkqabvenLtHef3ofFvc4ToKhkLr9YOLRHI5b5IaW9Fq', 'ADMIN', TRUE),
(2, 'priya.sharma@lifetag.in', '$2a$10$/jc3yAo2jjtkqabvenLtHef3ofFvc4ToKhkLr9YOLRHI5b5IaW9Fq', 'USER', TRUE),
(3, 'arjun.reddy@lifetag.in', '$2a$10$/jc3yAo2jjtkqabvenLtHef3ofFvc4ToKhkLr9YOLRHI5b5IaW9Fq', 'USER', TRUE),
(4, 'meena.iyer@lifetag.in', '$2a$10$/jc3yAo2jjtkqabvenLtHef3ofFvc4ToKhkLr9YOLRHI5b5IaW9Fq', 'USER', TRUE),
(5, 'rahul.verma@lifetag.in', '$2a$10$/jc3yAo2jjtkqabvenLtHef3ofFvc4ToKhkLr9YOLRHI5b5IaW9Fq', 'USER', TRUE)
ON DUPLICATE KEY UPDATE email=email;

-- ----------------------------------------------------------
-- 3. User Profiles
-- ----------------------------------------------------------
INSERT INTO user_profiles (
    user_id, full_name, date_of_birth, gender, blood_group, phone, address, city, photo_url, profile_code, completion_percentage
) VALUES
(1, 'Sudarsan V', '2004-01-06', 'Male', 'A+', '+91 6302620295', 'Beach Road, East Point Colony', 'Visakhapatnam', '/uploads/avatars/sudarsan.jpg', 'LT-00001', 95),
(2, 'Priya Sharma', '1998-03-14', 'Female', 'O+', '+91 9840011122', 'Anna Nagar West Extension', 'Chennai', '/uploads/avatars/priya.jpg', 'LT-00002', 90),
(3, 'Arjun Reddy', '1985-07-22', 'Male', 'B+', '+91 9000012345', 'Banjara Hills Road No 12', 'Hyderabad', '/uploads/avatars/arjun.jpg', 'LT-00003', 85),
(4, 'Meena Iyer', '1961-04-02', 'Female', 'A+', '+91 9840033344', 'Mylapore Temple Street', 'Chennai', '/uploads/avatars/meena.jpg', 'LT-00004', 90),
(5, 'Rahul Verma', '2001-05-30', 'Male', 'O-', '+91 9886012345', 'Indiranagar 100ft Road', 'Bengaluru', '/uploads/avatars/rahul.jpg', 'LT-00005', 80)
ON DUPLICATE KEY UPDATE full_name=full_name;

-- ----------------------------------------------------------
-- 4. Medical Profiles
-- ----------------------------------------------------------
INSERT INTO medical_profiles (
    user_id, blood_group, precautions, disability_info, emergency_notes, organ_donor
) VALUES
(1, 'A+', 'Keep calm during asthma attack. Inhaler stored in right jacket pocket.', 'None', 'Asthma triggered by intense dust or sudden temperature drop.', TRUE),
(2, 'O+', 'DO NOT administer IV Penicillin. Carry glucose gel for hypoglycemia.', 'None', 'Patient wears continuous glucose monitor on left arm.', TRUE),
(3, 'B+', 'Monitor blood pressure during severe trauma. No beta blockers without clearance.', 'None', 'History of hypertensive crisis under acute shock.', FALSE),
(4, 'A+', 'Strictly NO Sulfa drugs. Patient has coronary stent placed in 2023.', 'Mild mobility impairment', 'Keep upright if experiencing shortness of breath; call cardiologist.', TRUE),
(5, 'O-', 'Universal blood donor. Carry EpiPen for accidental peanut exposure.', 'None', 'Anaphylaxis protocol: Administer EpiPen into mid-outer thigh immediately.', TRUE)
ON DUPLICATE KEY UPDATE blood_group=blood_group;

-- ----------------------------------------------------------
-- 5. User Medical Conditions
-- ----------------------------------------------------------
INSERT INTO user_conditions (user_id, condition_id, diagnosed_year, notes) VALUES
(1, 1, 2015, 'Exercise-induced mild persistent asthma'),
(2, 2, 2012, 'Type 1 Diabetes Mellitus under basal-bolus regimen'),
(3, 4, 2019, 'Primary essential hypertension'),
(4, 5, 2021, 'Triple vessel coronary disease with DES stenting'),
(5, 7, 2010, 'Controlled under pediatric hematology care')
ON DUPLICATE KEY UPDATE notes=notes;

-- ----------------------------------------------------------
-- 6. User Allergies
-- ----------------------------------------------------------
INSERT INTO user_allergies (user_id, allergy_id, reaction, notes) VALUES
(1, 4, 'Skin rash and contact dermatitis', 'Avoid latex gloves during examination'),
(2, 1, 'Severe Anaphylaxis with laryngeal edema', 'STRICT CONTRAINDICATION: All beta-lactams'),
(4, 3, 'Stevens-Johnson Syndrome like rash', 'Sulfa antibiotics forbidden'),
(5, 2, 'Airway swelling, cyanosis, shock', 'Carry EpiPen at all times; requires ER transfer')
ON DUPLICATE KEY UPDATE reaction=reaction;

-- ----------------------------------------------------------
-- 7. User Medications
-- ----------------------------------------------------------
INSERT INTO user_medications (user_id, medication_id, dosage, frequency, is_current) VALUES
(1, 1, '2 puffs', 'As needed for wheezing', TRUE),
(2, 2, '18 units', 'Once daily at bedtime', TRUE),
(3, 3, '5mg', 'Once daily in the morning', TRUE),
(4, 4, '75mg', 'Once daily post lunch', TRUE),
(4, 7, '75mg', 'Once daily with water', TRUE),
(5, 8, '0.3mg auto-injector', 'Immediate emergency use upon allergen exposure', TRUE)
ON DUPLICATE KEY UPDATE dosage=dosage;

-- ----------------------------------------------------------
-- 8. Emergency Contacts (One-tap calling & priority)
-- ----------------------------------------------------------
INSERT INTO emergency_contacts (user_id, contact_name, relationship, primary_phone, alt_phone, priority, is_primary) VALUES
(1, 'Srinivas V', 'Father', '+91 6302620295', '+91 8912345678', 1, TRUE),
(1, 'Padma V', 'Mother', '+91 6302620296', NULL, 2, FALSE),
(2, 'Ravi Sharma', 'Husband', '+91 9840011122', '+91 9840099988', 1, TRUE),
(2, 'Meena Iyer', 'Mother', '+91 9840033344', NULL, 2, FALSE),
(3, 'Sneha Reddy', 'Wife', '+91 9000012345', '+91 9000054321', 1, TRUE),
(4, 'Priya Sharma', 'Daughter', '+91 9840011122', NULL, 1, TRUE),
(4, 'Dr. R. Ramanathan', 'Primary Cardiologist', '+91 9444055566', '+91 04428334455', 2, FALSE),
(5, 'Neha Verma', 'Sister', '+91 9886012345', NULL, 1, TRUE)
ON DUPLICATE KEY UPDATE contact_name=contact_name;

-- ----------------------------------------------------------
-- 9. Privacy Settings
-- ----------------------------------------------------------
INSERT INTO privacy_settings (
    user_id, show_photo, show_blood_group, show_allergies, show_conditions,
    show_medications, show_precautions, show_disability, show_address,
    show_secondary_contacts, allow_location_prompt
) VALUES
(1, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, FALSE, TRUE, TRUE),
(2, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, FALSE, TRUE, TRUE),
(3, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, FALSE, TRUE, TRUE),
(4, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE,  TRUE, TRUE),
(5, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, FALSE, TRUE, TRUE)
ON DUPLICATE KEY UPDATE show_photo=show_photo;

-- ----------------------------------------------------------
-- 10. QR Tags (Cryptographic public identifiers)
-- ----------------------------------------------------------
INSERT INTO qr_tags (qr_id, user_id, qr_token, qr_url, status, label, created_at) VALUES
(1, 1, 'LT-SUDHA-A1B2C3D4E5', 'http://localhost:5000/emergency/LT-SUDHA-A1B2C3D4E5', 'Active', 'AGV Helmet Front Sticker', '2026-09-08 10:00:00'),
(2, 2, 'LT-PRIYA-F6G7H8J9K0', 'http://localhost:5000/emergency/LT-PRIYA-F6G7H8J9K0', 'Active', 'Vespa Scooter Visor Tag', '2026-09-10 11:30:00'),
(3, 3, 'LT-ARJUN-L1M2N3P4Q5', 'http://localhost:5000/emergency/LT-ARJUN-L1M2N3P4Q5', 'Active', 'Wallet ID Card Tag', '2026-09-12 14:15:00'),
(4, 4, 'LT-MEENA-OLD-TAG-99', 'http://localhost:5000/emergency/LT-MEENA-OLD-TAG-99', 'Revoked', 'Lost Keychain Tag', '2026-05-01 09:00:00'),
(5, 4, 'LT-MEENA-R6S7T8U9V0', 'http://localhost:5000/emergency/LT-MEENA-R6S7T8U9V0', 'Active', 'Medical Wristband Tag', '2026-09-15 16:45:00'),
(6, 5, 'LT-RAHUL-W1X2Y3Z4A5', 'http://localhost:5000/emergency/LT-RAHUL-W1X2Y3Z4A5', 'Active', 'KTM Duke Helmet Tag', '2026-09-18 18:20:00')
ON DUPLICATE KEY UPDATE qr_token=qr_token;

-- ----------------------------------------------------------
-- 11. QR Scans History
-- ----------------------------------------------------------
INSERT INTO qr_scans (scan_id, qr_id, scan_time, ip_address, user_agent, device_type, latitude, longitude, city, scan_status) VALUES
(1, 1, '2026-10-01 10:30:00', '106.51.72.10', 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)', 'iPhone 15 Pro', 17.686816, 83.218482, 'Visakhapatnam, Andhra Pradesh', 'SUCCESS'),
(2, 1, '2026-10-15 15:45:12', '122.161.45.22', 'Mozilla/5.0 (Linux; Android 14; Pixel 8)', 'Google Pixel 8', 17.728900, 83.315600, 'Visakhapatnam, Andhra Pradesh', 'SUCCESS'),
(3, 2, '2026-10-18 09:12:00', '49.207.210.5', 'Mozilla/5.0 (Linux; Android 13; Samsung Galaxy S23)', 'Samsung Galaxy S23', 13.082680, 80.270721, 'Chennai, Tamil Nadu', 'SUCCESS'),
(4, 4, '2026-10-20 18:00:00', '157.48.12.90', 'Mozilla/5.0 (iPhone; iOS 16_6)', 'iPhone 13', 13.041800, 80.250700, 'Chennai, Tamil Nadu', 'BLOCKED'),
(5, 5, '2026-10-22 11:25:30', '157.48.12.90', 'Mozilla/5.0 (iPhone; iOS 17_1)', 'iPhone 14', 13.041800, 80.250700, 'Chennai, Tamil Nadu', 'SUCCESS')
ON DUPLICATE KEY UPDATE scan_time=scan_time;

-- ----------------------------------------------------------
-- 12. Emergency Cases & Notifications
-- ----------------------------------------------------------
INSERT INTO emergency_cases (emergency_id, user_id, scan_id, reported_time, location_name, latitude, longitude, description, status) VALUES
(1, 1, 1, '2026-10-01 10:32:00', 'RK Beach Road Junction, Visakhapatnam', 17.686816, 83.218482, 'Minor two-wheeler skid. Bystander scanned helmet tag.', 'RESOLVED'),
(2, 2, 3, '2026-10-18 09:14:00', 'Anna Nagar Roundtana, Chennai', 13.082680, 80.270721, 'Sudden hypoglycemia episode. Bystander contacted husband.', 'RESOLVED')
ON DUPLICATE KEY UPDATE description=description;

INSERT INTO notifications (emergency_id, contact_id, sent_time, notification_type, status, message_payload) VALUES
(1, 1, '2026-10-01 10:32:05', 'SMS', 'DELIVERED', 'LIFETAG ALERT: Sudarsan V helmet tag scanned at RK Beach Road, Visakhapatnam. Emergency profile viewed.'),
(2, 3, '2026-10-18 09:14:10', 'WHATSAPP', 'DELIVERED', 'LIFETAG ALERT: Priya Sharma emergency tag scanned at Anna Nagar, Chennai. Please call immediately.')
ON DUPLICATE KEY UPDATE message_payload=message_payload;
