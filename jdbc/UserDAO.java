import java.sql.*;
import java.util.ArrayList;
import java.util.List;

/**
 * User Data Access Object (DAO)
 * Demonstrates PreparedStatement, ResultSet, INSERT, SELECT, UPDATE, DELETE
 */
public class UserDAO {

    public static class UserDTO {
        public int userId;
        public String email;
        public String fullName;
        public String bloodGroup;
        public String phone;
        public String city;
        public String profileCode;
        public int completionPercentage;

        @Override
        public String toString() {
            return String.format("[%d] %s (%s) | Blood: %-3s | Phone: %-15s | City: %s | Code: %s",
                    userId, fullName, email, bloodGroup, phone, city, profileCode);
        }
    }

    // 1. SELECT all users with profiles (INNER JOIN)
    public List<UserDTO> getAllUsers() throws SQLException {
        List<UserDTO> list = new ArrayList<>();
        String sql = "SELECT u.user_id, u.email, p.full_name, p.blood_group, p.phone, p.city, p.profile_code, p.completion_percentage "
                   + "FROM users u "
                   + "JOIN user_profiles p ON u.user_id = p.user_id "
                   + "ORDER BY u.user_id ASC";

        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                UserDTO u = new UserDTO();
                u.userId = rs.getInt("user_id");
                u.email = rs.getString("email");
                u.fullName = rs.getString("full_name");
                u.bloodGroup = rs.getString("blood_group");
                u.phone = rs.getString("phone");
                u.city = rs.getString("city");
                u.profileCode = rs.getString("profile_code");
                u.completionPercentage = rs.getInt("completion_percentage");
                list.add(u);
            }
        }
        return list;
    }

    // 2. SELECT user by ID
    public UserDTO getUserById(int userId) throws SQLException {
        String sql = "SELECT u.user_id, u.email, p.full_name, p.blood_group, p.phone, p.city, p.profile_code, p.completion_percentage "
                   + "FROM users u "
                   + "JOIN user_profiles p ON u.user_id = p.user_id "
                   + "WHERE u.user_id = ?";

        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, userId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    UserDTO u = new UserDTO();
                    u.userId = rs.getInt("user_id");
                    u.email = rs.getString("email");
                    u.fullName = rs.getString("full_name");
                    u.bloodGroup = rs.getString("blood_group");
                    u.phone = rs.getString("phone");
                    u.city = rs.getString("city");
                    u.profileCode = rs.getString("profile_code");
                    u.completionPercentage = rs.getInt("completion_percentage");
                    return u;
                }
            }
        }
        return null;
    }

    // 3. INSERT user + profile using Transaction Management (Atomic)
    public int createUserWithProfile(String email, String passwordHash, String fullName, 
                                     Date dob, String gender, String bloodGroup, 
                                     String phone, String city) throws SQLException {
        String insertUserSql = "INSERT INTO users (email, password_hash, role, is_active) VALUES (?, ?, 'USER', TRUE)";
        String insertProfileSql = "INSERT INTO user_profiles (user_id, full_name, date_of_birth, gender, blood_group, phone, city, profile_code, completion_percentage) "
                                + "VALUES (?, ?, ?, ?, ?, ?, ?, ?, 60)";
        String insertMedSql = "INSERT INTO medical_profiles (user_id, blood_group, precautions) VALUES (?, ?, 'Logged via JDBC')";
        String insertPrivSql = "INSERT INTO privacy_settings (user_id) VALUES (?)";

        Connection con = null;
        try {
            con = DBConnection.getConnection();
            con.setAutoCommit(false); // Begin transaction

            int newUserId = -1;
            try (PreparedStatement psUser = con.prepareStatement(insertUserSql, Statement.RETURN_GENERATED_KEYS)) {
                psUser.setString(1, email);
                psUser.setString(2, passwordHash);
                psUser.executeUpdate();
                try (ResultSet keys = psUser.getGeneratedKeys()) {
                    if (keys.next()) {
                        newUserId = keys.getInt(1);
                    }
                }
            }

            if (newUserId == -1) {
                throw new SQLException("Failed to retrieve generated user_id");
            }

            String profileCode = String.format("LT-JDBC-%04d", newUserId);
            try (PreparedStatement psProf = con.prepareStatement(insertProfileSql)) {
                psProf.setInt(1, newUserId);
                psProf.setString(2, fullName);
                psProf.setDate(3, dob);
                psProf.setString(4, gender);
                psProf.setString(5, bloodGroup);
                psProf.setString(6, phone);
                psProf.setString(7, city);
                psProf.setString(8, profileCode);
                psProf.executeUpdate();
            }

            try (PreparedStatement psMed = con.prepareStatement(insertMedSql)) {
                psMed.setInt(1, newUserId);
                psMed.setString(2, bloodGroup);
                psMed.executeUpdate();
            }

            try (PreparedStatement psPriv = con.prepareStatement(insertPrivSql)) {
                psPriv.setInt(1, newUserId);
                psPriv.executeUpdate();
            }

            con.commit(); // Commit transaction
            return newUserId;
        } catch (SQLException e) {
            if (con != null) {
                try { con.rollback(); } catch (SQLException ex) { /* ignored */ }
            }
            throw e;
        } finally {
            if (con != null) {
                try { con.setAutoCommit(true); con.close(); } catch (SQLException ex) { /* ignored */ }
            }
        }
    }

    // 4. UPDATE user phone and city
    public boolean updateUserContact(int userId, String newPhone, String newCity) throws SQLException {
        String sql = "UPDATE user_profiles SET phone = ?, city = ?, updated_at = NOW() WHERE user_id = ?";
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, newPhone);
            ps.setString(2, newCity);
            ps.setInt(3, userId);
            int rows = ps.executeUpdate();
            return rows > 0;
        }
    }

    // 5. DELETE user (Cascades to profile, medical, contacts due to ON DELETE CASCADE)
    public boolean deleteUser(int userId) throws SQLException {
        String sql = "DELETE FROM users WHERE user_id = ?";
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, userId);
            return ps.executeUpdate() > 0;
        }
    }
}
