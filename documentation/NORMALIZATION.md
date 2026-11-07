# LIFETAG — Relational Database Normalization Analysis
## Demonstration of 1NF, 2NF, and 3NF Decomposition

**Database Name:** `lifetag_db`  
**RDBMS:** MySQL 8.0  
**Project:** LifeTag — Smart Emergency Identification & QR Platform  
**Academic Requirement:** End-to-End Database Management System (DBMS) Project  

---

## 1. Overview of Relational Normalization in LifeTag

Normalization is the formal mathematical technique used in relational database design to eliminate data redundancy, prevent update anomalies, insertion anomalies, and deletion anomalies, while ensuring referential and functional integrity.

In LifeTag, emergency medical records, multi-category allergies, chronic health conditions, active pharmaceuticals, emergency contacts, cryptographic QR tags, and scan logs must be stored with zero ambiguity. First responders require instant, deterministic access to critical life-saving data.

---

## 2. Unnormalized Form (UNF) & 0NF Representation

Consider a traditional, poorly designed emergency system where all data is stored in a single monolithic table:

```
UNF_EMERGENCY_RECORDS(
    user_id, full_name, dob, gender, phone, blood_group, address, city,
    allergies_list,              -- e.g. "Penicillin, Peanuts, Latex" (Repeating group)
    conditions_list,             -- e.g. "Asthma, Diabetes" (Repeating group)
    medications_list,            -- e.g. "Inhaler (2 puffs), Insulin (18 units)" (Repeating group)
    precautions, organ_donor,
    emergency_contacts_data,     -- e.g. "Srinivas (Father: 6302620295); Padma (Mother: 6302620296)" (Non-atomic)
    qr_token, qr_status,
    scan_history_logs            -- e.g. "2026-10-01 at Vizag; 2026-10-15 at Chennai" (Repeating group)
)
```

### Anomalies in UNF:
1. **Insertion Anomaly:** Cannot record a known clinical allergy (e.g., Ciprofloxacin) unless at least one patient is currently registered with it.
2. **Update Anomaly:** If a primary contact changes their phone number, every historical accident case or multiple records must be searched and updated individually. If one row is missed, data becomes inconsistent.
3. **Deletion Anomaly:** If a patient deletes their single registered QR tag, their entire medical history and contact registry could accidentally be purged.

---

## 3. First Normal Form (1NF)

### 1NF Definition:
A relation $R$ is in First Normal Form (1NF) if and only if:
1. Every attribute value is **atomic** (indivisible).
2. There are **no repeating groups** or multi-valued attributes (no comma-separated lists or embedded arrays).
3. Each record is unique and identifiable by a Primary Key.

### Step-by-Step 1NF Decomposition:
To achieve 1NF, we eliminate all multi-valued repeating groups:
- The repeating group `allergies_list` is separated into dedicated individual allergy entity rows.
- The repeating group `conditions_list` is decomposed into individual condition rows.
- The repeating group `medications_list` is decomposed into individual medication rows.
- The repeating group `emergency_contacts_data` is split so each contact occupies a distinct atomic tuple.
- The repeating group `scan_history_logs` is factored out into individual timestamped scan tuples.

#### Resulting 1NF Table Structure:
```
USERS_1NF(user_id, email, password_hash, full_name, dob, gender, blood_group, phone, city)
USER_ALLERGIES_1NF(user_id, allergy_name, allergy_category, allergy_critical_level, reaction)
USER_CONDITIONS_1NF(user_id, condition_name, condition_severity, diagnosed_year)
USER_MEDICATIONS_1NF(user_id, medication_name, medication_category, dosage, frequency)
USER_CONTACTS_1NF(user_id, contact_name, relationship, primary_phone, priority, is_primary)
QR_TAGS_1NF(user_id, qr_id, qr_token, qr_url, status)
QR_SCANS_1NF(qr_id, scan_id, scan_time, ip_address, device_type, latitude, longitude, city, scan_status)
```

Every attribute now contains single, atomic values.

---

## 4. Second Normal Form (2NF)

### 2NF Definition:
A relation $R$ is in Second Normal Form (2NF) if:
1. It is already in **1NF**.
2. **No non-prime attribute is partially dependent on any candidate key.** In other words, every non-key attribute must depend on the **whole candidate key**, not just a part of a composite key.

### Identifying Partial Dependencies:
Examine `USER_ALLERGIES_1NF`:
- **Composite Primary Key:** `(user_id, allergy_name)`
- **Functional Dependencies:**
  - $FD_1: \{\text{user\_id}, \text{allergy\_name}\} \rightarrow \text{reaction}$ (Full functional dependency)
  - $FD_2: \text{allergy\_name} \rightarrow \{\text{allergy\_category}, \text{allergy\_critical\_level}\}$ (**Partial Dependency!**)

Notice that `allergy_category` and `allergy_critical_level` depend solely on `allergy_name`, which is only part of the composite primary key `(user_id, allergy_name)`. This violates 2NF!

