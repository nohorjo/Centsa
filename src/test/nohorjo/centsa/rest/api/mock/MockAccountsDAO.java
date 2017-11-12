package nohorjo.centsa.rest.api.mock;

import java.sql.SQLException;
import java.util.List;

import nohorjo.centsa.dbservices.AccountsDAO;
import nohorjo.centsa.vo.Account;
import nohorjo.centsa.vo.VO;

public class MockAccountsDAO extends AccountsDAO {
	public static final int BALANCE = MockDAO.random.nextInt();

	public static final Account ACCOUNT;

	static {
		ACCOUNT = new Account();
		ACCOUNT.setId(MockDAO.ID);
		ACCOUNT.setName(MockDAO.NAME);
		ACCOUNT.setBalance(BALANCE);
	}

	private MockDAO<Account> mock;

	public MockAccountsDAO(DAOOption option) {
		mock = new MockDAO<Account>(option, ACCOUNT);
	}

	@Override
	public Account get(long id) throws SQLException {
		return mock.handleGet(id);
	}

	@Override
	public List<Account> getAll(int page, int pageSize, String orderBy) throws SQLException {
		return mock.handleGetAll(page, pageSize, orderBy);
	}

	@Override
	public void delete(long id) throws SQLException {
		mock.handleDelete();
	}

	@Override
	public long insert(VO _vo) throws SQLException {
		return mock.handleInsert((Account) _vo);
	}

	@Override
	public Long getIdByName(String name) throws SQLException {
		throw new Error("unimplemented");
	}
}
