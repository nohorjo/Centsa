package nohorjo.centsa.dbservices;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

import nohorjo.centsa.properties.SystemProperties;

public class ConnectionUtils {

	public static Connection getConnection() throws SQLException {
		return DriverManager
				.getConnection("jdbc:sqlite:" + SystemProperties.get("root.dir", String.class) + "/data.db");
	}
}
