package nohorjo.centsa.dbservices;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;
import java.util.stream.Collectors;

import nohorjo.centsa.vo.Expense;
import nohorjo.centsa.vo.Transaction;
import nohorjo.centsa.vo.VO;

/**
 * DAO class to handle expenses
 *
 * @author muhammed.haque
 */
public class ExpensesDAO extends AbstractDAO {
    private static final String[] COLUMNS = {"NAME", "COST", "FREQUENCY", "STARTED", "AUTOMATIC", "ACCOUNT_ID", "TYPE_ID"};
    private static final String TABLE_NAME = "EXPENSES";

    @Override
    public void createTable() throws SQLException {
        createTable("Expenses.CreateTable");
    }

    @Override
    public long insert(VO _vo) throws SQLException {
        Expense e = (Expense) _vo;
        if (e.getId() != null) {
            throw new SQLException("Cannot edit expense");
        }

        return insert(TABLE_NAME, COLUMNS, new Object[]{e.getId(), e.getName(), e.getCost(), e.getFrequency(),
                e.getStarted(), e.isAutomatic(), e.getAccount_id(), e.getType_id()});
    }

    @Override
    public List<Expense> getAll(int page, int pageSize, String order) throws SQLException {
        order = (order != null && order.toLowerCase().matches("^(\\s*[a-z]* (asc|desc),?)+$")) ? order : "1 ASC";
        page = (page > 0) ? page : 1;
        pageSize = (pageSize > 0) ? pageSize : Integer.MAX_VALUE;

        int skip = (page - 1) * pageSize;
        String sql = SQLUtils.getQuery("Expenses.GetAll").replace("{columns}", String.join(",", addIDColumn(COLUMNS))).replace("{orderby}", order);

        try (Connection conn = SQLUtils.getConnection(); PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, skip);
            ps.setInt(2, pageSize);
            try (ResultSet rs = ps.executeQuery()) {
                List<Expense> es = new LinkedList<>();
                while (rs.next()) {
                    Expense e = new Expense();
                    e.setId(rs.getLong("ID"));
                    e.setName(rs.getString("NAME"));
                    e.setCost(rs.getInt("COST"));
                    e.setFrequency(rs.getString("FREQUENCY"));
                    e.setStarted(rs.getLong("STARTED"));
                    e.setAutomatic(rs.getBoolean("AUTOMATIC"));
                    e.setInstance_count(rs.getInt("INSTANCE_COUNT"));
                    e.setAccount_id(rs.getLong("ACCOUNT_ID"));
                    e.setType_id(rs.getLong("TYPE_ID"));
                    es.add(e);
                }
                return es;
            }
        }
    }

    public List<Expense> getAllActive(int page, int pageSize, String order) throws SQLException {
        order = (order != null && order.toLowerCase().matches("^(\\s*[a-z]* (asc|desc),?)+$")) ? order : "1 ASC";
        page = (page > 0) ? page : 1;
        pageSize = (pageSize > 0) ? pageSize : Integer.MAX_VALUE;

        int skip = (page - 1) * pageSize;
        String sql = SQLUtils.getQuery("Expenses.GetAllActive").replace("{columns}", String.join(",", addIDColumn(COLUMNS))).replace("{orderby}", order);

        try (Connection conn = SQLUtils.getConnection(); PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, skip);
            ps.setInt(2, pageSize);
            try (ResultSet rs = ps.executeQuery()) {
                List<Expense> es = new LinkedList<>();
                while (rs.next()) {
                    Expense e = new Expense();
                    e.setId(rs.getLong("ID"));
                    e.setName(rs.getString("NAME"));
                    e.setCost(rs.getInt("COST"));
                    e.setFrequency(rs.getString("FREQUENCY"));
                    e.setStarted(rs.getLong("STARTED"));
                    e.setAutomatic(rs.getBoolean("AUTOMATIC"));
                    e.setInstance_count(rs.getInt("INSTANCE_COUNT"));
                    e.setAccount_id(rs.getLong("ACCOUNT_ID"));
                    e.setType_id(rs.getLong("TYPE_ID"));
                    es.add(e);
                }
                return es;
            }
        }
    }

    @Override
    public Expense get(long id) throws SQLException {
        String sql = SQLUtils.getQuery("Expenses.Get").replace("{columns}", String.join(",", addIDColumn(COLUMNS)));

        try (Connection conn = SQLUtils.getConnection(); PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setLong(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    Expense e = new Expense();
                    e.setId(rs.getLong("ID"));
                    e.setName(rs.getString("NAME"));
                    e.setCost(rs.getInt("COST"));
                    e.setFrequency(rs.getString("FREQUENCY"));
                    e.setStarted(rs.getLong("STARTED"));
                    e.setAutomatic(rs.getBoolean("AUTOMATIC"));
                    e.setInstance_count(rs.getInt("INSTANCE_COUNT"));
                    e.setAccount_id(rs.getLong("ACCOUNT_ID"));
                    e.setType_id(rs.getLong("TYPE_ID"));
                    return e;
                }
                return null;
            }
        }
    }

    @Override
    public void delete(long id) throws SQLException {
        if (id == 1) {
            throw new SQLException("Cannot delete default expense");
        }
        String sql = SQLUtils.getQuery("Expenses.ConvertToNA");
        try (Connection conn = SQLUtils.getConnection(); PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setLong(1, id);
            ps.executeUpdate();
        }
        delete(TABLE_NAME, id);
    }

    /**
     * Gets the daily sum of active expenses
     *
     * @param auto true if it should only count automatic expenses
     * @return The daily sum of the expenses
     * @throws SQLException
     */
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

    public static void applyAutoTransactions() throws SQLException {
        List<Expense> expenses = new ExpensesDAO().getAll(0, 0, null).stream().filter(Expense::isAutomatic).collect(Collectors.toList());
        List<Transaction> expected = new ArrayList<>();
        for(Expense e: expenses) expected.addAll(e.allTransactionsUntil(LocalDate.now()));

        new TransactionsDAO().insertAutoTransactions(expected);
    }
}
