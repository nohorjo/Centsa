package nohorjo.centsa.dbservices;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;
import java.util.function.Function;

import nohorjo.centsa.vo.Expense;
import nohorjo.centsa.vo.VO;

public class ExpensesDAO extends AbstractDAO {
	private static final String[] COLUMNS = { "NAME", "COST", "FREQUENCY_DAYS", "STARTED", "ENDED", "AUTOMATIC" };
	private static final String TABLE_NAME = "EXPENSES";

	@Override
	public void createTable() throws SQLException {
		createTable("Expenses.CreateTable");
	}

	@Override
	public long insert(VO _vo) throws SQLException {
		Expense e = (Expense) _vo;
		if (e.getId() != null && e.getId() == 1) {
			throw new SQLException("Cannot edit default expense");
		}

		return insert(TABLE_NAME, COLUMNS, new Object[] { e.getId(), e.getName(), e.getCost(), e.getFrequency_days(),
				e.getStarted(), e.getEnded(), e.isAutomatic() ? 1 : 0 });
	}

	@Override
	public List<Expense> getAll(int page, int pageSize, String order) throws SQLException {
		Function<ResultSet, List<Expense>> processor = new Function<ResultSet, List<Expense>>() {

			@Override
			public List<Expense> apply(ResultSet rs) {
				List<Expense> es = new LinkedList<>();
				try {
					while (rs.next()) {
						Expense e = new Expense();
						e.setId(rs.getLong("ID"));
						e.setName(rs.getString("NAME"));
						e.setCost(rs.getInt("COST"));
						e.setFrequency_days(rs.getInt("FREQUENCY_DAYS"));
						e.setStarted(rs.getLong("STARTED"));
						e.setEnded(rs.getLong("ENDED"));
						e.setAutomatic(rs.getBoolean("AUTOMATIC"));
						es.add(e);
					}
				} catch (SQLException e) {
					e.printStackTrace();
					throw new Error(e);
				}
				return es;
			}
		};
		return getAll(TABLE_NAME, COLUMNS, order, page, pageSize, processor);
	}

	@Override
	public Expense get(long id) throws SQLException {
		Function<ResultSet, Expense> processor = new Function<ResultSet, Expense>() {

			@Override
			public Expense apply(ResultSet rs) {
				try {
					if (rs.next()) {
						Expense e = new Expense();
						e.setId(rs.getLong("ID"));
						e.setName(rs.getString("NAME"));
						e.setCost(rs.getInt("COST"));
						e.setFrequency_days(rs.getInt("FREQUENCY_DAYS"));
						e.setStarted(rs.getLong("STARTED"));
						e.setEnded(rs.getLong("ENDED"));
						e.setAutomatic(rs.getBoolean("AUTOMATIC"));
						return e;
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
		if (id == 1) {
			throw new SQLException("Cannot delete default expense");
		}
		delete(TABLE_NAME, id);
	}

	public List<Expense> getAllAuto() throws SQLException {
		String sql = SQLUtils.getQuery("Expenses.GetAllAuto");
		List<Expense> es = new ArrayList<>();

		try (Connection conn = SQLUtils.getConnection();
				PreparedStatement ps = conn.prepareStatement(sql);
				ResultSet rs = ps.executeQuery()) {
			while (rs.next()) {
				Expense e = new Expense();
				e.setId(rs.getLong("ID"));
				e.setName(rs.getString("NAME"));
				e.setCost(rs.getInt("COST"));
				e.setFrequency_days(rs.getInt("FREQUENCY_DAYS"));
				e.setStarted(rs.getLong("STARTED"));
				e.setEnded((Long) rs.getObject("ENDED"));
				e.setAutomatic(true);
				es.add(e);
			}
		}

		return es;
	}

	public int getTotalActive(boolean auto) throws SQLException {
		String sql = SQLUtils.getQuery(auto ? "Expenses.GetTotalAuto" : "Expenses.GetTotalActive");
		try (Connection conn = SQLUtils.getConnection();
				PreparedStatement ps = conn.prepareStatement(sql);
				ResultSet rs = ps.executeQuery()) {
			if (rs.next()) {
				return rs.getInt(1);
			}
		}
		return 0;
	}

	public Long getIdByName(String name) throws SQLException {
		return getIdByName(name, TABLE_NAME);
	}

}
