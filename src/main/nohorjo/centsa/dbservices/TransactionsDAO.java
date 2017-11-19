package nohorjo.centsa.dbservices;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.function.Function;

import nohorjo.centsa.vo.Transaction;
import nohorjo.centsa.vo.TransactionFilter;
import nohorjo.centsa.vo.VO;

/**
 * DAO class to handle transactions
 * 
 * @author muhammed.haque
 *
 */
public class TransactionsDAO extends AbstractDAO {

	private static final String[] COLUMNS = { "AMOUNT", "COMMENT", "ACCOUNT_ID", "TYPE_ID", "EXPENSE_ID", "DATE" };
	private static final String TABLE_NAME = "TRANSACTIONS";

	@Override
	public void createTable() throws SQLException {
		createTable("Transactions.CreateTable");
	}

	@Override
	public long insert(VO _vo) throws SQLException {
		Transaction t = (Transaction) _vo;

		return insert(TABLE_NAME, COLUMNS, new Object[] { t.getId(), t.getAmount(), t.getComment(), t.getAccount_id(),
				t.getType_id(), t.getExpense_id(), t.getDate() });
	}

	/**
	 * Gets all trasactions
	 * 
	 * @param page
	 *            The page number if paginated
	 * @param pageSize
	 *            The size of each page if paginated
	 * @param order
	 *            The order clause
	 * @param filter
	 *            Used to filter the results
	 * @return A list of transactions
	 * @throws SQLException
	 */
	public List<Transaction> getAll(int page, int pageSize, String order, TransactionFilter filter)
			throws SQLException {
		List<Transaction> ts = new LinkedList<>();

		// Reject invalid ORDER BY clause
		order = (order != null && order.toLowerCase().matches("^(\\s*[a-z]* (asc|desc),?)+$")) ? order : "1 ASC";
		page = (page > 0) ? page : 1;
		pageSize = (pageSize > 0) ? pageSize : Integer.MAX_VALUE;

		int skip = (page - 1) * pageSize;
		String sql = SQLUtils.getQuery("Transactions.GetAll").replace("{orderby}", order).replace("{filter}",
				filter.getFilterClause());
		try (Connection conn = SQLUtils.getConnection(); PreparedStatement ps = conn.prepareStatement(sql)) {
			ps.setInt(1, skip);
			ps.setInt(2, pageSize);
			try (ResultSet rs = ps.executeQuery()) {
				while (rs.next()) {
					Transaction t = new Transaction();
					t.setId(rs.getLong("ID"));
					t.setAmount(rs.getInt("AMOUNT"));
					t.setComment(rs.getString("COMMENT"));
					t.setAccount_id(rs.getLong("ACCOUNT_ID"));
					t.setType_id(rs.getLong("TYPE_ID"));
					t.setDate(rs.getLong("DATE"));
					t.setExpense_id(rs.getLong("EXPENSE_ID"));
					ts.add(t);
				}
			}
		}
		return ts;
	}

	@Override
	public Transaction get(long id) throws SQLException {
		Function<ResultSet, Transaction> processor = new Function<ResultSet, Transaction>() {

			@Override
			public Transaction apply(ResultSet rs) {
				try {
					if (rs.next()) {
						Transaction t = new Transaction();
						t.setId(id);
						t.setAmount(rs.getInt("AMOUNT"));
						t.setComment(rs.getString("COMMENT"));
						t.setAccount_id(rs.getLong("ACCOUNT_ID"));
						t.setType_id(rs.getLong("TYPE_ID"));
						t.setDate(rs.getLong("DATE"));
						t.setExpense_id(rs.getLong("EXPENSE_ID"));
						return t;
					}
				} catch (SQLException e) {
					e.printStackTrace();
					throw new RuntimeException(e);
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

	/**
	 * Counts the number of pages based on the page size
	 * 
	 * @param pageSize
	 *            The number of records per page
	 * @param filter
	 *            Used to filter the results
	 * @return The number of pages
	 * @throws SQLException
	 */
	public int countPages(int pageSize, TransactionFilter filter) throws SQLException {
		String sql = SQLUtils.getQuery("Transactions.Count").replace("{filter}", filter.getFilterClause());
		double pages = 0;
		try (Connection conn = SQLUtils.getConnection();
				PreparedStatement ps = conn.prepareStatement(sql);
				ResultSet rs = ps.executeQuery()) {
			if (rs.next()) {
				pages = rs.getInt(1);
			}
		}
		return (int) Math.ceil(pages / pageSize);
	}

	/**
	 * Gets a list of distinct comments
	 * 
	 * @return A list of distinct comments
	 * @throws SQLException
	 */
	public List<String> getUniqueComments() throws SQLException {
		String sql = SQLUtils.getQuery("Transactions.UniqueComments");
		List<String> comments = new ArrayList<>();
		try (Connection conn = SQLUtils.getConnection();
				PreparedStatement ps = conn.prepareStatement(sql);
				ResultSet rs = ps.executeQuery()) {
			while (rs.next()) {
				comments.add(rs.getString(1));
			}
		}
		return comments;
	}

	/**
	 * Gets a list of cumulative sums of transactions
	 * 
	 * @param precision
	 *            A number between 1 and the count of transactions, will default to
	 *            the latter otherwise. Used to limit the number of values returned.
	 *            1 will return the first and last value while the transactions
	 *            count will return all.
	 * @return A list of cumulative sums of transactions
	 * @throws SQLException
	 */
	public List<Map<String, Long>> getCumulativeSums(int precision) throws SQLException {
		List<Map<String, Long>> working = new LinkedList<>();
		List<Map<String, Long>> rtn = new LinkedList<>();
		long currentSum = 0;

		String sql = SQLUtils.getQuery("Transactions.GetDatesAndAmounts");

		try (Connection conn = SQLUtils.getConnection();
				PreparedStatement ps = conn.prepareStatement(sql);
				ResultSet rs = ps.executeQuery()) {
			while (rs.next()) {
				Map<String, Long> entry = new HashMap<>();
				entry.put("date", rs.getLong("DATE"));
				entry.put("sum", currentSum -= rs.getInt("AMOUNT"));
				working.add(entry);
			}
		}
		if (!working.isEmpty()) {
			if (precision < 1 || precision > working.size()) {
				precision = working.size();// default to returning all
			}
			precision = (working.size() / precision);

			for (int i = 0; i < working.size(); i++) {
				if (i % precision == 0) {
					rtn.add(working.get(i));
				}
			}
		}

		return rtn;
	}

	@Override
	public List<? extends VO> getAll(int page, int pageSize, String order) throws SQLException {
		return getAll(page, pageSize, order, new TransactionFilter());
	}

	/**
	 * Sums all transactions
	 * 
	 * @return The total amount of money
	 * @throws SQLException
	 */
	public int sumAll() throws SQLException {
		String sql = SQLUtils.getQuery("Transactions.SumAll");
		try (Connection conn = SQLUtils.getConnection();
				PreparedStatement ps = conn.prepareStatement(sql);
				ResultSet rs = ps.executeQuery()) {
			if (rs.next()) {
				return rs.getInt(1);
			}
		}
		return 0;
	}

	public List<Transaction> getAll(TransactionFilter filter, int page, int pageSize, String orderBy)
			throws SQLException {
		// TODO Auto-generated method stub
		return null;
	}

}
