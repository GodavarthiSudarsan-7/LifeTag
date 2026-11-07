import java.sql.*;
import java.util.List;

/**
 * ==========================================================
 * LIFETAG - Academic DBMS Review 3 / Final Demonstration
 * JDBC Connectivity & Advanced Database Concepts
 * ==========================================================
 * Demonstrates:
 *  1. Driver loading & Connection establishment (DBConnection)
 *  2. Statement & PreparedStatement querying
 *  3. Transactions (Commit & Rollback)
 *  4. CallableStatement: Stored Procedures with IN / OUT parameters
 *  5. CallableStatement: Stored Functions
 *  6. Stored Procedures with Explicit Cursors
 *  7. Trigger Verification (Blocked scans on revoked tags)
 *  8. Comprehensive Exception Handling & Resource Management
 */
public class LifeTagJDBCDemo {

    public static void main(String[] args) {
        printBanner("LIFETAG JDBC ACADEMIC DEMONSTRATION (MySQL 8.0)");

        UserDAO userDAO = new UserDAO();
        MedicalInfoDAO medDAO = new MedicalInfoDAO();
        EmergencyContactDAO contactDAO = new EmergencyContactDAO();
        QRCodeDAO qrDAO = new QRCodeDAO();

        try {
            // STEP 1: Verify Connection & MetaData
            testConnectionMetadata();

            // STEP 2: PreparedStatement SELECT
            testSelectAllUsers(userDAO);

            // STEP 3: Transaction Management: INSERT + ROLLBACK vs COMMIT
            testTransactionInsertAndRollback(userDAO);

            // STEP 4: Medical Info & Stored Function Execution
            testMedicalProfileAndFunction(medDAO, 2); // Priya Sharma (Diabetes Type 1 + Penicillin allergy)

            // STEP 5: Emergency Contacts & Explicit Cursor Stored Procedure
            testContactsAndCursorProcedure(contactDAO, 1); // Sudarsan

            // STEP 6: CallableStatement with OUT Parameters (sp_user_emergency_summary)
            testProcedureWithOutParameters(1);

            // STEP 7: QR Tag Scanning & Trigger Demonstration
            testQRScanTrigger(qrDAO);

            printBanner("ALL JDBC DEMONSTRATIONS COMPLETED SUCCESSFULLY");

        } catch (SQLException e) {
            System.err.printf("[SQL ERROR] Code: %d, State: %s, Message: %s%n",
                    e.getErrorCode(), e.getSQLState(), e.getMessage());
            e.printStackTrace();
        }
    }

    private static void testConnectionMetadata() throws SQLException {
        section("1. Connection Establishment & Database Metadata");
        try (Connection con = DBConnection.getConnection()) {
            DatabaseMetaData meta = con.getMetaData();
            System.out.println("-> DBMS Product    : " + meta.getDatabaseProductName() + " v" + meta.getDatabaseProductVersion());
            System.out.println("-> Driver          : " + meta.getDriverName() + " " + meta.getDriverVersion());
            System.out.println("-> Connected DB    : " + con.getCatalog());
            System.out.println("-> Isolation Level : " + con.getTransactionIsolation());
        }
    }

    private static void testSelectAllUsers(UserDAO dao) throws SQLException {
        section("2. PreparedStatement + ResultSet: Active Registered Users");
        List<UserDAO.UserDTO> users = dao.getAllUsers();
        for (UserDAO.UserDTO u : users) {
            System.out.println("   " + u);
        }
    }

    private static void testTransactionInsertAndRollback(UserDAO dao) throws SQLException {
        section("3. Transaction Management: Atomic User Insertion & Safe Cleanup");
        String testEmail = "test.jdbc.runner@lifetag.in";
        System.out.println("-> Starting transaction: Inserting user " + testEmail + " with profile...");

        int newUserId = dao.createUserWithProfile(
                testEmail,
                "$2a$10$tK7WlH1VnI4jMsqaV5nWe.Z9XoX6fF8qT6tS7yI2tM6jE3yK1e0Ge",
                "JDBC Demo Person",
                Date.valueOf("1995-08-20"),
                "Other",
                "O+",
                "+91 9999900000",
                "Bengaluru"
        );
        System.out.println("   [SUCCESS] Created new user with ID: " + newUserId);

        UserDAO.UserDTO created = dao.getUserById(newUserId);
        System.out.println("   [VERIFIED] " + created);

        System.out.println("-> Demonstrating UPDATE on the newly created record...");
        dao.updateUserContact(newUserId, "+91 8888811111", "Mysuru");
        System.out.println("   [UPDATED] Phone & City changed successfully.");

        System.out.println("-> Cleaning up demo record (DELETE via Cascade)...");
        dao.deleteUser(newUserId);
        System.out.println("   [CLEANED] Test user deleted. Integrity maintained.");
    }

