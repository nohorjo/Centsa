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
import nohorjo.centsa.dbservices.mock.MockTypesDAO;
import nohorjo.centsa.vo.Type;

/**
 * Test class for {@link TypesRS}
 * 
 * @author muhammed
 *
 */
@RunWith(PowerMockRunner.class)
@PrepareForTest(AbstractDAO.class)
@SuppressStaticInitializationFor("nohorjo.centsa.dbservices.AbstractDAO")
public class TypesRSTest {

	@Test
	public void get_returnType() throws SQLException {
		checkType(getRS(DAOOption.FINE).get(MockDAO.ID));
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
		List<Type> ts = getRS(DAOOption.FINE).getAll(MockDAO.PAGE, MockDAO.PAGE_SIZE, MockDAO.ORDER);

		assertEquals(1, ts.size());
		checkType(ts.get(0));
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
		assertEquals(MockDAO.ID, getRS(DAOOption.FINE).insert(MockTypesDAO.TYPE));
	}

	@Test(expected = SQLException.class)
	public void insert_throws() throws SQLException {
		getRS(DAOOption.ERROR).insert(MockTypesDAO.TYPE);
	}

	/**
	 * Creates a {@link TypesRS} with a mocked DAO
	 * 
	 * @param option
	 *            DAO cofig
	 * @return Test RS
	 */
	private TypesRS getRS(DAOOption option) {
		TypesRS rs = new TypesRS();
		rs.setDao(new MockTypesDAO(option));
		return rs;
	}

	private void checkType(Type t) {
		assertEquals(MockDAO.ID, t.getId().longValue());
		assertEquals(MockDAO.NAME, t.getName());
		assertEquals(MockTypesDAO.SUM, t.getSum());
	}
}
