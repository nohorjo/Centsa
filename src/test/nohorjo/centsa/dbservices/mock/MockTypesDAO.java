package nohorjo.centsa.dbservices.mock;

import java.sql.SQLException;
import java.util.List;

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

	public static final int SUM = MockDAO.random.nextInt();

	public static final Type TYPE;

	static {
		TYPE = new Type();
		TYPE.setId(MockDAO.ID);
		TYPE.setName(MockDAO.NAME);
		TYPE.setSum(SUM);
	}

	private MockDAO<Type> mock;

	public MockTypesDAO(DAOOption option) {
		mock = new MockDAO<>(option, TYPE);
	}

	@Override
	public Type get(long id) throws SQLException {
		return mock.handleGet(id);
	}

	@Override
	public List<Type> getAll(int page, int pageSize, String orderBy) throws SQLException {
		return mock.handleGetAll(page, pageSize, orderBy);
	}

	@Override
	public void delete(long id) throws SQLException {
		mock.handleDelete();
	}

	@Override
	public long insert(VO _vo) throws SQLException {
		return mock.handleInsert((Type) _vo);
	}

}
