# LIFETAG — Smart Emergency Identification & QR Platform
> *"When You Can't Speak, Let Lifetag Speak for You."*

**Academic Requirement:** End-to-End Database Management Systems (DBMS) Capstone Project  
**Database:** MySQL 8.0 (`lifetag_db`)  
**Backend:** Node.js (Express), `mysql2`, `bcryptjs`, `jsonwebtoken`  
**Frontend:** React 18, Tailwind CSS, Lucide Icons, Vite  
**Academic Connectivity Module:** Java 24, JDBC 4.x, MySQL Connector/J 8.3.0  

---

## 1. Project Overview

**LIFETAG** is an emergency identification and medical precautions platform designed for road accident victims, commuters, and people with acute health conditions. 

- Users register before an accident happens, providing their blood group, life-threatening allergies, chronic conditions, medications, precautions, and prioritized family contacts.
- A unique cryptographic QR code is generated.
- The user attaches the QR decal to **motorcycle helmets**, **bicycles/scooters**, **wallets**, **ID cards**, or **wearable medical wristbands**.
- When an accident occurs, any bystander or first responder scans the QR code with a smartphone camera.
- **NO LOGIN IS REQUIRED FOR THE SCANNER.** The emergency profile opens instantly, displaying authorized medical precautions, blood group, and large **CALL NOW** buttons to contact registered relatives.
- The scanner can also share one-time GPS accident coordinates with the victim's family with a single tap.

---

## 2. Project Folder Structure

```
LIFETAG/
├── backend/
│   ├── config/             # MySQL connection pool (mysql2)
│   ├── controllers/        # Auth, Profile, Medical, Contacts, Privacy, QR, Emergency
│   ├── middleware/         # JWT Bearer authentication middleware
│   ├── routes/             # REST API routes (/api/...)
│   ├── public/uploads/     # User avatar images
│   ├── server.js           # Express main server (Serves API & Frontend bundle)
│   └── test_api.js         # Automated backend test suite
│
├── frontend/
│   ├── src/
│   │   ├── components/     # Navbar, Footer
│   │   ├── pages/          # LandingPage, Dashboard, ProfileEditor, MedicalEditor,
│   │   │                   # ContactsManager, PrivacySettings, QRStudio, EmergencyMode
│   │   ├── services/       # Central API client (api.js)
│   │   ├── App.jsx         # View router & session manager
│   │   └── main.jsx        # React entry point
│   ├── dist/               # Production build output
│   └── package.json
│
├── database/
│   ├── 01_schema.sql       # 16 normalized tables, FKs, constraints, indexes
│   ├── 02_views.sql        # Public profile & analytical views
│   ├── 03_triggers.sql     # Scan blocker on revoked tags, case audits
│   ├── 04_procedures.sql   # Atomic register, QR regenerate, explicit cursor dispatch
│   ├── 05_functions.sql    # Age calculator, clinical risk tier index
│   ├── 06_sample_data.sql  # 5 realistic users with medical dossiers & active tags
│   ├── 07_advanced_queries.sql # Academic joins, subqueries, cursors demonstration
│   └── setup_db.ps1        # One-click database initializer
│
├── jdbc/
│   ├── lib/                # mysql-connector-j-8.3.0.jar
│   ├── DBConnection.java   # Connection manager from db.properties
│   ├── UserDAO.java        # PreparedStatement, CRUD, atomic transactions
│   ├── MedicalInfoDAO.java # Medical relations & stored function execution
│   ├── EmergencyContactDAO.java # Contact priority & explicit cursor procedure
│   ├── QRCodeDAO.java      # Scan simulation & trigger verification
│   ├── LifeTagJDBCDemo.java# Automated academic test runner
│   ├── db.properties       # JDBC connection settings
│   └── run_jdbc.bat        # One-click Windows compile & run script
│
├── documentation/
│   ├── NORMALIZATION.md    # Formal mathematical 1NF, 2NF, 3NF proof
│   ├── ER_DIAGRAM.md       # Mermaid ER diagram & complete Data Dictionary
│   └── DBMS_PROJECT_REPORT.md # Academic Capstone Project Report
│
└── README.md
```

---

## 3. Seed Accounts for Review & Testing

All seed users are pre-configured with the default password: **`Password@123`**

| Name | Email | Blood Group | Profile Code | Key Medical Condition / Allergy |
| :--- | :--- | :---: | :---: | :--- |
| **Sudarsan V** | `sudarsan@lifetag.in` | **A+** | `LT-00001` | Mild Persistent Asthma (Inhaler) |
| **Priya Sharma** | `priya.sharma@lifetag.in` | **O+** | `LT-00002` | Type 1 Diabetes, **Penicillin Allergy (Anaphylactic)** |
| **Arjun Reddy** | `arjun.reddy@lifetag.in` | **B+** | `LT-00003` | Primary Hypertension |
| **Meena Iyer** | `meena.iyer@lifetag.in` | **A+** | `LT-00004` | Coronary Stent, **Sulfa Drugs Allergy** |
| **Rahul Verma** | `rahul.verma@lifetag.in` | **O-** | `LT-00005` | Universal Blood Donor, **Peanut Allergy (EpiPen)** |

