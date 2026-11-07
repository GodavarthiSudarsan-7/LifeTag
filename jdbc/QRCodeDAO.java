import java.sql.*;
import java.util.ArrayList;
import java.util.List;

/**
 * QR Code Data Access Object (DAO)
 * Demonstrates CallableStatement with IN/OUT parameters, Stored Procedures, and Triggers
 */
public class QRCodeDAO {

    public static class QRCodeDTO {
        public int qrId;
        public int userId;
        public String qrToken;
        public String qrUrl;
        public String status;
        public String label;
        public Timestamp createdAt;
        public Timestamp revokedAt;

        @Override
        public String toString() {
            return String.format("Tag #%-3d [%-7s] Token: %-26s | %s", qrId, status, qrToken, label);
        }
    }

    public static class ScanLogDTO {
        public int scanId;
        public Timestamp scanTime;
        public String deviceType;
        public String city;
        public String scanStatus;

        @Override
        public String toString() {
            return String.format("[%s] Status: %-7s | Device: %-18s | Location: %s",
                    scanTime, scanStatus, deviceType, city != null ? city : "N/A");
        }
    }

    // 1. SELECT active QR tag for a user
    public QRCodeDTO getActiveTagByUser(int userId) throws SQLException {
        String sql = "SELECT qr_id, user_id, qr_token, qr_url, status, label, created_at, revoked_at "
                   + "FROM qr_tags WHERE user_id = ? AND status = 'Active' "
                   + "ORDER BY created_at DESC LIMIT 1";

        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, userId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    QRCodeDTO q = new QRCodeDTO();
                    q.qrId = rs.getInt("qr_id");
                    q.userId = rs.getInt("user_id");
                    q.qrToken = rs.getString("qr_token");
                    q.qrUrl = rs.getString("qr_url");
                    q.status = rs.getString("status");
                    q.label = rs.getString("label");
                    q.createdAt = rs.getTimestamp("created_at");
                    q.revokedAt = rs.getTimestamp("revoked_at");
                    return q;
                }
            }
        }
        return null;
    }

    // 2. Call Stored Procedure: sp_regenerate_qr_tag
    public int regenerateTag(int userId, String newToken, String newUrl, String label) throws SQLException {
        String callSql = "{CALL sp_regenerate_qr_tag(?, ?, ?, ?, ?)}";
        try (Connection con = DBConnection.getConnection();
             CallableStatement cs = con.prepareCall(callSql)) {
            cs.setInt(1, userId);
            cs.setString(2, newToken);
            cs.setString(3, newUrl);
            cs.setString(4, label);
            cs.registerOutParameter(5, Types.INTEGER);
            cs.execute();
            return cs.getInt(5);
        }
    }

    // 3. Call Stored Procedure: sp_record_emergency_scan
    public String recordScan(String qrToken, String ip, String userAgent, String deviceType, Double lat, Double lng, String city) throws SQLException {
        String callSql = "{CALL sp_record_emergency_scan(?, ?, ?, ?, ?, ?, ?, ?, ?)}";
        try (Connection con = DBConnection.getConnection();
             CallableStatement cs = con.prepareCall(callSql)) {
            cs.setString(1, qrToken);
            cs.setString(2, ip);
            cs.setString(3, userAgent);
            cs.setString(4, deviceType);
            if (lat != null) cs.setDouble(5, lat); else cs.setNull(5, Types.DECIMAL);
            if (lng != null) cs.setDouble(6, lng); else cs.setNull(6, Types.DECIMAL);
            cs.setString(7, city);
            cs.registerOutParameter(8, Types.VARCHAR); // p_scan_status
            cs.registerOutParameter(9, Types.INTEGER); // p_user_id
            cs.execute();
            return cs.getString(8);
        }
    }

    // 4. View scan history for a tag
    public List<ScanLogDTO> getScanHistory(int qrId) throws SQLException {
        List<ScanLogDTO> list = new ArrayList<>();
        String sql = "SELECT scan_id, scan_time, device_type, city, scan_status "
                   + "FROM qr_scans WHERE qr_id = ? ORDER BY scan_time DESC";

        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, qrId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    ScanLogDTO s = new ScanLogDTO();
                    s.scanId = rs.getInt("scan_id");
                    s.scanTime = rs.getTimestamp("scan_time");
                    s.deviceType = rs.getString("device_type");
                    s.city = rs.getString("city");
                    s.scanStatus = rs.getString("scan_status");
                    list.add(s);
                }
            }
        }
        return list;
    }
}
