package nohorjo.centsa.rest.api.mock;

import static org.junit.Assert.assertEquals;
import java.sql.SQLException;
import java.util.Arrays;
import java.util.List;
import java.util.Random;

import nohorjo.centsa.dbservices.TypesDAO;
import nohorjo.centsa.vo.Type;
import nohorjo.centsa.vo.VO;

/**
 * A mock of {@link TypesDAO}
 * 
 * @author muhammed
 *
 */
public class MockTypesDAO extends TypesDAO {
	private static Random r = new Random();

	public static final long ID = r.nextLong();
	public static final String ORDER = Long.toHexString(r.nextLong()), NAME = Long.toHexString(r.nextLong());
	public static final int SUM = r.nextInt(), PAGE = r.nextInt(), PAGE_SIZE = r.nextInt();

	public static final Type TYPE;

	static {
		TYPE = new Type();
		TYPE.setId(ID);
		TYPE.setName(NAME);
		TYPE.setSum(SUM);
	}

	private DAOOption option;

	public MockTypesDAO(DAOOption option) {
		this.option = option;
	}

	@Override
	public Type get(long id) throws SQLException {
		assertEquals(ID, id);

		switch (option) {
		case ERROR:
			throw new SQLException();
		case FINE:
			return TYPE;
		case NONE:
			return null;
		}
		throw new IllegalStateException("Invalid option: " + option);
	}

	@Override
	public List<Type> getAll(int page, int pageSize, String orderBy) throws SQLException {
		assertEquals(PAGE, page);
		assertEquals(PAGE_SIZE, pageSize);
		assertEquals(ORDER, orderBy);

		switch (option) {
		case ERROR:
			throw new SQLException();
		case FINE:
			return Arrays.asList(TYPE);
		case NONE:
			return Arrays.asList();
		}
		throw new IllegalStateException("Invalid option: " + option);
	}

	@Override
	public void delete(long id) throws SQLException {
		switch (option) {
		case ERROR:
			throw new SQLException();
		case FINE:
			return;
		case NONE:
		}
		throw new IllegalStateException("Invalid option: " + option);
	}

	@Override
	public long insert(VO _vo) throws SQLException {
		Type t = (Type) _vo;
		switch (option) {
		case FINE:
			assertEquals(TYPE, t);
			return ID;
		case ERROR:
			throw new SQLException();
		case NONE:
		}
		throw new IllegalStateException("Invalid option: " + option);
	}

}
