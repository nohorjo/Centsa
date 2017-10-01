package nohorjo.centsa.dbservices;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Collections;

public abstract class AbstractDAO implements DAO {

	protected void createTable(String query) throws SQLException {
		try (Connection conn = SQLUtils.getConnection();
				PreparedStatement ps = conn.prepareStatement(SQLUtils.getQuery(query))) {
			ps.execute();
		}
	}

	protected long insert(String tableName, String[] columnsWithoutID, Object[] values) throws SQLException {
		String[] columns = addIDColumn(columnsWithoutID);
		columns[0] = "ID";
		for (int i = 1; i < columns.length; i++) {
			columns[i] = columnsWithoutID[i - 1];
		}
		String sql = SQLUtils.getQuery("Templates.Insert").replace("{tablename}", tableName)
				.replace("{columns}", String.join(",", columns))
				.replace("{placeholders}", String.join(",", Collections.nCopies(columns.length, "?")));

		try (Connection conn = SQLUtils.getConnection(); PreparedStatement ps = conn.prepareStatement(sql)) {
			for (int i = 1; i <= values.length; i++) {
				ps.setObject(i, values[i]);
			}
			try (ResultSet rs = ps.executeQuery()) {
				rs.next();
				return rs.getLong(1);
			}
		}
	}

	protected ResultSet getAll(String tableName, String[] columnsWithoutID, String orderBy, int page, int pageSize)
			throws SQLException {
		String[] columns = addIDColumn(columnsWithoutID);

		orderBy = orderBy != null ? orderBy : "1 ASC";
		page = (page > 0) ? page : 1;
		pageSize = (pageSize > 0) ? pageSize : Integer.MAX_VALUE;

		int skip = (page - 1) * pageSize;
		String sql = SQLUtils.getQuery("Templates.GetAll").replace("{tablename}", tableName)
				.replace("{columns}", String.join(",", columns)).replace("{orderby}", orderBy);
		try (Connection conn = SQLUtils.getConnection(); PreparedStatement ps = conn.prepareStatement(sql)) {
			ps.setInt(1, skip);
			ps.setInt(2, pageSize);
			return ps.executeQuery();
		}
	}

	protected ResultSet get(String tableName, String[] columns, long id) throws SQLException {
		String sql = SQLUtils.getQuery("Templates.Get").replace("{tablename}", tableName).replace("{columns}",
				String.join(",", columns));
		try (Connection conn = SQLUtils.getConnection(); PreparedStatement ps = conn.prepareStatement(sql)) {
			ps.setLong(1, id);
			return ps.executeQuery();
		}
	}

	protected void delete(String tableName, long id) throws SQLException {
		String sql = SQLUtils.getQuery("Templates.Delete").replace("{tablename}", tableName);
		try (Connection conn = SQLUtils.getConnection(); PreparedStatement ps = conn.prepareStatement(sql)) {
			ps.setLong(1, id);
			ps.executeUpdate();
		}
	}

	private String[] addIDColumn(String[] columnsWithoutID) {
		String[] columns = new String[columnsWithoutID.length + 1];
		columns[0] = "ID";
		for (int i = 1; i < columns.length; i++) {
			columns[i] = columnsWithoutID[i - 1];
		}
		return columns;
	}
}
