package nohorjo.centsa.rest.core;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;
import static org.mockito.ArgumentMatchers.any;

import java.io.IOException;
import java.util.Arrays;

import org.apache.commons.lang.RandomStringUtils;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.powermock.api.mockito.PowerMockito;
import org.powermock.core.classloader.annotations.PrepareForTest;
import org.powermock.core.classloader.annotations.SuppressStaticInitializationFor;
import org.powermock.modules.junit4.PowerMockRunner;

import nohorjo.centsa.properties.SystemProperties;
import nohorjo.util.ClasspathUtils;

/**
 * Test class for {@link LayoutRS}
 * 
 * @author muhammed
 *
 */
@RunWith(PowerMockRunner.class)
@PrepareForTest({ ClasspathUtils.class, SystemProperties.class })
@SuppressStaticInitializationFor("nohorjo.centsa.properties.SystemProperties")
public class LayoutRSTest {

	private boolean doThrow;

	private static final String RESOURCE = RandomStringUtils.randomAlphabetic(10),
			PATH = RandomStringUtils.randomAlphabetic(10), LAYOUT = RandomStringUtils.randomAlphabetic(10);

	@Before
	public void init() throws IOException {
		PowerMockito.mockStatic(ClasspathUtils.class, SystemProperties.class);

		PowerMockito.when(ClasspathUtils.getFileData(any(String.class))).then((i) -> {
			assertEquals("layout/" + LAYOUT + "/" + PATH, i.getArgument(0));
			if (doThrow)
				throw new IOException();
			return RESOURCE.getBytes();
		});

		PowerMockito.when(SystemProperties.get("layout", String.class)).then((i) -> {
			return LAYOUT;
		});

		doThrow = false;
	}

	@Test
	public void getResource_returns() throws IOException {
		assertEquals(RESOURCE, new LayoutRS().getResource(PATH));
	}

	@Test(expected = IOException.class)
	public void getResource_throws() throws IOException {
		doThrow = true;
		new LayoutRS().getResource(PATH);
	}

	@Test
	public void getImage_returns() throws IOException {
		assertTrue(Arrays.equals(new LayoutRS().getFile(PATH), RESOURCE.getBytes()));
	}

	@Test(expected = IOException.class)
	public void getImage_throws() throws IOException {
		doThrow = true;
		new LayoutRS().getFile(PATH);
	}

}
