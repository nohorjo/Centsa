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
import nohorjo.centsa.rest.api.mock.DAOOption;
import nohorjo.centsa.rest.api.mock.MockAccountsDAO;
import nohorjo.centsa.rest.api.mock.MockDAO;
import nohorjo.centsa.vo.Account;

/**
 * Test class for {@link AccountsRS}
 * 
 * @author muhammed
 *
 */
@RunWith(PowerMockRunner.class)
@PrepareForTest(AbstractDAO.class)
@SuppressStaticInitializationFor("nohorjo.centsa.dbservices.AbstractDAO")
public class AccountsRSTest {

	@Test
	public void get_returnType() throws SQLException {
		checkAccount(getRS(DAOOption.FINE).get(MockDAO.ID));
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
		List<Account> ts = getRS(DAOOption.FINE).getAll(MockDAO.PAGE, MockDAO.PAGE_SIZE, MockDAO.ORDER);

		assertEquals(1, ts.size());
		checkAccount(ts.get(0));
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
		assertEquals(MockDAO.ID, getRS(DAOOption.FINE).insert(MockAccountsDAO.ACCOUNT));
	}

	@Test(expected = SQLException.class)
	public void insert_throws() throws SQLException {
		getRS(DAOOption.ERROR).insert(MockAccountsDAO.ACCOUNT);
	}

	/**
	 * Creates a {@link TypesRS} with a mocked DAO
	 * 
	 * @param option
	 *            DAO cofig
	 * @return Test RS
	 */
	private AccountsRS getRS(DAOOption option) {
		AccountsRS rs = new AccountsRS();
		rs.setDao(new MockAccountsDAO(option));
		return rs;
	}

	private void checkAccount(Account a) {
		assertEquals(MockDAO.ID, a.getId().longValue());
		assertEquals(MockDAO.NAME, a.getName());
		assertEquals(MockAccountsDAO.BALANCE, a.getBalance());
	}
}
