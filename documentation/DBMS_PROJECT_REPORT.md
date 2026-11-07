# LIFETAG — SMART EMERGENCY IDENTIFICATION & QR PLATFORM
## Comprehensive Academic DBMS Project Report

**Project Title:** LifeTag: Smart Emergency Identification & QR-Based Life-Saving Information Platform  
**Database Name:** `lifetag_db` (MySQL 8.0)  
**Programming & Frameworks:** Node.js (Express), React (Tailwind CSS, Lucide), Java 24 (JDBC 4.x)  
**Academic Requirement:** End-to-End Database Management Systems (DBMS) Capstone Project  

---

## 1. Abstract

During unexpected road traffic accidents, sudden cardiovascular episodes, or acute medical emergencies, victims are frequently unconscious, disoriented, or medically incapable of communicating their identity, vital health history, or family contacts. In conventional scenarios, locked smartphones and misplaced wallets delay notification of family members and hinder first responders from knowing critical contraindications (such as severe penicillin anaphylaxis or bleeding disorders), causing tragic losses during the critical "golden hour."

**LIFETAG** is an innovative, non-invasive, QR-based emergency identification platform. Users register before accidents occur, inputting their blood group, critical allergies, chronic conditions, current medications, emergency precautions, and prioritized family contacts. The platform generates a unique, non-guessable cryptographic QR identifier that can be printed and affixed to motorcycle helmets, bicycles, scooters, wallets, ID lanyards, or wearable medical wristbands. When an emergency strikes, any bystander or paramedic can scan the QR decal with any smartphone camera. **No application download or victim login is required.** The scan immediately opens a high-contrast, mobile-first Emergency Profile displaying pre-authorized medical precautions, blood group, and large one-tap calling buttons to dial family contacts instantly.

This project implements a fully normalized 3NF relational schema in MySQL 8.0, featuring advanced stored procedures, explicit cursors, deterministic functions, and automated business integrity triggers, complemented by a complete Java JDBC DAO implementation and a modern full-stack web application.

---

## 2. Introduction & Problem Statement

### 2.1 The Problem
According to global road safety statistics, over 1.3 million fatalities and tens of millions of serious injuries occur on roads annually. In a significant percentage of two-wheeler crashes:
1. **Victims are Unconscious:** Unable to speak or provide personal identification.
2. **Locked Smartphones:** Modern mobile phones are locked by biometrics or passcodes, preventing bystanders or police from contacting family members.
3. **Delayed Blood Transfusions:** Paramedics lack on-site knowledge of the victim's blood group.
4. **Contraindicated Drug Administration:** Severe drug allergies (e.g., Penicillin, NSAIDs) are unknown at the point of primary care, risking anaphylactic shock.
5. **Lack of Family Communication:** Relatives often remain unaware of an accident for hours until formal police identification occurs.

### 2.2 The LifeTag Solution
"When you can't speak, let Lifetag speak for you."  
LifeTag bridges the critical gap between accident occurrence and hospital arrival. By turning ordinary physical items (such as motorcycle helmets, vehicle visors, or wallet cards) into smart life-saving touchpoints, first responders gain immediate, authenticated, and user-controlled medical visibility.

### 2.3 Strict Scope Definition
> **Important Distinction:** Lifetag is **NOT** a Hospital Management System. It deliberately excludes hospital billing, bed allotment, doctor appointment scheduling, doctor rosters, hospital pharmacy management, and patient admission registers. The entire focus remains exclusively on personal emergency identification, QR-based life-saving communication, and immediate bystander-to-family connectivity.

---

## 3. System Architecture & Relational Design

The system is structured across four decoupled architectural layers:

```
[ Client Layer (React 18 + Tailwind) ]
       │  HTTP / REST JSON
[ Application Server (Node.js Express) ]
       │  Connection Pool (mysql2)
[ Database Layer (MySQL 8.0 'lifetag_db') ]
       ▲
       │  JDBC Driver (mysql-connector-j-8.3.0.jar)
[ Academic Java Module (Java 24 DAO Suite) ]
```

