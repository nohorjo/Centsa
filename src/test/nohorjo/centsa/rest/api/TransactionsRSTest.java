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
import nohorjo.centsa.dbservices.mock.MockTransactionsDAO;
import nohorjo.centsa.vo.Transaction;

/**
 * Test class for {@link TransactionsRS}
 * 
 * @author muhammed
 *
 */
@RunWith(PowerMockRunner.class)
@PrepareForTest(AbstractDAO.class)
@SuppressStaticInitializationFor("nohorjo.centsa.dbservices.AbstractDAO")
public class TransactionsRSTest {

	@Test
	public void get_returnType() throws SQLException {
		checkTransaction(getRS(DAOOption.FINE).get(MockDAO.ID));
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
		List<Transaction> ts = getRS(DAOOption.FINE).getAll(MockTransactionsDAO.FILTER, MockDAO.PAGE, MockDAO.PAGE_SIZE,
				MockDAO.ORDER);

		assertEquals(1, ts.size());
		checkTransaction(ts.get(0));
	}

	@Test(expected = SQLException.class)
	public void getAll_throws() throws SQLException {
		getRS(DAOOption.ERROR).getAll(MockTransactionsDAO.FILTER, MockDAO.PAGE, MockDAO.PAGE_SIZE, MockDAO.ORDER);
	}

	@Test
	public void getAll_emptyList() throws SQLException {
		assertEquals(0, getRS(DAOOption.NONE)
				.getAll(MockTransactionsDAO.FILTER, MockDAO.PAGE, MockDAO.PAGE_SIZE, MockDAO.ORDER).size());
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
		assertEquals(MockDAO.ID, getRS(DAOOption.FINE).insert(MockTransactionsDAO.TRANSACTION));
	}

	@Test(expected = SQLException.class)
	public void insert_throws() throws SQLException {
		getRS(DAOOption.ERROR).insert(MockTransactionsDAO.TRANSACTION);
	}

	@Test
	public void getUniqueComments_returnsComments() throws SQLException {
		assertEquals(MockTransactionsDAO.COMMENTS, getRS(DAOOption.FINE).getUniqueComments());
	}

	@Test(expected = SQLException.class)
	public void getUniqueComments_throws() throws SQLException {
		getRS(DAOOption.ERROR).getUniqueComments();
	}

	@Test
	public void getCountPages_returnsCount() throws SQLException {
		assertEquals(MockTransactionsDAO.PAGE_COUNT,
				getRS(DAOOption.FINE).countPages(MockTransactionsDAO.FILTER, MockDAO.PAGE_SIZE));
	}

	@Test(expected = SQLException.class)
	public void getCountPages_throws() throws SQLException {
		getRS(DAOOption.ERROR).countPages(MockTransactionsDAO.FILTER, MockDAO.PAGE_SIZE);
	}

	@Test
	public void getCumulativeSums_returnsCount() throws SQLException {
		assertEquals(MockTransactionsDAO.SUMS, getRS(DAOOption.FINE).getCumulativeSums(MockTransactionsDAO.PRECISION));
	}

	@Test(expected = SQLException.class)
	public void getCumulativeSums_throws() throws SQLException {
		getRS(DAOOption.ERROR).getCumulativeSums(MockTransactionsDAO.PRECISION);
	}

	/**
	 * Creates a {@link TransactionsRS} with a mocked DAO
	 * 
	 * @param option
	 *            DAO cofig
	 * @return Test RS
	 */
	private TransactionsRS getRS(DAOOption option) {
		TransactionsRS rs = new TransactionsRS();
		rs.setDao(new MockTransactionsDAO(option));
		return rs;
	}

	private void checkTransaction(Transaction t) {
		assertEquals(MockDAO.ID, t.getId().longValue());
		assertEquals(MockTransactionsDAO.ACCOUNT_ID, t.getAccount_id());
		assertEquals(MockTransactionsDAO.AMMOUNT, t.getAmount());
		assertEquals(MockTransactionsDAO.COMMENT, t.getComment());
		assertEquals(MockTransactionsDAO.TYPE_ID, t.getType_id());
		assertEquals(MockTransactionsDAO.EXPENSE_ID, t.getExpense_id());
		assertEquals(MockTransactionsDAO.DATE, t.getDate());
	}

}
