package nohorjo.centsa.dbservices;

import java.io.IOException;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

import org.apache.commons.configuration.AbstractConfiguration;
import org.apache.commons.configuration.ConfigurationException;
import org.apache.commons.configuration.XMLConfiguration;

import nohorjo.centsa.properties.SystemProperties;
import nohorjo.util.ClasspathUtils;

/**
 * Class to provide utiliy methods to DAOs
 * 
 * @author muhammed.haque
 *
 */
public class SQLUtils {

	private static final XMLConfiguration QUERIES = new XMLConfiguration();

	/**
	 * Loads sql-queries.cml from the classpath
	 */
	static {
		AbstractConfiguration.setDefaultListDelimiter((char) 0);
		try {
			QUERIES.load(ClasspathUtils.getFileAsStream("sql-queries.xml"));
		} catch (ConfigurationException | IOException e) {
			throw new RuntimeException(e);
		}
	}

	/**
	 * Gets a {@link Connection} to the database
	 * 
	 * @return A {@link Connection} to the database
	 * @throws SQLException
	 */
	public static Connection getConnection() throws SQLException {
		return DriverManager
				.getConnection("jdbc:sqlite:" + SystemProperties.get("root.dir", String.class) + "/data.db");
	}

	/**
	 * Gets a query from the xml
	 * 
	 * @param name
	 *            The name of the query
	 * @return The query
	 */
	public static String getQuery(String name) {
		return QUERIES.getString(name);
	}
}