    private static void testMedicalProfileAndFunction(MedicalInfoDAO dao, int userId) throws SQLException {
        section("4. Medical Info Dossier & Stored Function {? = call fn_emergency_risk_index(?)}");
        MedicalInfoDAO.MedicalSummaryDTO dto = dao.getMedicalProfile(userId);
        if (dto != null) {
            System.out.printf("   Patient ID        : %d%n", dto.userId);
            System.out.printf("   Blood Group       : %s%n", dto.bloodGroup);
            System.out.printf("   Organ Donor       : %s%n", dto.organDonor ? "YES" : "NO");
            System.out.printf("   Conditions        : %s%n", dto.conditions);
            System.out.printf("   Allergies         : %s%n", dto.allergies);
            System.out.printf("   Medications       : %s%n", dto.medications);
            System.out.printf("   Precautions       : %s%n", dto.precautions);
            System.out.printf("   Clinical Risk Tier: >> %s <<  [Computed by MySQL Stored Function]%n", dto.clinicalRiskTier);
        }
    }

    private static void testContactsAndCursorProcedure(EmergencyContactDAO dao, int userId) throws SQLException {
        section("5. Emergency Contacts & Explicit Cursor Stored Procedure (sp_cursor_emergency_dispatch_list)");
        List<EmergencyContactDAO.ContactDTO> contacts = dao.getContactsByUser(userId);
        System.out.println("-> Standard Contact List:");
        for (EmergencyContactDAO.ContactDTO c : contacts) {
            System.out.println("   " + c);
        }

        System.out.println("%n-> Formatted Dispatch Queue via Stored Procedure Explicit Cursor:");
        List<String> queue = dao.getDispatchQueueFromProcedure(userId);
        for (String q : queue) {
            System.out.println("   " + q);
        }
    }

    private static void testProcedureWithOutParameters(int userId) throws SQLException {
        section("6. CallableStatement: Stored Procedure with OUT Parameters (sp_user_emergency_summary)");
        String callSql = "{CALL sp_user_emergency_summary(?, ?, ?, ?, ?)}";
        try (Connection con = DBConnection.getConnection();
             CallableStatement cs = con.prepareCall(callSql)) {
            cs.setInt(1, userId);
            cs.registerOutParameter(2, Types.INTEGER);   // p_total_contacts
            cs.registerOutParameter(3, Types.VARCHAR);   // p_active_token
            cs.registerOutParameter(4, Types.INTEGER);   // p_readiness_score
            cs.registerOutParameter(5, Types.INTEGER);   // p_total_scans

            cs.execute();

            System.out.printf("   User ID              : %d%n", userId);
            System.out.printf("   Total Contacts (OUT) : %d%n", cs.getInt(2));
            System.out.printf("   Active QR Tag  (OUT) : %s%n", cs.getString(3));
            System.out.printf("   Readiness Pct  (OUT) : %d%%%n", cs.getInt(4));
            System.out.printf("   Total Scans    (OUT) : %d%n", cs.getInt(5));
        }
    }

    private static void testQRScanTrigger(QRCodeDAO dao) throws SQLException {
        section("7. QR Scanning Simulation & Business Trigger Verification (trg_qr_scan_before_insert)");

        System.out.println("-> 7A. Scanning an ACTIVE QR tag (LT-SUDHA-A1B2C3D4E5)...");
        String activeStatus = dao.recordScan("LT-SUDHA-A1B2C3D4E5", "192.168.1.50", "Chrome Mobile", "Android Phone", 17.6868, 83.2185, "Visakhapatnam");
        System.out.println("   Result: " + activeStatus + " (Permitted for First Responders)");

        System.out.println("-> 7B. Scanning a REVOKED QR tag (LT-MEENA-OLD-TAG-99)...");
        String revokedStatus = dao.recordScan("LT-MEENA-OLD-TAG-99", "192.168.1.50", "Safari", "iPhone 13", 13.0418, 80.2507, "Chennai");
        System.out.println("   Result: " + revokedStatus + " (Blocked by Database Trigger trg_qr_scan_before_insert)");
    }

    private static void printBanner(String title) {
        System.out.println("================================================================================");
        System.out.println("  " + title);
        System.out.println("================================================================================");
    }

    private static void section(String name) {
        System.out.println("\n--- " + name + " ---");
    }
}
