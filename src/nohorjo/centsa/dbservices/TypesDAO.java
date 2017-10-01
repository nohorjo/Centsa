package nohorjo.centsa.dbservices;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.LinkedList;
import java.util.List;

import nohorjo.centsa.vo.Type;
import nohorjo.centsa.vo.VO;

public class TypesDAO extends AbstractDAO {
	private static final String[] COLUMNS = { "NAME" };
	private static final String TABLE_NAME = "TYPES";

	static {
		try {
			new TypesDAO().createTable();
		} catch (SQLException e) {
			throw new Error(e);
		}
	}

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
	public List<Type> getAll(int page, int pageSize, String order) throws SQLException {
		List<Type> ts = new LinkedList<>();

		try (ResultSet rs = getAll(TABLE_NAME, COLUMNS, order, page, pageSize)) {
			while (rs.next()) {
				Type t = new Type();
				t.setId(rs.getLong("ID"));
				t.setName(rs.getString("NAME"));
				ts.add(t);
			}
		}
		return ts;
	}

	@Override
	public Type get(long id) throws SQLException {
		try (ResultSet rs = get(TABLE_NAME, COLUMNS, id)) {
			if (rs.next()) {
				Type t = new Type();
				t.setId(rs.getLong("ID"));
				t.setName(rs.getString("NAME"));
				return t;
			}
		}
		return null;
	}

	@Override
	public void delete(long id) throws SQLException {
		delete(TABLE_NAME, id);
	}

}