Similarly, in `USER_CONDITIONS_1NF`:
- **Composite Primary Key:** `(user_id, condition_name)`
- $FD_1: \{\text{user\_id}, \text{condition\_name}\} \rightarrow \text{diagnosed\_year}$ (Full)
- $FD_2: \text{condition\_name} \rightarrow \text{condition\_severity}$ (**Partial Dependency!**)

### 2NF Decomposition:
We decompose each relation with composite keys into:
1. An independent **Master Catalog Entity** whose primary key is the catalog item identifier.
2. A **Junction Relation (Association Table)** containing only the foreign keys of both entities and attributes that depend on the full combination.

#### Decomposed Relations for 2NF:

1. **`allergies` (Master Catalog):**
   - **Primary Key:** `allergy_id`
   - Attributes: `name`, `category`, `critical_level`
   - $FD: \text{allergy\_id} \rightarrow \{\text{name}, \text{category}, \text{critical\_level}\}$

2. **`user_allergies` (Association Table):**
   - **Composite Primary Key:** `(user_id, allergy_id)`
   - $FD: \{\text{user\_id}, \text{allergy\_id}\} \rightarrow \{\text{reaction}, \text{notes}\}$ (100% Full Functional Dependency)

3. **`medical_conditions` (Master Catalog):**
   - **Primary Key:** `condition_id`
   - Attributes: `name`, `severity`, `description`
   - $FD: \text{condition\_id} \rightarrow \{\text{name}, \text{severity}, \text{description}\}$

4. **`user_conditions` (Association Table):**
   - **Composite Primary Key:** `(user_id, condition_id)`
   - $FD: \{\text{user\_id}, \text{condition\_id}\} \rightarrow \{\text{diagnosed\_year}, \text{notes}\}$ (100% Full Functional Dependency)

5. **`medications` (Master Catalog):**
   - **Primary Key:** `medication_id`
   - Attributes: `name`, `category`
   - $FD: \text{medication\_id} \rightarrow \{\text{name}, \text{category}\}$

6. **`user_medications` (Association Table):**
   - **Composite Primary Key:** `(user_id, medication_id)`
   - $FD: \{\text{user\_id}, \text{medication\_id}\} \rightarrow \{\text{dosage}, \text{frequency}, \text{is\_current}\}$ (100% Full Functional Dependency)

Every non-prime attribute in all tables now depends on the complete candidate key. **2NF is satisfied.**

---

## 5. Third Normal Form (3NF)

### 3NF Definition:
A relation $R$ is in Third Normal Form (3NF) if:
1. It is already in **2NF**.
2. **There are no transitive dependencies.** No non-prime attribute depends transitively on a candidate key through another non-prime attribute ($X \rightarrow Y$ and $Y \rightarrow Z$, where $X$ is a candidate key and $Z$ is a non-prime attribute).
> *"Every non-key attribute must depend on the key, the whole key, and nothing but the key."*

### Identifying Transitive Dependencies:
In the initial `USERS_1NF` table:
- Candidate Key: `user_id`
- Functional Dependencies:
  - $FD_1: \text{user\_id} \rightarrow \text{email}$
  - $FD_2: \text{user\_id} \rightarrow \text{password\_hash}$
  - $FD_3: \text{user\_id} \rightarrow \text{date\_of\_birth}$
  - $FD_4: \text{date\_of\_birth} \rightarrow \text{age}$ (**Transitive Dependency!** Age is functionally derived from Date of Birth: $\text{user\_id} \rightarrow \text{date\_of\_birth} \rightarrow \text{age}$.)
  - $FD_5: \text{user\_id} \rightarrow \{\text{precautions}, \text{organ\_donor}, \text{emergency\_notes}\}$ (Medical clinical profile concerns)
  - $FD_6: \text{user\_id} \rightarrow \{\text{show\_photo}, \text{show\_blood\_group}, \dots\}$ (Security & privacy preferences)

Storing `age` directly in the database creates an update anomaly: age changes every year, while `date_of_birth` is immutable.
Furthermore, mixing user authentication credentials (`email`, `password_hash`, `role`) with personal demographics (`full_name`, `date_of_birth`), medical details (`precautions`, `organ_donor`), and privacy visibility toggles introduces transitive cohesion problems and violates separation of security domains.

### 3NF Decomposition:
1. **Eliminate Derived Attributes:**
   Remove `age` from physical tables entirely. Age is computed on-demand via the deterministic stored function:
   $$\text{fn\_calculate\_age}(\text{date\_of\_birth}) = \text{TIMESTAMPDIFF}(\text{YEAR}, \text{date\_of\_birth}, \text{CURDATE}())$$

