package nohorjo.centsa.dbservices;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.LinkedList;
import java.util.List;
import java.util.function.Function;

import nohorjo.centsa.vo.Type;
import nohorjo.centsa.vo.VO;

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
	public List<Type> getAll(int page, int pageSize, String order) throws SQLException {
		Function<ResultSet, List<Type>> processor = new Function<ResultSet, List<Type>>() {

			@Override
			public List<Type> apply(ResultSet rs) {
				List<Type> ts = new LinkedList<>();
				try {
					while (rs.next()) {
						Type a = new Type();
						a.setId(rs.getLong("ID"));
						a.setName(rs.getString("NAME"));
						ts.add(a);
					}
				} catch (SQLException e) {
					e.printStackTrace();
					throw new Error(e);
				}
				return ts;
			}
		};
		return getAll(TABLE_NAME, COLUMNS, order, page, pageSize, processor);
	}

	@Override
	public Type get(long id) throws SQLException {
		Function<ResultSet, Type> processor = new Function<ResultSet, Type>() {

			@Override
			public Type apply(ResultSet rs) {
				try {
					if (rs.next()) {
						Type t = new Type();
						t.setId(rs.getLong("ID"));
						t.setName(rs.getString("NAME"));
						return t;
					}
				} catch (SQLException e) {
					e.printStackTrace();
					throw new Error(e);
				}
				return null;
			}
		};

		return get(TABLE_NAME, COLUMNS, id, processor);
	}

	@Override
	public void delete(long id) throws SQLException {
		delete(TABLE_NAME, id);
	}

	public Long getIdByName(String name) throws SQLException {
		return getIdByName(name, TABLE_NAME);
	}

}
