-- ==========================================================
-- LIFETAG - Smart Emergency Identification Platform
-- Database Schema: lifetag_db (MySQL 8.0)
-- 3NF Normalized relational schema
-- ==========================================================

CREATE DATABASE IF NOT EXISTS lifetag_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE lifetag_db;

-- Switch off safe updates for setup scripts
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------------------------------------
-- 1. USERS: Core credentials and account authentication
-- ----------------------------------------------------------
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS emergency_cases;
DROP TABLE IF EXISTS qr_scans;
DROP TABLE IF EXISTS qr_tags;
DROP TABLE IF EXISTS privacy_settings;
DROP TABLE IF EXISTS emergency_contacts;
DROP TABLE IF EXISTS user_medications;
DROP TABLE IF EXISTS medications;
DROP TABLE IF EXISTS user_allergies;
DROP TABLE IF EXISTS allergies;
DROP TABLE IF EXISTS user_conditions;
DROP TABLE IF EXISTS medical_conditions;
DROP TABLE IF EXISTS medical_profiles;
DROP TABLE IF EXISTS user_profiles;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE users (
    user_id        INT AUTO_INCREMENT PRIMARY KEY,
    email          VARCHAR(100) NOT NULL UNIQUE,
    password_hash  VARCHAR(255) NOT NULL,
    role           ENUM('USER', 'ADMIN') NOT NULL DEFAULT 'USER',
    is_active      BOOLEAN NOT NULL DEFAULT TRUE,
    created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_email (email)
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- 2. USER_PROFILES: 1-to-1 personal details & vital stats
-- ----------------------------------------------------------
CREATE TABLE user_profiles (
    profile_id            INT AUTO_INCREMENT PRIMARY KEY,
    user_id               INT NOT NULL UNIQUE,
    full_name             VARCHAR(100) NOT NULL,
    date_of_birth         DATE NOT NULL,
    gender                ENUM('Male', 'Female', 'Other', 'Prefer not to say') NOT NULL DEFAULT 'Prefer not to say',
    blood_group           VARCHAR(5) NOT NULL,
    phone                 VARCHAR(20) NOT NULL,
    address               VARCHAR(255) NULL,
    city                  VARCHAR(80) NULL,
    photo_url             VARCHAR(255) NULL,
    profile_code          VARCHAR(30) NOT NULL UNIQUE,
    completion_percentage INT NOT NULL DEFAULT 40,
    created_at            DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at            DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_profile_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT chk_blood_group CHECK (blood_group IN ('A+','A-','B+','B-','AB+','AB-','O+','O-')),
    INDEX idx_profile_name (full_name),
    INDEX idx_profile_code (profile_code)
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- 3. MEDICAL_PROFILES: 1-to-1 emergency precautions & vital notes
-- ----------------------------------------------------------
CREATE TABLE medical_profiles (
    medical_id       INT AUTO_INCREMENT PRIMARY KEY,
    user_id          INT NOT NULL UNIQUE,
    blood_group      VARCHAR(5) NOT NULL,
    precautions      TEXT NULL,
    disability_info  VARCHAR(255) NULL,
    emergency_notes  TEXT NULL,
    organ_donor      BOOLEAN NOT NULL DEFAULT FALSE,
    last_updated     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_medical_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT chk_med_blood_group CHECK (blood_group IN ('A+','A-','B+','B-','AB+','AB-','O+','O-'))
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- 4. MEDICAL_CONDITIONS Catalog (Normalized 1NF, 2NF, 3NF)
-- ----------------------------------------------------------
CREATE TABLE medical_conditions (
    condition_id INT AUTO_INCREMENT PRIMARY KEY,
    name         VARCHAR(100) NOT NULL UNIQUE,
    severity     ENUM('Low', 'Moderate', 'High', 'Critical') NOT NULL DEFAULT 'Moderate',
    description  VARCHAR(255) NULL
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- 5. USER_CONDITIONS: M:N Junction table
-- ----------------------------------------------------------
CREATE TABLE user_conditions (
    user_id        INT NOT NULL,
    condition_id   INT NOT NULL,
    diagnosed_year INT NULL,
    notes          VARCHAR(255) NULL,
    PRIMARY KEY (user_id, condition_id),
    CONSTRAINT fk_ucond_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_ucond_cond FOREIGN KEY (condition_id) REFERENCES medical_conditions(condition_id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- 6. ALLERGIES Catalog (Normalized 1NF, 2NF, 3NF)
-- ----------------------------------------------------------
CREATE TABLE allergies (
    allergy_id     INT AUTO_INCREMENT PRIMARY KEY,
    name           VARCHAR(100) NOT NULL UNIQUE,
    category       ENUM('Food', 'Drug', 'Environmental', 'Insect', 'Other') NOT NULL DEFAULT 'Other',
    critical_level ENUM('Mild', 'Moderate', 'Severe', 'Anaphylactic') NOT NULL DEFAULT 'Severe'
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- 7. USER_ALLERGIES: M:N Junction table
-- ----------------------------------------------------------
CREATE TABLE user_allergies (
    user_id    INT NOT NULL,
    allergy_id INT NOT NULL,
    reaction   VARCHAR(255) NULL,
    notes      VARCHAR(255) NULL,
    PRIMARY KEY (user_id, allergy_id),
    CONSTRAINT fk_uallergy_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_uallergy_allg FOREIGN KEY (allergy_id) REFERENCES allergies(allergy_id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- 8. MEDICATIONS Catalog (Normalized 1NF, 2NF, 3NF)
-- ----------------------------------------------------------
CREATE TABLE medications (
    medication_id INT AUTO_INCREMENT PRIMARY KEY,
    name          VARCHAR(100) NOT NULL UNIQUE,
    category      VARCHAR(100) NULL
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- 9. USER_MEDICATIONS: M:N Junction table
-- ----------------------------------------------------------
CREATE TABLE user_medications (
    user_id       INT NOT NULL,
    medication_id INT NOT NULL,
    dosage        VARCHAR(100) NULL,
    frequency     VARCHAR(100) NULL,
    is_current    BOOLEAN NOT NULL DEFAULT TRUE,
    PRIMARY KEY (user_id, medication_id),
    CONSTRAINT fk_umed_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_umed_med  FOREIGN KEY (medication_id) REFERENCES medications(medication_id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- 10. EMERGENCY_CONTACTS: 1:N emergency contacts
-- ----------------------------------------------------------
CREATE TABLE emergency_contacts (
    contact_id    INT AUTO_INCREMENT PRIMARY KEY,
    user_id       INT NOT NULL,
    contact_name  VARCHAR(100) NOT NULL,
    relationship  VARCHAR(50) NOT NULL,
    primary_phone VARCHAR(20) NOT NULL,
    alt_phone     VARCHAR(20) NULL,
    priority      INT NOT NULL DEFAULT 1,
    is_primary    BOOLEAN NOT NULL DEFAULT FALSE,
    created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_contact_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_contact_user_priority (user_id, priority)
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- 11. QR_TAGS: 1:N unique cryptographic QR tokens
-- ----------------------------------------------------------
CREATE TABLE qr_tags (
    qr_id      INT AUTO_INCREMENT PRIMARY KEY,
    user_id    INT NOT NULL,
    qr_token   VARCHAR(64) NOT NULL UNIQUE,
    qr_url     VARCHAR(255) NOT NULL,
    status     ENUM('Active', 'Revoked', 'Lost', 'Inactive') NOT NULL DEFAULT 'Active',
    label      VARCHAR(50) NOT NULL DEFAULT 'Motorcycle Helmet Tag',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    revoked_at DATETIME NULL,
    CONSTRAINT fk_qrtag_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_qrtag_token (qr_token),
    INDEX idx_qrtag_user_status (user_id, status)
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- 12. QR_SCANS: Log of every scan event
-- ----------------------------------------------------------
CREATE TABLE qr_scans (
    scan_id     INT AUTO_INCREMENT PRIMARY KEY,
    qr_id       INT NOT NULL,
    scan_time   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ip_address  VARCHAR(45) NULL,
    user_agent  VARCHAR(255) NULL,
    device_type VARCHAR(50) NOT NULL DEFAULT 'Mobile',
    latitude    DECIMAL(10, 7) NULL,
    longitude   DECIMAL(10, 7) NULL,
    city        VARCHAR(100) NULL,
    scan_status ENUM('SUCCESS', 'BLOCKED', 'FLAGGED') NOT NULL DEFAULT 'SUCCESS',
    CONSTRAINT fk_qrscan_tag FOREIGN KEY (qr_id) REFERENCES qr_tags(qr_id) ON DELETE CASCADE,
    INDEX idx_scan_qr_time (qr_id, scan_time)
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- 13. PRIVACY_SETTINGS: Granular controls over emergency scans
-- ----------------------------------------------------------
CREATE TABLE privacy_settings (
    privacy_id              INT AUTO_INCREMENT PRIMARY KEY,
    user_id                 INT NOT NULL UNIQUE,
    show_photo              BOOLEAN NOT NULL DEFAULT TRUE,
    show_blood_group        BOOLEAN NOT NULL DEFAULT TRUE,
    show_allergies          BOOLEAN NOT NULL DEFAULT TRUE,
    show_conditions         BOOLEAN NOT NULL DEFAULT TRUE,
    show_medications        BOOLEAN NOT NULL DEFAULT TRUE,
    show_precautions        BOOLEAN NOT NULL DEFAULT TRUE,
    show_disability         BOOLEAN NOT NULL DEFAULT TRUE,
    show_address            BOOLEAN NOT NULL DEFAULT FALSE,
    show_secondary_contacts BOOLEAN NOT NULL DEFAULT TRUE,
    allow_location_prompt   BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at              DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_privacy_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- 14. EMERGENCY_CASES: Incident incident tracking
-- ----------------------------------------------------------
CREATE TABLE emergency_cases (
    emergency_id  INT AUTO_INCREMENT PRIMARY KEY,
    user_id       INT NOT NULL,
    scan_id       INT NULL,
    reported_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    location_name VARCHAR(150) NULL,
    latitude      DECIMAL(10, 7) NULL,
    longitude     DECIMAL(10, 7) NULL,
    description   VARCHAR(255) NULL,
    status        ENUM('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED') NOT NULL DEFAULT 'OPEN',
    resolved_time DATETIME NULL,
    CONSTRAINT fk_case_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_case_scan FOREIGN KEY (scan_id) REFERENCES qr_scans(scan_id) ON DELETE SET NULL,
    INDEX idx_case_status (status)
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- 15. NOTIFICATIONS: Dispatch history to contacts
-- ----------------------------------------------------------
CREATE TABLE notifications (
    notification_id   INT AUTO_INCREMENT PRIMARY KEY,
    emergency_id      INT NOT NULL,
    contact_id        INT NOT NULL,
    sent_time         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    notification_type ENUM('SMS', 'WHATSAPP', 'EMAIL', 'SYSTEM') NOT NULL DEFAULT 'SYSTEM',
    status            ENUM('PENDING', 'SENT', 'DELIVERED', 'FAILED') NOT NULL DEFAULT 'SENT',
    message_payload   TEXT NULL,
    CONSTRAINT fk_notif_case    FOREIGN KEY (emergency_id) REFERENCES emergency_cases(emergency_id) ON DELETE CASCADE,
    CONSTRAINT fk_notif_contact FOREIGN KEY (contact_id)   REFERENCES emergency_contacts(contact_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- 16. AUDIT_LOGS: System compliance & security logging
-- ----------------------------------------------------------
CREATE TABLE audit_logs (
    log_id      INT AUTO_INCREMENT PRIMARY KEY,
    user_id     INT NULL,
    action      VARCHAR(100) NOT NULL,
    action_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ip_address  VARCHAR(45) NULL,
    details     TEXT NULL,
    CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
    INDEX idx_audit_time (action_time)
) ENGINE=InnoDB;
