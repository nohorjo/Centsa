package nohorjo.centsa.dbservices;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.LinkedList;
import java.util.List;

import nohorjo.centsa.vo.Account;
import nohorjo.centsa.vo.VO;

/**
 * DAO class to handle accounts
 * 
 * @author muhammed.haque
 *
 */
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
	public List<Account> getAll(int page, int pageSize, String orderBy) throws SQLException {
		List<Account> as = new LinkedList<>();

		orderBy = (orderBy != null && orderBy.toLowerCase().matches("^(\\s*[a-z]* (asc|desc),?)+$")) ? orderBy
				: "1 ASC";
		page = (page > 0) ? page : 1;
		pageSize = (pageSize > 0) ? pageSize : Integer.MAX_VALUE;
		int skip = (page - 1) * pageSize;

		String sql = SQLUtils.getQuery("Accounts.GetAll").replace("{orderby}", orderBy);
		try (Connection conn = SQLUtils.getConnection(); PreparedStatement ps = conn.prepareStatement(sql)) {
			ps.setInt(1, skip);
			ps.setInt(2, pageSize);
			try (ResultSet rs = ps.executeQuery()) {
				while (rs.next()) {
					Account a = new Account();
					a.setId(rs.getLong("ID"));
					a.setName(rs.getString("NAME"));
					a.setBalance(rs.getInt("BALANCE"));

					as.add(a);
				}
			}
		}
		return as;
	}

	@Override
	public Account get(long id) throws SQLException {
		String sql = SQLUtils.getQuery("Accounts.Get");
		Account a = null;
		try (Connection conn = SQLUtils.getConnection(); PreparedStatement ps = conn.prepareStatement(sql)) {
			ps.setLong(1, id);
			try (ResultSet rs = ps.executeQuery()) {
				if (rs.next()) {
					a = new Account();
					a.setId(rs.getLong("ID"));
					a.setName(rs.getString("NAME"));
					a.setBalance(rs.getInt("BALANCE"));
				}
			}
		}

		return a;
	}

	@Override
	public void delete(long id) throws SQLException {
		throw new SQLException("Cannot delete accounts");
	}

	public Long getIdByName(String name) throws SQLException {
		return getIdByName(name, TABLE_NAME);
	}

}