2. **Decompose into Distinct 3NF Entities:**

   - **`users` (Authentication & Security Domain):**
     - Primary Key: `user_id`
     - Alternate / Candidate Key: `email` (UNIQUE)
     - Non-key: `password_hash`, `role`, `is_active`, `created_at`
     - All non-key attributes depend directly on `user_id`. No transitive dependencies.

   - **`user_profiles` (Personal Demographic Domain):**
     - Primary Key: `profile_id`
     - Alternate / Candidate Key: `user_id` (UNIQUE), `profile_code` (UNIQUE)
     - Non-key: `full_name`, `date_of_birth`, `gender`, `blood_group`, `phone`, `address`, `city`, `photo_url`, `completion_percentage`
     - Foreign Key: `user_id` REFERENCES `users(user_id)` ON DELETE CASCADE.

   - **`medical_profiles` (Emergency Medical & Precautions Domain):**
     - Primary Key: `medical_id`
     - Alternate / Candidate Key: `user_id` (UNIQUE)
     - Non-key: `blood_group`, `precautions`, `disability_info`, `emergency_notes`, `organ_donor`, `last_updated`
     - Foreign Key: `user_id` REFERENCES `users(user_id)` ON DELETE CASCADE.

   - **`privacy_settings` (Emergency Visibility Configuration):**
     - Primary Key: `privacy_id`
     - Alternate / Candidate Key: `user_id` (UNIQUE)
     - Non-key: `show_photo`, `show_blood_group`, `show_allergies`, `show_conditions`, `show_medications`, `show_precautions`, `show_disability`, `show_address`, `show_secondary_contacts`, `allow_location_prompt`
     - Foreign Key: `user_id` REFERENCES `users(user_id)` ON DELETE CASCADE.

   - **`emergency_contacts` (Emergency Dispatch Network):**
     - Primary Key: `contact_id`
     - Non-key: `user_id`, `contact_name`, `relationship`, `primary_phone`, `alt_phone`, `priority`, `is_primary`
     - Foreign Key: `user_id` REFERENCES `users(user_id)` ON DELETE CASCADE.

   - **`qr_tags` (Cryptographic Access Tokens):**
     - Primary Key: `qr_id`
     - Alternate / Candidate Key: `qr_token` (UNIQUE)
     - Non-key: `user_id`, `qr_url`, `status`, `label`, `created_at`, `revoked_at`
     - Foreign Key: `user_id` REFERENCES `users(user_id)` ON DELETE CASCADE.

   - **`qr_scans` (Scan Audit & Geolocation):**
     - Primary Key: `scan_id`
     - Non-key: `qr_id`, `scan_time`, `ip_address`, `user_agent`, `device_type`, `latitude`, `longitude`, `city`, `scan_status`
     - Foreign Key: `qr_id` REFERENCES `qr_tags(qr_id)` ON DELETE CASCADE.

---

## 6. Summary of Formal Normalization Proof

| Table Name | Candidate Key(s) | Primary Key (PK) | 1NF Check | 2NF Check | 3NF Check |
| :--- | :--- | :--- | :---: | :---: | :---: |
| `users` | `user_id`, `email` | `user_id` | Atomic | Fully dependent on PK | No transitive dependencies |
| `user_profiles` | `profile_id`, `user_id`, `profile_code` | `profile_id` | Atomic | Fully dependent on PK | Derived `age` eliminated |
| `medical_profiles` | `medical_id`, `user_id` | `medical_id` | Atomic | Fully dependent on PK | No transitive dependencies |
| `medical_conditions`| `condition_id`, `name` | `condition_id` | Atomic | Fully dependent on PK | Master catalog decoupled |
| `user_conditions` | `(user_id, condition_id)` | `(user_id, condition_id)` | Atomic | Depends on full composite key | No partial or transitive dependency |
| `allergies` | `allergy_id`, `name` | `allergy_id` | Atomic | Fully dependent on PK | Master catalog decoupled |
| `user_allergies` | `(user_id, allergy_id)` | `(user_id, allergy_id)` | Atomic | Depends on full composite key | No partial or transitive dependency |
| `medications` | `medication_id`, `name` | `medication_id` | Atomic | Fully dependent on PK | Master catalog decoupled |
| `user_medications` | `(user_id, medication_id)`| `(user_id, medication_id)` | Atomic | Depends on full composite key | No partial or transitive dependency |
| `emergency_contacts`| `contact_id` | `contact_id` | Atomic | Fully dependent on PK | Priority decoupled |
| `qr_tags` | `qr_id`, `qr_token` | `qr_id` | Atomic | Fully dependent on PK | Non-guessable token unique |
| `qr_scans` | `scan_id` | `scan_id` | Atomic | Fully dependent on PK | GPS logged per event |
| `privacy_settings` | `privacy_id`, `user_id` | `privacy_id` | Atomic | Fully dependent on PK | Isolated security toggles |
| `emergency_cases` | `emergency_id` | `emergency_id` | Atomic | Fully dependent on PK | Incident tracking |
| `notifications` | `notification_id` | `notification_id` | Atomic | Fully dependent on PK | Dispatch audit trail |
| `audit_logs` | `log_id` | `log_id` | Atomic | Fully dependent on PK | Compliance audit |

### Conclusion:
The LifeTag relational schema achieves strict **Third Normal Form (3NF)** compliance. All multi-valued attributes and repeating groups are eliminated (1NF), all partial dependencies are eradicated through master-catalog decomposition (2NF), and all transitive dependencies are resolved through specialized domain relations and computed stored functions (3NF).
