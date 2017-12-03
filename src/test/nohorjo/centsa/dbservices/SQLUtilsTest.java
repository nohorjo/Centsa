package nohorjo.centsa.dbservices;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNull;
import static org.mockito.ArgumentMatchers.*;

import java.io.ByteArrayInputStream;
import java.io.FileNotFoundException;

import org.apache.commons.lang.RandomStringUtils;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.powermock.api.mockito.PowerMockito;
import org.powermock.core.classloader.annotations.PrepareForTest;
import org.powermock.modules.junit4.PowerMockRunner;

import nohorjo.util.ClasspathUtils;

@RunWith(PowerMockRunner.class)
@PrepareForTest(ClasspathUtils.class)
public class SQLUtilsTest {

	private static final String ROOT = RandomStringUtils.randomAlphabetic(10),
			KEY = RandomStringUtils.randomAlphabetic(10), VALUE = RandomStringUtils.randomAlphabetic(10);

	@Before
	public void init() throws FileNotFoundException {
		PowerMockito.mockStatic(ClasspathUtils.class);

		PowerMockito.when(ClasspathUtils.getFileAsStream(any(String.class))).thenReturn(new ByteArrayInputStream(
				String.format("<%s><%s>%s</%s></%s>", ROOT, KEY, VALUE, KEY, ROOT).getBytes()));
	}

	@Test
	public void getQuery_returns() {
		assertEquals(VALUE, SQLUtils.getQuery(KEY));
	}

	@Test
	public void getQuery_null() {
		assertNull(SQLUtils.getQuery(ROOT));
	}

}