### 3.1 Relational Normalization (3NF)
The database schema (`lifetag_db`) was formally decomposed through 1NF, 2NF, and 3NF:
- **1NF (Atomicity):** All repeating multi-valued fields (e.g., lists of allergies, medications, or multiple contact numbers) were eliminated and converted into dedicated row records.
- **2NF (No Partial Dependencies):** Composite key junction relations (`user_allergies`, `user_conditions`, `user_medications`) were decoupled from master catalog tables (`allergies`, `medical_conditions`, `medications`), ensuring non-key attributes depend on the complete candidate key.
- **3NF (No Transitive Dependencies):** Derived attributes (such as `age`) were eliminated from physical storage and calculated dynamically via stored functions (`fn_calculate_age`). Security credentials (`users`) were separated from personal profiles (`user_profiles`), medical dossiers (`medical_profiles`), and privacy configurations (`privacy_settings`).

---

## 4. Advanced SQL Implementation Showcase

The `lifetag_db` database implements all required academic DBMS constructs:

### 4.1 Stored Procedures
1. **`sp_register_user_full`:** Executes atomic user registration across `users`, `user_profiles`, `medical_profiles`, `privacy_settings`, and `qr_tags` inside a transaction block with automatic `ROLLBACK` on exception.
2. **`sp_regenerate_qr_tag`:** Atomically revokes previously active tags for a user, generates a new cryptographic token, and records an audit log.
3. **`sp_record_emergency_scan`:** Logs scan events, detects device types, checks active status, and flags revoked tags as `BLOCKED`.
4. **`sp_user_emergency_summary`:** Uses `IN` and `OUT` parameters to return contact counts, active token strings, readiness percentages, and total scan counts.
5. **`sp_cursor_emergency_dispatch_list`:** Demonstrates an **explicit cursor** that iterates over prioritized emergency contacts to construct an ordered call queue.

### 4.2 Stored Functions
1. **`fn_calculate_age(dob)`:** Deterministically computes precise patient age from `date_of_birth` using `TIMESTAMPDIFF`.
2. **`fn_emergency_risk_index(user_id)`:** Evaluates anaphylactic allergy count and critical conditions to return clinical risk severity tiers (`CRITICAL_ALERT`, `HIGH_ATTENTION`, `MODERATE`, `STANDARD`).
3. **`fn_primary_contact_summary(user_id)`:** Resolves formatted contact string for immediate dispatch display.

### 4.3 Database Triggers
1. **`trg_qr_scan_before_insert` (BEFORE INSERT on `qr_scans`):** Intercepts scan insertions. If the linked QR tag status is not 'Active', automatically forces `scan_status = 'BLOCKED'`.
2. **`trg_case_after_insert` (AFTER INSERT on `emergency_cases`):** Automatically creates a compliance audit record in `audit_logs`.
3. **`trg_qrtag_before_update` (BEFORE UPDATE on `qr_tags`):** Automatically stamps `revoked_at = NOW()` when a tag is revoked.
4. **`trg_profile_after_update` (AFTER UPDATE on `user_profiles`):** Automatically audits profile updates and completion percentage changes.

### 4.4 Analytical Views
1. **`vw_emergency_profile_public`:** Resolves user profile, medical alerts, precautions, and privacy toggles for instant emergency loading.
2. **`vw_active_qr_directory`:** Aggregates active tags with total scan counts and last scanned timestamps.
3. **`vw_user_emergency_readiness`:** Dynamically calculates emergency readiness score (0-100%) based on data completeness.
4. **`vw_scan_activity_feed`:** Feeds real-time scan activity to the user dashboard with GPS and device details.

---

## 5. Java JDBC Academic Module

In accordance with academic DBMS requirements, an independent, modular Java JDBC suite connects directly to `lifetag_db`:

