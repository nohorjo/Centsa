package nohorjo.centsa.dbservices.mock;

import static org.junit.Assert.assertEquals;

import java.sql.SQLException;
import java.util.Arrays;
import java.util.List;

import org.apache.commons.lang.RandomStringUtils;
import org.apache.commons.lang.math.RandomUtils;

import nohorjo.centsa.dbservices.ExpensesDAO;
import nohorjo.centsa.vo.Expense;
import nohorjo.centsa.vo.VO;

public class MockExpensesDAO extends ExpensesDAO {

    public static final String FREQUENCY = RandomStringUtils.randomNumeric(10);
    public static final int COST = RandomUtils.nextInt(),
            INSTANCES_COUNT = RandomUtils.nextInt(), TOTAL_ACTIVE_AUTO = RandomUtils.nextInt(),
            TOTAL_ACTIVE_NON_AUTO = RandomUtils.nextInt();
    public static final long STARTED = RandomUtils.nextLong(), STARTED_2 = RandomUtils.nextLong();
    public static final boolean AUTO = RandomUtils.nextBoolean();

    public static final Expense EXPENSE;

    static {
        EXPENSE = new Expense();
        EXPENSE.setId(MockDAO.ID);
        EXPENSE.setName(MockDAO.NAME);
        EXPENSE.setCost(COST);
        EXPENSE.setFrequency(FREQUENCY);
        EXPENSE.setStarted(STARTED);
        EXPENSE.setAutomatic(AUTO);
        EXPENSE.setInstance_count(INSTANCES_COUNT);
    }

    private MockDAO<Expense> mock;
    private DAOOption option;

    public MockExpensesDAO(DAOOption option) {
        this.option = option;
        mock = new MockDAO<>(option, EXPENSE);
    }

    @Override
    public Expense get(long id) throws SQLException {
        return mock.handleGet(id);
    }

    @Override
    public List<Expense> getAll(int page, int pageSize, String orderBy) throws SQLException {
        return mock.handleGetAll(page, pageSize, orderBy);
    }

    @Override
    public void delete(long id) throws SQLException {
        mock.handleDelete();
    }

    @Override
    public long insert(VO _vo) throws SQLException {
        return mock.handleInsert((Expense) _vo);
    }

    @Override
    public List<Expense> getAllActive(int page, int pageSize, String order) throws SQLException {
        assertEquals(MockDAO.PAGE, page);
        assertEquals(MockDAO.PAGE_SIZE, pageSize);
        assertEquals(MockDAO.ORDER, order);

        switch (option) {
            case ERROR:
                throw new SQLException();
            case FINE:
                Expense e = new Expense();
                e.setId(MockDAO.ID);
                e.setName(MockDAO.NAME);
                e.setCost(COST);
                e.setFrequency(FREQUENCY);
                e.setStarted(STARTED_2);
                e.setAutomatic(AUTO);
                e.setInstance_count(INSTANCES_COUNT);
                return Arrays.asList(e);
            case NONE:
                return Arrays.asList();
        }
        throw new IllegalStateException("Invalid option: " + option);
    }

    @Override
    public int getTotalActive(boolean auto) throws SQLException {
        switch (option) {
            case ERROR:
                throw new SQLException();
            case FINE:
                return auto ? TOTAL_ACTIVE_AUTO : TOTAL_ACTIVE_NON_AUTO;
            case NONE:
        }
        throw new IllegalStateException("Invalid option: " + option);
    }

    @Override
    public Long getIdByName(String name) throws SQLException {
        return mock.handleGetIdByName(name);
    }

}
