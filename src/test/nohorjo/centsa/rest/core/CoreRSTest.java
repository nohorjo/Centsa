package nohorjo.centsa.rest.core;

import static org.junit.Assert.assertEquals;
import static org.mockito.ArgumentMatchers.any;

import java.io.IOException;

import org.apache.commons.lang.RandomStringUtils;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.powermock.api.mockito.PowerMockito;
import org.powermock.core.classloader.annotations.PrepareForTest;
import org.powermock.modules.junit4.PowerMockRunner;

import nohorjo.util.ClasspathUtils;


/**
 * Test class for {@link CoreRS}
 * 
 * @author muhammed
 *
 */
@RunWith(PowerMockRunner.class)
@PrepareForTest(ClasspathUtils.class)
public class CoreRSTest {

	private boolean doThrow;

	private static final byte[] RESOURCE = RandomStringUtils.randomAlphabetic(10).getBytes();
	private static final String PATH = RandomStringUtils.randomAlphabetic(10);

	@Before
	public void init() throws IOException {
		PowerMockito.mockStatic(ClasspathUtils.class);
		PowerMockito.when(ClasspathUtils.getFileData(any(String.class))).then((i) -> {
			assertEquals("core/" + PATH, i.getArgument(0));
			if (doThrow)
				throw new IOException();
			return RESOURCE;
		});

		doThrow = false;
	}

	@Test
	public void getResource_returns() throws IOException {
		assertEquals(RESOURCE, new CoreRS().getResource(PATH));
	}

	@Test(expected = IOException.class)
	public void getResource_throws() throws IOException {
		doThrow = true;
		new CoreRS().getResource(PATH);
	}

}
