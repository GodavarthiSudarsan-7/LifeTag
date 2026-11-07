import java.sql.*;
import java.util.ArrayList;
import java.util.List;

/**
 * Medical Information Data Access Object (DAO)
 * Demonstrates PreparedStatement, Function Call via CallableStatement, and M:N relations
 */
public class MedicalInfoDAO {

    public static class MedicalSummaryDTO {
        public int userId;
        public String bloodGroup;
        public String precautions;
        public String disabilityInfo;
        public String emergencyNotes;
        public boolean organDonor;
        public List<String> conditions = new ArrayList<>();
        public List<String> allergies = new ArrayList<>();
        public List<String> medications = new ArrayList<>();
        public String clinicalRiskTier;
    }

    // 1. SELECT complete medical dossier for a user
    public MedicalSummaryDTO getMedicalProfile(int userId) throws SQLException {
        MedicalSummaryDTO dto = new MedicalSummaryDTO();
        dto.userId = userId;

        String profileSql = "SELECT blood_group, precautions, disability_info, emergency_notes, organ_donor "
                          + "FROM medical_profiles WHERE user_id = ?";
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(profileSql)) {
            ps.setInt(1, userId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    dto.bloodGroup = rs.getString("blood_group");
                    dto.precautions = rs.getString("precautions");
                    dto.disabilityInfo = rs.getString("disability_info");
                    dto.emergencyNotes = rs.getString("emergency_notes");
                    dto.organDonor = rs.getBoolean("organ_donor");
                } else {
                    return null;
                }
            }

            // Conditions
            String condSql = "SELECT c.name FROM user_conditions uc "
                           + "JOIN medical_conditions c ON uc.condition_id = c.condition_id "
                           + "WHERE uc.user_id = ?";
            try (PreparedStatement psCond = con.prepareStatement(condSql)) {
                psCond.setInt(1, userId);
                try (ResultSet rs = psCond.executeQuery()) {
                    while (rs.next()) dto.conditions.add(rs.getString("name"));
                }
            }

            // Allergies
            String allgSql = "SELECT a.name, a.critical_level FROM user_allergies ua "
                           + "JOIN allergies a ON ua.allergy_id = a.allergy_id "
                           + "WHERE ua.user_id = ?";
            try (PreparedStatement psAllg = con.prepareStatement(allgSql)) {
                psAllg.setInt(1, userId);
                try (ResultSet rs = psAllg.executeQuery()) {
                    while (rs.next()) dto.allergies.add(rs.getString("name") + " [" + rs.getString("critical_level") + "]");
                }
            }

            // Medications
            String medSql = "SELECT m.name, um.dosage, um.frequency FROM user_medications um "
                          + "JOIN medications m ON um.medication_id = m.medication_id "
                          + "WHERE um.user_id = ?";
            try (PreparedStatement psMed = con.prepareStatement(medSql)) {
                psMed.setInt(1, userId);
                try (ResultSet rs = psMed.executeQuery()) {
                    while (rs.next()) dto.medications.add(rs.getString("name") + " (" + rs.getString("dosage") + ")");
                }
            }

            // Stored Function call: fn_emergency_risk_index
            try (CallableStatement cs = con.prepareCall("{? = call fn_emergency_risk_index(?)}")) {
                cs.registerOutParameter(1, Types.VARCHAR);
                cs.setInt(2, userId);
                cs.execute();
                dto.clinicalRiskTier = cs.getString(1);
            }
        }
        return dto;
    }

    // 2. UPDATE medical precautions and emergency notes
    public boolean updatePrecautions(int userId, String precautions, String emergencyNotes, boolean organDonor) throws SQLException {
        String sql = "UPDATE medical_profiles SET precautions = ?, emergency_notes = ?, organ_donor = ?, last_updated = NOW() "
                   + "WHERE user_id = ?";
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, precautions);
            ps.setString(2, emergencyNotes);
            ps.setBoolean(3, organDonor);
            ps.setInt(4, userId);
            return ps.executeUpdate() > 0;
        }
    }
}
