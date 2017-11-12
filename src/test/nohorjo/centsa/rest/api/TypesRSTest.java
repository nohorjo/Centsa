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
import nohorjo.centsa.rest.api.mock.MockTypesDAO;
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
		Type t = getRS(DAOOption.FINE).get(MockTypesDAO.ID);
		checkType(t);
	}

	@Test
	public void get_returnNull() throws SQLException {
		assertEquals(null, getRS(DAOOption.NONE).get(MockTypesDAO.ID));
	}

	@Test(expected = SQLException.class)
	public void get_throws() throws SQLException {
		getRS(DAOOption.ERROR).get(MockTypesDAO.ID);
	}

	@Test
	public void getAll_returnList() throws SQLException {
		List<Type> ts = getRS(DAOOption.FINE).getAll(MockTypesDAO.PAGE, MockTypesDAO.PAGE_SIZE, MockTypesDAO.ORDER);

		assertEquals(1, ts.size());
		checkType(ts.get(0));
	}

	@Test(expected = SQLException.class)
	public void getAll_throws() throws SQLException {
		getRS(DAOOption.ERROR).getAll(MockTypesDAO.PAGE, MockTypesDAO.PAGE_SIZE, MockTypesDAO.ORDER);
	}

	@Test
	public void getAll_emptyList() throws SQLException {
		List<Type> ts = getRS(DAOOption.NONE).getAll(MockTypesDAO.PAGE, MockTypesDAO.PAGE_SIZE, MockTypesDAO.ORDER);

		assertEquals(0, ts.size());
	}

	@Test
	public void delete_deletes() throws SQLException {
		getRS(DAOOption.FINE).delete(MockTypesDAO.ID);
	}

	@Test(expected = SQLException.class)
	public void delete_throws() throws SQLException {
		getRS(DAOOption.ERROR).delete(MockTypesDAO.ID);
	}

	@Test
	public void insert_inserts() throws SQLException {
		assertEquals(MockTypesDAO.ID, getRS(DAOOption.FINE).insert(MockTypesDAO.TYPE));
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
		assertEquals(MockTypesDAO.ID, t.getId().longValue());
		assertEquals(MockTypesDAO.NAME, t.getName());
		assertEquals(MockTypesDAO.SUM, t.getSum());
	}
}
