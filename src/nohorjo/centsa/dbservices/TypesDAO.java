package nohorjo.centsa.dbservices;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.LinkedList;
import java.util.List;

import nohorjo.centsa.vo.Type;
import nohorjo.centsa.vo.VO;

/**
 * DAO class to handle types
 * 
 * @author muhammed.haque
 *
 */
public class TypesDAO extends AbstractDAO {
	private static final String[] COLUMNS = { "NAME" };
	private static final String TABLE_NAME = "TYPES";

	@Override
	public void createTable() throws SQLException {
		createTable("Types.CreateTable");
	}

	@Override
	public long insert(VO _vo) throws SQLException {
		Type t = (Type) _vo;

		return insert(TABLE_NAME, COLUMNS, new Object[] { t.getId(), t.getName() });
	}

	@Override
	public List<Type> getAll(int page, int pageSize, String orderBy) throws SQLException {
		List<Type> ts = new LinkedList<>();

		orderBy = (orderBy != null && orderBy.toLowerCase().matches("^(\\s*[a-z]* (asc|desc),?)+$")) ? orderBy
				: "1 ASC";
		page = (page > 0) ? page : 1;
		pageSize = (pageSize > 0) ? pageSize : Integer.MAX_VALUE;
		int skip = (page - 1) * pageSize;

		String sql = SQLUtils.getQuery("Types.GetAll").replace("{orderby}", orderBy);
		try (Connection conn = SQLUtils.getConnection(); PreparedStatement ps = conn.prepareStatement(sql)) {
			ps.setInt(1, skip);
			ps.setInt(2, pageSize);
			try (ResultSet rs = ps.executeQuery()) {
				while (rs.next()) {
					Type t = new Type();
					t.setId(rs.getLong("ID"));
					t.setName(rs.getString("NAME"));
					t.setSum(rs.getInt("SUM"));

					ts.add(t);
				}
			}
		}
		return ts;
	}

	@Override
	public Type get(long id) throws SQLException {
		String sql = SQLUtils.getQuery("Types.Get");
		Type t = null;
		try (Connection conn = SQLUtils.getConnection(); PreparedStatement ps = conn.prepareStatement(sql)) {
			ps.setLong(1, id);
			try (ResultSet rs = ps.executeQuery()) {
				if (rs.next()) {
					t = new Type();
					t.setId(rs.getLong("ID"));
					t.setName(rs.getString("NAME"));
					t.setSum(rs.getInt("SUM"));
				}
			}
		}

		return t;
	}

	@Override
	public void delete(long id) throws SQLException {
		if (id == 1) {
			throw new SQLException("Cannot delete default type");
		}
		String sql = SQLUtils.getQuery("Types.ConvertToOther");
		try (Connection conn = SQLUtils.getConnection(); PreparedStatement ps = conn.prepareStatement(sql)) {
			ps.setLong(1, id);
			ps.executeUpdate();
		}
		delete(TABLE_NAME, id);
	}

	public Long getIdByName(String name) throws SQLException {
		return getIdByName(name, TABLE_NAME);
	}

}
