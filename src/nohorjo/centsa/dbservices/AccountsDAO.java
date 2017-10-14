package nohorjo.centsa.dbservices;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.LinkedList;
import java.util.List;
import java.util.function.Function;

import nohorjo.centsa.vo.Account;
import nohorjo.centsa.vo.VO;

public class AccountsDAO extends AbstractDAO {
	private static final String[] COLUMNS = { "NAME" };
	private static final String TABLE_NAME = "ACCOUNTS";

	@Override
	public void createTable() throws SQLException {
		createTable("Accounts.CreateTable");
	}

	@Override
	public long insert(VO _vo) throws SQLException {
		Account a = (Account) _vo;

		return insert(TABLE_NAME, COLUMNS, new Object[] { a.getId(), a.getName() });
	}

	@Override
	public List<Account> getAll(int page, int pageSize, String order) throws SQLException {
		Function<ResultSet, List<Account>> processor = new Function<ResultSet, List<Account>>() {

			@Override
			public List<Account> apply(ResultSet rs) {
				List<Account> as = new LinkedList<>();
				try {
					while (rs.next()) {
						Account a = new Account();
						a.setId(rs.getLong("ID"));
						a.setName(rs.getString("NAME"));
						as.add(a);
					}
				} catch (SQLException e) {
					e.printStackTrace();
					throw new Error(e);
				}
				return as;
			}
		};
		return getAll(TABLE_NAME, COLUMNS, order, page, pageSize, processor);
	}

	@Override
	public Account get(long id) throws SQLException {
		Function<ResultSet, Account> processor = new Function<ResultSet, Account>() {

			@Override
			public Account apply(ResultSet rs) {
				try {
					if (rs.next()) {
						Account a = new Account();
						a.setId(rs.getLong("ID"));
						a.setName(rs.getString("NAME"));
						return a;
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
