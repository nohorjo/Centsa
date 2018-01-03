package nohorjo.centsa.dbservices;

import java.io.IOException;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

import org.apache.commons.configuration.ConfigurationException;
import org.apache.commons.configuration.XMLConfiguration;

import nohorjo.centsa.properties.SystemProperties;
import nohorjo.util.ClasspathUtils;
import org.sqlite.Function;

/**
 * Class to provide utility methods to DAOs
 *
 * @author muhammed.haque
 */
public class SQLUtils {

    private static final XMLConfiguration QUERIES = new XMLConfiguration();

    /**
     * Loads sql-queries.xml from the classpath
     */
    static {
        QUERIES.setDelimiterParsingDisabled(true);
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
        Connection conn = DriverManager.getConnection("jdbc:sqlite:" + SystemProperties.get("root.dir", String.class) + "/data.db");
        Function.create(conn, "REGEXP", new Function() {
            @Override
            protected void xFunc() throws SQLException {
                String expression = value_text(0);
                String value = value_text(1);
                result(value.matches(expression) ? 1 : 0);
            }
        });
        return conn;
    }

    /**
     * Gets a query from the xml
     *
     * @param name The name of the query
     * @return The query
     */
    public static String getQuery(String name) {
        return QUERIES.getString(name);
    }
}
