import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.Properties;

/**
 * LifeTag DBMS Project - Database Connection Manager (JDBC 4.x)
 * Target Database: lifetag_db on MySQL 8.0
 */
public class DBConnection {
    private static final String DRIVER = "com.mysql.cj.jdbc.Driver";
    private static String url;
    private static String user;
    private static String password;

    static {
        Properties props = new Properties();
        try (InputStream in = new FileInputStream("db.properties")) {
            props.load(in);
            url = props.getProperty("db.url", "jdbc:mysql://127.0.0.1:3306/lifetag_db?useSSL=false&allowPublicKeyRetrieval=true");
            user = props.getProperty("db.user", "root");
            password = props.getProperty("db.password", "Sudu@61069");
            Class.forName(DRIVER);
        } catch (IOException | ClassNotFoundException e) {
            System.err.println("Warning loading db.properties: " + e.getMessage());
            // Fallback defaults
            url = "jdbc:mysql://127.0.0.1:3306/lifetag_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC";
            user = "root";
            password = "Sudu@61069";
        }
    }

    public static Connection getConnection() throws SQLException {
        return DriverManager.getConnection(url, user, password);
    }
}
