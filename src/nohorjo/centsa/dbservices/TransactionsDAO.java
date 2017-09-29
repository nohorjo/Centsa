package nohorjo.centsa.dbservices;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.LinkedList;
import java.util.List;

import nohorjo.centsa.vo.Transaction;
import nohorjo.centsa.vo.VO;

public class TransactionsDAO implements DAO {

	static {
		try {
			new TransactionsDAO().createTable();
		} catch (SQLException e) {
			throw new Error(e);
		}
	}

	@Override
	public void createTable() throws SQLException {
		try (Connection conn = SQLUtils.getConnection();
				PreparedStatement ps = conn.prepareStatement(SQLUtils.getQuery("Transactions.CreateTable"))) {
			ps.execute();
		}
	}

	@Override
	public List<Transaction> getAll(int page, int pageSize, String order) throws SQLException {
		page = (page > 0) ? page : 1;
		pageSize = (pageSize > 0) ? pageSize : Integer.MAX_VALUE;
		order = (order == null) ? order : "1 ASC";

		int skip = (page - 1) * pageSize;
		List<Transaction> ts = new LinkedList<>();

		try (Connection conn = SQLUtils.getConnection();
				PreparedStatement ps = conn
						.prepareStatement(SQLUtils.getQuery("Transactions.GetAll").replace("{orderby}", order))) {
			ps.setInt(1, skip);
			ps.setInt(2, pageSize);
			try (ResultSet rs = ps.executeQuery()) {
				while (rs.next()) {
					Transaction t = new Transaction();
					t.setId(rs.getLong("ID"));
					t.setAmount(rs.getDouble("AMOUNT"));
					t.setComment(rs.getString("COMMENT"));
					t.setAccountId(rs.getLong("ACCOUNT_ID"));
					t.setTypeId(rs.getLong("TYPE_ID"));
					t.setDate(rs.getDate("DATE"));
					t.setExpenseId(rs.getLong("EXPENSE_ID"));
					ts.add(t);
				}
			}
		}
		return ts;
	}

	@Override
	public Transaction get(long id) throws SQLException {
		try (Connection conn = SQLUtils.getConnection();
				PreparedStatement ps = conn.prepareStatement(SQLUtils.getQuery("Transactions.Get"))) {
			ps.setLong(1, id);
			try (ResultSet rs = ps.executeQuery()) {
				if (rs.next()) {
					Transaction t = new Transaction();
					t.setId(id);
					t.setAmount(rs.getDouble("AMOUNT"));
					t.setComment(rs.getString("COMMENT"));
					t.setAccountId(rs.getLong("ACCOUNT_ID"));
					t.setTypeId(rs.getLong("TYPE_ID"));
					t.setDate(rs.getDate("DATE"));
					t.setExpenseId(rs.getLong("EXPENSE_ID"));
					return t;
				}
			}
		}
		return null;
	}

	@Override
	public void delete(long id) throws SQLException {
		try (Connection conn = SQLUtils.getConnection();
				PreparedStatement ps = conn.prepareStatement(SQLUtils.getQuery("Transactions.Get"))) {
			ps.setLong(1, id);
			ps.executeUpdate();
		}
	}

	@Override
	public long insert(VO _vo) throws SQLException {
		Transaction t = (Transaction) _vo;
		try (Connection conn = SQLUtils.getConnection();
				PreparedStatement ps = conn.prepareStatement(SQLUtils.getQuery("Transactions.Insert"))) {
			ps.setObject(1, t.getId() > 0 ? t.getId() : null);
			ps.setDouble(2, t.getAmount());
			ps.setString(3, t.getComment());
			ps.setLong(4, t.getAccountId());
			ps.setLong(5, t.getTypeId());
			ps.setDate(5, t.getDate());
			ps.setLong(7, t.getExpenseId());
			try (ResultSet rs = ps.executeQuery()) {
				rs.next();
				return rs.getLong(1);
			}
		}
	}
}
