package nohorjo.centsa.dbservices.mock;

import static org.junit.Assert.assertEquals;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import nohorjo.centsa.dbservices.TransactionsDAO;
import nohorjo.centsa.vo.Transaction;
import nohorjo.centsa.vo.TransactionFilter;
import nohorjo.centsa.vo.VO;

public class MockTransactionsDAO extends TransactionsDAO {

	public static final Transaction TRANSACTION;
	public static final int AMMOUNT = MockDAO.random.nextInt(), PAGE_COUNT = MockDAO.random.nextInt(),
			PRECISION = MockDAO.random.nextInt(), SUM = MockDAO.random.nextInt();
	public static final String COMMENT = Long.toHexString(MockDAO.random.nextLong());
	public static final long ACCOUNT_ID = MockDAO.random.nextLong(), TYPE_ID = MockDAO.random.nextLong(),
			DATE = MockDAO.random.nextLong(), EXPENSE_ID = MockDAO.random.nextLong();
	public static final List<String> COMMENTS = Arrays.asList(Long.toHexString(MockDAO.random.nextLong()),
			Long.toHexString(MockDAO.random.nextLong()), Long.toHexString(MockDAO.random.nextLong()));
	public static final List<Map<String, Long>> SUMS;
	public static final TransactionFilter FILTER = new TransactionFilter();

	static {
		TRANSACTION = new Transaction();
		TRANSACTION.setId(MockDAO.ID);
		TRANSACTION.setAmount(AMMOUNT);
		TRANSACTION.setComment(COMMENT);
		TRANSACTION.setAccount_id(ACCOUNT_ID);
		TRANSACTION.setType_id(TYPE_ID);
		TRANSACTION.setDate(DATE);
		TRANSACTION.setExpense_id(EXPENSE_ID);

		SUMS = new ArrayList<>();

		Map<String, Long> sum1 = new HashMap<>();
		sum1.put(Long.toHexString(MockDAO.random.nextLong()), MockDAO.random.nextLong());
		sum1.put(Long.toHexString(MockDAO.random.nextLong()), MockDAO.random.nextLong());
		sum1.put(Long.toHexString(MockDAO.random.nextLong()), MockDAO.random.nextLong());

		Map<String, Long> sum2 = new HashMap<>();
		sum2.put(Long.toHexString(MockDAO.random.nextLong()), MockDAO.random.nextLong());
		sum2.put(Long.toHexString(MockDAO.random.nextLong()), MockDAO.random.nextLong());
		sum2.put(Long.toHexString(MockDAO.random.nextLong()), MockDAO.random.nextLong());

		Map<String, Long> sum3 = new HashMap<>();
		sum3.put(Long.toHexString(MockDAO.random.nextLong()), MockDAO.random.nextLong());
		sum3.put(Long.toHexString(MockDAO.random.nextLong()), MockDAO.random.nextLong());
		sum3.put(Long.toHexString(MockDAO.random.nextLong()), MockDAO.random.nextLong());

		SUMS.add(sum1);
		SUMS.add(sum2);
		SUMS.add(sum3);
	}

	private MockDAO<Transaction> mock;
	private DAOOption option;

	public MockTransactionsDAO(DAOOption option) {
		this.option = option;
		mock = new MockDAO<>(option, TRANSACTION);
	}

	@Override
	public Transaction get(long id) throws SQLException {
		return mock.handleGet(id);
	}

	@Override
	public List<Transaction> getAll(int page, int pageSize, String orderBy, TransactionFilter filter)
			throws SQLException {
		assertEquals(FILTER, filter);
		return mock.handleGetAll(page, pageSize, orderBy);
	}

	@Override
	public void delete(long id) throws SQLException {
		mock.handleDelete();
	}

	@Override
	public long insert(VO _vo) throws SQLException {
		return mock.handleInsert((Transaction) _vo);
	}

	@Override
	public int countPages(int pageSize, TransactionFilter filter) throws SQLException {
		assertEquals(MockDAO.PAGE_SIZE, pageSize);
		assertEquals(FILTER, filter);
		switch (option) {
		case ERROR:
			throw new SQLException();
		case FINE:
			return PAGE_COUNT;
		case NONE:
		}
		throw new IllegalStateException("Invalid option: " + option);
	}

	@Override
	public List<String> getUniqueComments() throws SQLException {
		switch (option) {
		case FINE:
			return COMMENTS;
		case ERROR:
			throw new SQLException();
		case NONE:
		}
		throw new IllegalStateException("Invalid option: " + option);
	}

	@Override
	public List<Map<String, Long>> getCumulativeSums(int precision) throws SQLException {
		assertEquals(PRECISION, precision);
		switch (option) {
		case ERROR:
			throw new SQLException();
		case FINE:
			return SUMS;
		case NONE:
		}
		throw new IllegalStateException("Invalid option: " + option);
	}

	@Override
	public int sumAll() throws SQLException {
		switch (option) {
		case ERROR:
			throw new SQLException();
		case FINE:
			return SUM;
		case NONE:
		}
		throw new IllegalStateException("Invalid option: " + option);
	}
}
