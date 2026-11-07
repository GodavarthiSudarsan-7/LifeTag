import java.sql.*;
import java.util.ArrayList;
import java.util.List;

/**
 * Emergency Contact Data Access Object (DAO)
 * Demonstrates PreparedStatement, Transaction Management, and Procedure execution
 */
public class EmergencyContactDAO {

    public static class ContactDTO {
        public int contactId;
        public int userId;
        public String contactName;
        public String relationship;
        public String primaryPhone;
        public String altPhone;
        public int priority;
        public boolean isPrimary;

        @Override
        public String toString() {
            return String.format("#%d [%s] %s (%s) | Tel: %s | Alt: %s",
                    priority, isPrimary ? "PRIMARY" : "SECONDARY", contactName, relationship, primaryPhone,
                    altPhone != null ? altPhone : "N/A");
        }
    }

    // 1. SELECT all contacts for a user
    public List<ContactDTO> getContactsByUser(int userId) throws SQLException {
        List<ContactDTO> list = new ArrayList<>();
        String sql = "SELECT contact_id, user_id, contact_name, relationship, primary_phone, alt_phone, priority, is_primary "
                   + "FROM emergency_contacts WHERE user_id = ? ORDER BY priority ASC";

        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, userId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    ContactDTO c = new ContactDTO();
                    c.contactId = rs.getInt("contact_id");
                    c.userId = rs.getInt("user_id");
                    c.contactName = rs.getString("contact_name");
                    c.relationship = rs.getString("relationship");
                    c.primaryPhone = rs.getString("primary_phone");
                    c.altPhone = rs.getString("alt_phone");
                    c.priority = rs.getInt("priority");
                    c.isPrimary = rs.getBoolean("is_primary");
                    list.add(c);
                }
            }
        }
        return list;
    }

    // 2. INSERT a new emergency contact
    public int addContact(int userId, String name, String relationship, String primaryPhone, String altPhone, int priority, boolean isPrimary) throws SQLException {
        String sql = "INSERT INTO emergency_contacts (user_id, contact_name, relationship, primary_phone, alt_phone, priority, is_primary) "
                   + "VALUES (?, ?, ?, ?, ?, ?, ?)";
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setInt(1, userId);
            ps.setString(2, name);
            ps.setString(3, relationship);
            ps.setString(4, primaryPhone);
            ps.setString(5, altPhone);
            ps.setInt(6, priority);
            ps.setBoolean(7, isPrimary);
            ps.executeUpdate();
            try (ResultSet keys = ps.getGeneratedKeys()) {
                if (keys.next()) return keys.getInt(1);
            }
        }
        return -1;
    }

    // 3. UPDATE an emergency contact
    public boolean updateContact(int contactId, String name, String relationship, String primaryPhone, String altPhone) throws SQLException {
        String sql = "UPDATE emergency_contacts SET contact_name = ?, relationship = ?, primary_phone = ?, alt_phone = ? "
                   + "WHERE contact_id = ?";
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, name);
            ps.setString(2, relationship);
            ps.setString(3, primaryPhone);
            ps.setString(4, altPhone);
            ps.setInt(5, contactId);
            return ps.executeUpdate() > 0;
        }
    }

    // 4. Set Primary Contact with atomic transaction
    public boolean setPrimaryContact(int userId, int targetContactId) throws SQLException {
        Connection con = null;
        try {
            con = DBConnection.getConnection();
            con.setAutoCommit(false);

            // Clear existing primary flags for this user
            try (PreparedStatement psClear = con.prepareStatement(
                    "UPDATE emergency_contacts SET is_primary = FALSE WHERE user_id = ?")) {
                psClear.setInt(1, userId);
                psClear.executeUpdate();
            }

            // Set new primary contact
            try (PreparedStatement psSet = con.prepareStatement(
                    "UPDATE emergency_contacts SET is_primary = TRUE, priority = 1 WHERE contact_id = ? AND user_id = ?")) {
                psSet.setInt(1, targetContactId);
                psSet.setInt(2, userId);
                psSet.executeUpdate();
            }

            con.commit();
            return true;
        } catch (SQLException e) {
            if (con != null) con.rollback();
            throw e;
        } finally {
            if (con != null) { con.setAutoCommit(true); con.close(); }
        }
    }

    // 5. DELETE an emergency contact
    public boolean deleteContact(int contactId) throws SQLException {
        String sql = "DELETE FROM emergency_contacts WHERE contact_id = ?";
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, contactId);
            return ps.executeUpdate() > 0;
        }
    }

    // 6. Demonstrate Stored Procedure with Explicit Cursor
    public List<String> getDispatchQueueFromProcedure(int userId) throws SQLException {
        List<String> list = new ArrayList<>();
        String callSql = "{CALL sp_cursor_emergency_dispatch_list(?)}";
        try (Connection con = DBConnection.getConnection();
             CallableStatement cs = con.prepareCall(callSql)) {
            cs.setInt(1, userId);
            try (ResultSet rs = cs.executeQuery()) {
                while (rs.next()) {
                    list.add(rs.getString("formatted_entry"));
                }
            }
        }
        return list;
    }
}
