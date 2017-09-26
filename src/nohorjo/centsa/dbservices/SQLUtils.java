package nohorjo.centsa.dbservices;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

import org.apache.commons.configuration.AbstractConfiguration;
import org.apache.commons.configuration.ConfigurationException;
import org.apache.commons.configuration.XMLConfiguration;

import nohorjo.centsa.properties.SystemProperties;

public class SQLUtils {

	private static final XMLConfiguration QUERIES;

	static {
		AbstractConfiguration.setDefaultListDelimiter((char) 0);
		try {
			QUERIES = new XMLConfiguration(ClassLoader.getSystemResource("sql-queries.xml").getPath());
		} catch (ConfigurationException e) {
			throw new Error(e);
		}
	}

	public static Connection getConnection() throws SQLException {
		return DriverManager
				.getConnection("jdbc:sqlite:" + SystemProperties.get("root.dir", String.class) + "/data.db");
	}

	public static String getQuery(String name) {
		return QUERIES.getString(name);
	}
}
