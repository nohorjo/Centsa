package nohorjo.centsa.dbservices;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.LinkedList;
import java.util.List;

import nohorjo.centsa.vo.Account;
import nohorjo.centsa.vo.VO;

public class AccountsDAO extends AbstractDAO {
	private static final String[] COLUMNS = { "NAME" };
	private static final String TABLE_NAME = "ACCOUNTS";

	static {
		try {
			new AccountsDAO().createTable();
		} catch (SQLException e) {
			throw new Error(e);
		}
	}

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
		List<Account> as = new LinkedList<>();

		try (ResultSet rs = getAll(TABLE_NAME, COLUMNS, order, page, pageSize)) {
			while (rs.next()) {
				Account a = new Account();
				a.setId(rs.getLong("ID"));
				a.setName(rs.getString("NAME"));
				as.add(a);
			}
		}
		return as;
	}

	@Override
	public Account get(long id) throws SQLException {
		try (ResultSet rs = get(TABLE_NAME, COLUMNS, id)) {
			if (rs.next()) {
				Account a = new Account();
				a.setId(rs.getLong("ID"));
				a.setName(rs.getString("NAME"));
				return a;
			}
		}
		return null;
	}

	@Override
	public void delete(long id) throws SQLException {
		delete(TABLE_NAME, id);
	}

}