---

## 4. How to Run the Web Application

### Prerequisites:
1. **MySQL 8.0** running on `127.0.0.1:3306` (Database: `lifetag_db`).
2. **Node.js** v20+ / v22+ and npm.

### Step 1: Start the Backend & Web Application Server
Open a terminal in `C:\Projects\Life_Tag\backend` and run:

```bash
cd C:\Projects\Life_Tag\backend
node server.js
```

The server starts on **`http://localhost:5000`**.  
Because the production React frontend is pre-built into `frontend/dist/`, **visiting `http://localhost:5000` in any web browser opens the complete LifeTag web application directly!**

### Step 2 (Optional for Live Frontend Development):
If you want to run the Vite dev server with hot module replacement:
```bash
cd C:\Projects\Life_Tag\frontend
npm run dev
```
Opens on **`http://localhost:5173`** (proxies API requests to port 5000).

---

## 5. How to Test Emergency Scanning (No Login Required)

Open any browser window (or smartphone connected to the local network) and navigate to the public emergency URLs:

1. **Active Motorcycle Helmet Tag (Sudarsan V):**  
   👉 **`http://localhost:5000/emergency/LT-SUDHA-A1B2C3D4E5`**
   - Opens immediately without login.
   - Prominent blood group badge (**A+**).
   - Emergency contacts with large **CALL NOW** buttons.
   - Click **"Share GPS"** to simulate bystander location sharing.
   - Click **"Notify Contacts"** to generate instant WhatsApp/SMS dispatch links.
   - Switch language between **English**, **हिन्दी (Hindi)**, and **தமிழ் (Tamil)**.
   - Toggle **A+ / A-** for Accessible Large-Font reading mode.

2. **Active Scooter Visor Tag (Priya Sharma - Critical Anaphylactic Alert):**  
   👉 **`http://localhost:5000/emergency/LT-PRIYA-F6G7H8J9K0`**
   - Displays prominent red alert card: **STRICT CONTRAINDICATION: Beta-lactams / Penicillin**.

3. **Revoked / Lost Tag (Meena Iyer):**  
   👉 **`http://localhost:5000/emergency/LT-MEENA-OLD-TAG-99`**
   - Displays clear security alert: **"Invalid or Revoked Lifetag: This QR tag has been revoked by the owner."**
   - Triggers MySQL trigger `trg_qr_scan_before_insert` which records the scan status as **`BLOCKED`**.

---

## 6. How to Run the Java JDBC Academic Demonstration

The Java JDBC suite connects directly to `lifetag_db` using `mysql-connector-j-8.3.0.jar`.

### Option A: Windows Batch Script (Double-click)
Navigate to `C:\Projects\Life_Tag\jdbc\` and double-click:
```
run_jdbc.bat
```

### Option B: Terminal Command
```bash
cd C:\Projects\Life_Tag\jdbc
javac -cp "lib\mysql-connector-j-8.3.0.jar;." -d build *.java
java -cp "build;lib\mysql-connector-j-8.3.0.jar;." LifeTagJDBCDemo
```

### Academic Concepts Demonstrated by the Java Runner:
1. **Connection Establishment & Metadata:** Inspects MySQL 8.0 server, driver version, isolation level.
2. **PreparedStatement + ResultSet:** Queries normalized user profiles.
3. **Transaction Management:** Demonstrates atomic insert of user and profile, verifies generated keys, updates records, and executes cascade cleanup.
4. **Stored Functions:** Executes `{? = call fn_emergency_risk_index(?)}` via `CallableStatement`.
5. **Stored Procedures with Explicit Cursors:** Executes `{CALL sp_cursor_emergency_dispatch_list(?)}` to build priority queues.
6. **CallableStatement with OUT Parameters:** Executes `{CALL sp_user_emergency_summary(?, ?, ?, ?, ?)}` retrieving contact counts, active token, and readiness score.
7. **Database Trigger Verification:** Demonstrates scan of active tag (`SUCCESS`) vs scan of revoked tag (`BLOCKED` by `trg_qr_scan_before_insert`).

---

## 7. How to Re-initialize the Database

If you wish to reset or re-seed the MySQL database:
```powershell
cd C:\Projects\Life_Tag
powershell -ExecutionPolicy Bypass -File database\setup_db.ps1
```

---

## 8. License & Academic Disclaimer
Built as an Academic Capstone DBMS Project. Lifetag is an emergency identification platform. It displays authorized personal & emergency contact details to first responders. Lifetag does not replace emergency medical diagnosis, ambulance dispatch, or professional hospital care.
