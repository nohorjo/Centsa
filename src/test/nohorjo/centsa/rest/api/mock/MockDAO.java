package nohorjo.centsa.rest.api.mock;

import static org.junit.Assert.assertEquals;

import java.sql.SQLException;
import java.util.Arrays;
import java.util.List;
import java.util.Random;

public class MockDAO<T> {

	static Random random = new Random();

	public static final long ID = random.nextLong();
	public static final String ORDER = Long.toHexString(random.nextLong()), NAME = Long.toHexString(random.nextLong());
	public static final int PAGE = random.nextInt(), PAGE_SIZE = random.nextInt();

	private DAOOption option;
	private T toReturn;

	MockDAO(DAOOption option, T toReturn) {
		this.option = option;
		this.toReturn = toReturn;
	}

	T handleGet(long id) throws SQLException {
		assertEquals(ID, id);
		switch (option) {
		case ERROR:
			throw new SQLException();
		case FINE:
			return toReturn;
		case NONE:
			return null;
		}
		throw new IllegalStateException("Invalid option: " + option);
	}

	List<T> handleGetAll(int page, int pageSize, String orderBy) throws SQLException {
		assertEquals(PAGE, page);
		assertEquals(PAGE_SIZE, pageSize);
		assertEquals(ORDER, orderBy);

		switch (option) {
		case ERROR:
			throw new SQLException();
		case FINE:
			return Arrays.asList(toReturn);
		case NONE:
			return Arrays.asList();
		}
		throw new IllegalStateException("Invalid option: " + option);
	}

	void handleDelete() throws SQLException {
		switch (option) {
		case ERROR:
			throw new SQLException();
		case FINE:
			return;
		case NONE:
		}
		throw new IllegalStateException("Invalid option: " + option);
	}

	long handleInsert(T t) throws SQLException {
		switch (option) {
		case FINE:
			assertEquals(toReturn, t);
			return ID;
		case ERROR:
			throw new SQLException();
		case NONE:
		}
		throw new IllegalStateException("Invalid option: " + option);
	}

}
