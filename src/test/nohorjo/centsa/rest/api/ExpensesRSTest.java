package nohorjo.centsa.rest.api;

import static org.junit.Assert.assertEquals;

import java.sql.SQLException;
import java.util.List;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.powermock.core.classloader.annotations.PrepareForTest;
import org.powermock.core.classloader.annotations.SuppressStaticInitializationFor;
import org.powermock.modules.junit4.PowerMockRunner;

import nohorjo.centsa.dbservices.AbstractDAO;
import nohorjo.centsa.dbservices.mock.DAOOption;
import nohorjo.centsa.dbservices.mock.MockDAO;
import nohorjo.centsa.dbservices.mock.MockExpensesDAO;
import nohorjo.centsa.vo.Expense;

/**
 * Test class for {@link ExpensesRS}
 * 
 * @author muhammed
 *
 */
@RunWith(PowerMockRunner.class)
@PrepareForTest(AbstractDAO.class)
@SuppressStaticInitializationFor("nohorjo.centsa.dbservices.AbstractDAO")
public class ExpensesRSTest {
	@Test
	public void get_returnType() throws SQLException {
		checkExpense(getRS(DAOOption.FINE).get(MockDAO.ID), false);
	}

	@Test
	public void get_returnNull() throws SQLException {
		assertEquals(null, getRS(DAOOption.NONE).get(MockDAO.ID));
	}

	@Test(expected = SQLException.class)
	public void get_throws() throws SQLException {
		getRS(DAOOption.ERROR).get(MockDAO.ID);
	}

	@Test
	public void getAll_returnList() throws SQLException {
		List<Expense> ts = getRS(DAOOption.FINE).getAll(MockDAO.PAGE, MockDAO.PAGE_SIZE, MockDAO.ORDER);

		assertEquals(1, ts.size());
		checkExpense(ts.get(0), false);
	}

	@Test(expected = SQLException.class)
	public void getAll_throws() throws SQLException {
		getRS(DAOOption.ERROR).getAll(MockDAO.PAGE, MockDAO.PAGE_SIZE, MockDAO.ORDER);
	}

	@Test
	public void getAll_emptyList() throws SQLException {
		assertEquals(0, getRS(DAOOption.NONE).getAll(MockDAO.PAGE, MockDAO.PAGE_SIZE, MockDAO.ORDER).size());
	}

	@Test
	public void delete_deletes() throws SQLException {
		getRS(DAOOption.FINE).delete(MockDAO.ID);
	}

	@Test(expected = SQLException.class)
	public void delete_throws() throws SQLException {
		getRS(DAOOption.ERROR).delete(MockDAO.ID);
	}

	@Test
	public void insert_inserts() throws SQLException {
		assertEquals(MockDAO.ID, getRS(DAOOption.FINE).insert(MockExpensesDAO.EXPENSE));
	}

	@Test(expected = SQLException.class)
	public void insert_throws() throws SQLException {
		getRS(DAOOption.ERROR).insert(MockExpensesDAO.EXPENSE);
	}

	@Test
	public void getAllActive_returns() throws SQLException {
		List<Expense> ts = getRS(DAOOption.FINE).getAllActive(MockDAO.PAGE, MockDAO.PAGE_SIZE, MockDAO.ORDER);

		assertEquals(1, ts.size());
		checkExpense(ts.get(0), true);
	}

	@Test
	public void getAllActive_empty() throws SQLException {
		List<Expense> ts = getRS(DAOOption.NONE).getAllActive(MockDAO.PAGE, MockDAO.PAGE_SIZE, MockDAO.ORDER);

		assertEquals(0, ts.size());
	}

	@Test(expected = SQLException.class)
	public void getAllActive_throws() throws SQLException {
		getRS(DAOOption.ERROR).getAllActive(MockDAO.PAGE, MockDAO.PAGE_SIZE, MockDAO.ORDER);
	}

	@Test
	public void getTotalActive_autoReturn() throws SQLException {
		assertEquals(MockExpensesDAO.TOTAL_ACTIVE_AUTO, getRS(DAOOption.FINE).getTotalActive(true));
	}

	@Test
	public void getTotalActive_nonAutoReturn() throws SQLException {
		assertEquals(MockExpensesDAO.TOTAL_ACTIVE_NON_AUTO, getRS(DAOOption.FINE).getTotalActive(false));
	}

	@Test(expected = SQLException.class)
	public void getTotalActive_autoThrow() throws SQLException {
		getRS(DAOOption.ERROR).getTotalActive(true);
	}

	@Test(expected = SQLException.class)
	public void getTotalActive_nonAutoThrow() throws SQLException {
		getRS(DAOOption.ERROR).getTotalActive(false);
	}

	/**
	 * Creates a {@link ExpensesRS} with a mocked DAO
	 * 
	 * @param option
	 *            DAO cofig
	 * @return Test RS
	 */
	private ExpensesRS getRS(DAOOption option) {
		ExpensesRS rs = new ExpensesRS();
		rs.setDao(new MockExpensesDAO(option));
		return rs;
	}

	private void checkExpense(Expense e, boolean active) {
		assertEquals(MockDAO.ID, e.getId().longValue());
		assertEquals(MockDAO.NAME, e.getName());
		assertEquals(MockExpensesDAO.COST, e.getCost());
		assertEquals(MockExpensesDAO.FREQUENCY_DAYS, e.getFrequency_days());
		assertEquals(active ? MockExpensesDAO.STARTED_2 : MockExpensesDAO.STARTED, e.getStarted());
		assertEquals(MockExpensesDAO.INSTANCES_COUNT, e.getInstance_count());
		assertEquals(MockExpensesDAO.AUTO, e.isAutomatic());
	}

}
