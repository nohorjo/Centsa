package nohorjo.centsa.dbservices;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.Collections;
import java.util.function.Function;

import nohorjo.centsa.properties.SystemProperties;

/**
 * Base class for DAOs
 * 
 * @author muhammed.haque
 *
 */
public abstract class AbstractDAO implements DAO {

	/**
	 * Creates DB and tables if they don't already exist
	 */
	static {
		try {
			new AccountsDAO().createTable();
			new ExpensesDAO().createTable();
			new TransactionsDAO().createTable();
			new TypesDAO().createTable();

			int dbVersion = SystemProperties.get("db.version", Integer.class);

			while (runUpdateScript(++dbVersion)) {
				// Set to the last run successfully
				SystemProperties.set("db.version", dbVersion);
			}

		} catch (SQLException | IOException e) {
			throw new RuntimeException(e);
		}
	}

	/**
	 * Runs the update scripts in the db
	 * 
	 * @param Version
	 *            version of the script to run
	 * @return <code>true</code> if the update was found, else <code>false</code>
	 * @throws IOException
	 * @throws SQLException
	 */
	private static boolean runUpdateScript(int version) throws IOException, SQLException {
		try (InputStream in = ClassLoader
				.getSystemResourceAsStream(String.format("dbupgrade/update_%d.sql", version))) {

			if (in != null) {
				try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
					byte[] buff = new byte[1024];
					int len;
					while ((len = in.read(buff)) > 0) {
						out.write(buff, 0, len);
					}
					String sqlFile = out.toString();
					try (Connection conn = SQLUtils.getConnection(); Statement ps = conn.createStatement()) {
						String sql[] = sqlFile.split(";");
						for (String part : sql) {
							if (!part.equals(""))
								ps.addBatch(part);
						}
						ps.executeBatch();
					}

				}
				return true;
			}
			return false;
		}
	}

	/**
	 * Runs the query to create the table
	 * 
	 * @param query
	 *            The name of the query to run
	 * @throws SQLException
	 */
	protected void createTable(String query) throws SQLException {
		try (Connection conn = SQLUtils.getConnection(); Statement ps = conn.createStatement()) {
			String sql[] = SQLUtils.getQuery(query).split(";");
			for (String part : sql) {
				if (!part.equals(""))
					ps.addBatch(part);
			}
			ps.executeBatch();
		}
	}

	/**
	 * Inserts a new record or updates an existing one
	 * 
	 * @param tableName
	 *            The name of the table
	 * @param columnsWithoutID
	 *            An array of column names excluding ID
	 * @param values
	 *            The values to insert
	 * @return The new ID or -1 if updating
	 * @throws SQLException
	 */
	protected long insert(String tableName, String[] columnsWithoutID, Object[] values) throws SQLException {
		String[] columns = addIDColumn(columnsWithoutID);
		columns[0] = "ID";
		for (int i = 1; i < columns.length; i++) {
			columns[i] = columnsWithoutID[i - 1];
		}
		String sql = SQLUtils.getQuery((values[0] == null ? "Templates.Insert" : "Templates.Update"))
				.replace("{tablename}", tableName).replace("{columns}", String.join(",", columns))
				.replace("{placeholders}", String.join(",", Collections.nCopies(columns.length, "?")));

		try (Connection conn = SQLUtils.getConnection();
				PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
			for (int i = 0; i < columns.length; i++) {
				ps.setObject(i + 1, values[i]);
			}
			ps.executeUpdate();
			try (ResultSet rs = ps.getGeneratedKeys()) {
				return rs.next() ? rs.getLong(1) : -1;
			}
		}
	}

	/**
	 * Gets a list of records
	 * 
	 * @param tableName
	 *            The name of the table
	 * @param columnsWithoutID
	 *            An array of column names excluding ID
	 * @param orderBy
	 *            The ORDER BY clause to sort the results, defaults to '1 ASC'
	 * @param page
	 *            If paginated, the page number
	 * @param pageSize
	 *            If paginated, the number of records per page
	 * @param processor
	 *            The {@link Function} to extract the data from the
	 *            {@link ResultSet}
	 * @return The result of the processor
	 * @throws SQLException
	 */
	protected <R> R getAll(String tableName, String[] columnsWithoutID, String orderBy, int page, int pageSize,
			Function<ResultSet, R> processor) throws SQLException {
		String[] columns = addIDColumn(columnsWithoutID);

		// Reject invalid ORDER BY clause
		orderBy = (orderBy != null && orderBy.toLowerCase().matches("^(\\s*[a-z]* (asc|desc),?)+$")) ? orderBy
				: "1 ASC";
		page = (page > 0) ? page : 1;
		pageSize = (pageSize > 0) ? pageSize : Integer.MAX_VALUE;

		int skip = (page - 1) * pageSize;
		String sql = SQLUtils.getQuery("Templates.GetAll").replace("{tablename}", tableName)
				.replace("{columns}", String.join(",", columns)).replace("{orderby}", orderBy);
		try (Connection conn = SQLUtils.getConnection(); PreparedStatement ps = conn.prepareStatement(sql)) {
			ps.setInt(1, skip);
			ps.setInt(2, pageSize);
			try (ResultSet rs = ps.executeQuery()) {
				return processor.apply(rs);
			}
		}
	}

	/**
	 * Get a single record from the database
	 * 
	 * @param tableName
	 *            The name of the table
	 * @param columns
	 *            The columns of the table
	 * @param id
	 *            The ID of the record to get
	 * @param processor
	 *            The {@link Function} to extract the data from the
	 *            {@link ResultSet}
	 * @return The result of the processor
	 * @throws SQLException
	 */
	protected <R> R get(String tableName, String[] columns, long id, Function<ResultSet, R> processor)
			throws SQLException {
		String sql = SQLUtils.getQuery("Templates.Get").replace("{tablename}", tableName).replace("{columns}",
				String.join(",", columns));
		try (Connection conn = SQLUtils.getConnection(); PreparedStatement ps = conn.prepareStatement(sql)) {
			ps.setLong(1, id);
			try (ResultSet rs = ps.executeQuery()) {
				return processor.apply(rs);
			}
		}
	}

	/**
	 * Deletes a record
	 * 
	 * @param tableName
	 *            The name of the table
	 * @param id
	 *            The ID of the record to delete
	 * @throws SQLException
	 */
	protected void delete(String tableName, long id) throws SQLException {
		String sql = SQLUtils.getQuery("Templates.Delete").replace("{tablename}", tableName);
		try (Connection conn = SQLUtils.getConnection(); PreparedStatement ps = conn.prepareStatement(sql)) {
			ps.setLong(1, id);
			ps.executeUpdate();
		}
	}

	/**
	 * Gets the ID of a record from its name
	 * 
	 * @param name
	 *            the NAME value
	 * @param tableName
	 *            The name of the table
	 * @return The ID of the record or <code>null</code> if it doesn't exist
	 * @throws SQLException
	 */
	protected Long getIdByName(String name, String tableName) throws SQLException {
		String sql = SQLUtils.getQuery("Templates.GetIdByName").replace("{tablename}", tableName);
		try (Connection conn = SQLUtils.getConnection(); PreparedStatement ps = conn.prepareStatement(sql)) {
			ps.setString(1, name);
			try (ResultSet rs = ps.executeQuery()) {
				if (rs.next()) {
					return rs.getLong(1);
				}
			}
		}
		return null;
	}

	/**
	 * Adds 'ID' to the array of column names
	 * 
	 * @param columnsWithoutID
	 *            the array to prepend
	 * @return the new array
	 */
	private String[] addIDColumn(String[] columnsWithoutID) {
		String[] columns = new String[columnsWithoutID.length + 1];
		columns[0] = "ID";
		for (int i = 1; i < columns.length; i++) {
			columns[i] = columnsWithoutID[i - 1];
		}
		return columns;
	}
}
