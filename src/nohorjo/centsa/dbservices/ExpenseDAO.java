package nohorjo.centsa.dbservices;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.LinkedList;
import java.util.List;

import nohorjo.centsa.vo.Expense;
import nohorjo.centsa.vo.VO;

public class ExpenseDAO extends AbstractDAO {
	private static final String[] COLUMNS = { "NAME", "COST", "FREQUENCY_DAYS", "STARTED", "ENDED", "AUTOMATIC" };
	private static final String TABLE_NAME = "EXPENSES";

	static {
		try {
			new ExpenseDAO().createTable();
		} catch (SQLException e) {
			throw new Error(e);
		}
	}

	@Override
	public void createTable() throws SQLException {
		createTable("Expenses.CreateTable");
	}

	@Override
	public long insert(VO _vo) throws SQLException {
		Expense e = (Expense) _vo;

		return insert(TABLE_NAME, COLUMNS, new Object[] { e.getId(), e.getName(), e.getCost(), e.getFrequencyDays(),
				e.getStarted(), e.getEnded(), e.isAutomatic() ? 1 : 0 });
	}

	@Override
	public List<Expense> getAll(int page, int pageSize, String order) throws SQLException {
		List<Expense> es = new LinkedList<>();

		try (ResultSet rs = getAll(TABLE_NAME, COLUMNS, order, page, pageSize)) {
			while (rs.next()) {
				Expense e = new Expense();
				e.setId(rs.getLong("ID"));
				e.setName(rs.getString("NAME"));
				e.setCost(rs.getDouble("COST"));
				e.setFrequencyDays(rs.getInt("FREQUENCY_DAYS"));
				e.setStarted(rs.getTimestamp("STARTED"));
				e.setEnded(rs.getTimestamp("ENDED"));
				e.setAutomatic(rs.getBoolean("AUTOMATIC"));
				es.add(e);
			}
		}
		return es;
	}

	@Override
	public VO get(long id) throws SQLException {
		try (ResultSet rs = get(TABLE_NAME, COLUMNS, id)) {
			if (rs.next()) {
				Expense e = new Expense();
				e.setId(rs.getLong("ID"));
				e.setName(rs.getString("NAME"));
				e.setCost(rs.getDouble("COST"));
				e.setFrequencyDays(rs.getInt("FREQUENCY_DAYS"));
				e.setStarted(rs.getTimestamp("STARTED"));
				e.setEnded(rs.getTimestamp("ENDED"));
				e.setAutomatic(rs.getBoolean("AUTOMATIC"));
				return e;
			}
		}
		return null;
	}

	@Override
	public void delete(long id) throws SQLException {
		delete(TABLE_NAME, id);
	}

}