- **`DBConnection.java`:** Encapsulates `com.mysql.cj.jdbc.Driver` initialization and connection establishment from `db.properties`.
- **`UserDAO.java`:** Demonstrates `PreparedStatement`, `ResultSet`, atomic transactions (`setAutoCommit(false)`, `commit()`, `rollback()`), and `Statement.RETURN_GENERATED_KEYS`.
- **`MedicalInfoDAO.java`:** Queries M:N normalized medical records and invokes the stored function `{? = call fn_emergency_risk_index(?)}` via `CallableStatement`.
- **`EmergencyContactDAO.java`:** Manages contact CRUD operations and executes the explicit cursor stored procedure `{CALL sp_cursor_emergency_dispatch_list(?)}`.
- **`QRCodeDAO.java`:** Tests `sp_regenerate_qr_tag`, `sp_record_emergency_scan`, and verifies database trigger behavior.
- **`LifeTagJDBCDemo.java`:** Automated demonstration test runner verifying all 8 JDBC requirements with zero manual intervention.

---

## 6. Frontend & Emergency Mode Highlights

### 6.1 Landing Page
- Headline: *"When You Can't Speak, Let Lifetag Speak for You."*
- Interactive 3D/SVG Motorcycle Helmet simulation with interactive QR scan beam.
- Detailed breakdown of the accident crisis, 3-step workflow, supported accessories, and privacy guarantees.

### 6.2 Emergency Mode (The Centerpiece)
- Accessible at `/emergency/:token` with zero login or password friction.
- High-contrast, mobile-first design with prominent blood group badge.
- Critical allergies highlighted in red alert cards, conditions in amber alert cards.
- Large, touch-friendly `tel:...` calling buttons for primary and secondary emergency contacts.
- Scanner "Share Location" feature with one-time browser GPS permission.
- Emergency alert dispatch generating immediate WhatsApp and SMS links with Google Maps pins.
- Full multilingual support in English, Hindi (हिन्दी), and Tamil (தமிழ்).
- Accessible Large-Font high-contrast reading mode.

### 6.3 QR Studio & 5 Printable Templates
- Generates 5 standardized templates:
  1. Motorcycle Helmet Decal (Chinbar / backshell)
  2. Bicycle & Scooter Visor Decal
  3. Wallet Emergency Card (Credit-card form factor)
  4. Student & Corporate ID Card Attachment
  5. Medical Alert Wristband Strip
- Instant high-resolution PNG download (1200x1200px) and printable PDF sheet generator via `jsPDF`.

---

## 7. Verification & Testing Summary

| Test Domain | Target Feature | Method | Result |
| :--- | :--- | :--- | :---: |
| **Database** | 3NF Schema & Constraints | SQL DDL & Information Schema | **PASS** |
| **Database** | Database Triggers | `trg_qr_scan_before_insert` test | **PASS** (Revoked tag blocked) |
| **Database** | Stored Procedures | `sp_register_user_full`, `sp_user_emergency_summary` | **PASS** |
| **Database** | Stored Functions | `fn_emergency_risk_index`, `fn_calculate_age` | **PASS** |
| **Backend** | User Authentication | Bcrypt comparison & JWT sign | **PASS** |
| **Backend** | Public Emergency Endpoint | `GET /api/emergency/:token` (No auth) | **PASS** |
| **Backend** | Revoked Tag Protection | `GET /api/emergency/LT-MEENA-OLD-TAG-99` | **PASS** (403 Forbidden) |
| **Backend** | Scan Geolocation Logging | `POST /api/emergency/:token/location` | **PASS** |
| **Frontend** | Production Build | Vite 6.0 Rollup compilation | **PASS** (Built in 16.6s) |
| **Frontend** | Emergency Mode Multilingual | EN, HI, TA dictionary toggles | **PASS** |
| **Frontend** | PDF / PNG Decal Export | jsPDF & HTML5 Canvas | **PASS** |
| **Academic** | Java JDBC DAO Suite | Java 24 + Connector/J 8.3.0 | **PASS** (100% tests verified) |

---

## 8. Conclusion

LIFETAG demonstrates that academic DBMS principles—rigorous normalization, transaction isolation, referential integrity, and stored routines—can be directly united with modern full-stack web engineering and human-centered design to produce a real-world, life-saving technology platform. The project stands completely functional, fully tested on local MySQL 8.0, and prepared for final academic defense.
