package nohorjo.centsa.properties;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertTrue;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.security.InvalidParameterException;

import org.apache.commons.io.FileUtils;
import org.apache.commons.lang.RandomStringUtils;
import org.apache.commons.lang.math.RandomUtils;
import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.FixMethodOrder;
import org.junit.Test;
import org.junit.runners.MethodSorters;

@FixMethodOrder(MethodSorters.NAME_ASCENDING)
public class SystemPropertiesTest {

	private static final String NO_PROP = RandomStringUtils.randomAlphabetic(11),
			PROP_1 = RandomStringUtils.randomAlphabetic(10), PROP_2 = RandomStringUtils.randomAlphabetic(10),
			PROP_3 = RandomStringUtils.randomAlphabetic(10), PROP_4 = RandomStringUtils.randomAlphabetic(10),
			PROP_5 = RandomStringUtils.randomAlphabetic(10), VAL_1 = RandomStringUtils.randomAlphabetic(10),
			VAL_2 = RandomStringUtils.randomAlphabetic(10), VAL_3 = RandomStringUtils.randomAlphabetic(10),
			VAL_8 = RandomStringUtils.randomAlphabetic(10);
	private static final int VAL_4 = RandomUtils.nextInt();
	private static final double VAL_5 = RandomUtils.nextDouble();
	private static final Object VAL_6 = new Object();
	private static final boolean VAL_7 = RandomUtils.nextBoolean();

	private static final String ROOT = ClassLoader.getSystemResource(".").getPath();
	private static final File SYSTEM_PROPERTIES = new File(ROOT + "/system.properties");
	private static final File DEFAULT_PROPERTIES = new File(ROOT + "/default.properties");

	@BeforeClass
	public static void init() throws IOException {
		System.setProperty("root.dir", ROOT);
		StringBuilder properties = new StringBuilder();
		properties.append(String.format("%s=%s\n", PROP_1, VAL_1));
		properties.append(String.format("%s=%s\n", PROP_2, VAL_2));

		StringBuilder defProperties = new StringBuilder();
		defProperties.append(String.format("%s=%s\n", PROP_2, VAL_1));
		defProperties.append(String.format("%s=%s\n", PROP_3, VAL_3));

		FileUtils.write(SYSTEM_PROPERTIES, properties);
		FileUtils.write(DEFAULT_PROPERTIES, defProperties);
	}

	@Test
	public void A_get_defaultsApplied() {
		assertEquals(VAL_1, SystemProperties.get(PROP_1, String.class));
		assertEquals(VAL_2, SystemProperties.get(PROP_2, String.class));
		assertEquals(VAL_3, SystemProperties.get(PROP_3, String.class));
	}

	@Test
	public void B_set_get_casts() {
		SystemProperties.set(PROP_1, VAL_4);
		SystemProperties.set(PROP_2, VAL_5);
		SystemProperties.set(PROP_3, VAL_6);
		SystemProperties.set(PROP_4, VAL_7);
		assertEquals((int) VAL_4, (int) SystemProperties.get(PROP_1, Integer.class));
		assertEquals((double) VAL_5, (double) SystemProperties.get(PROP_2, Double.class), 0);
		assertEquals(VAL_6, SystemProperties.get(PROP_3, Object.class));
		assertEquals(VAL_7, SystemProperties.get(PROP_4, Boolean.class));
	}

	@Test
	public void C_persistence() throws IOException {
		String fileConts = FileUtils.readFileToString(SYSTEM_PROPERTIES).replace(" = ", "=");

		assertTrue(fileConts.contains(PROP_1 + "=" + VAL_4));
		assertTrue(fileConts.contains(PROP_2 + "=" + VAL_5));
		assertTrue(fileConts.contains(PROP_3 + "=" + VAL_6));
		assertTrue(fileConts.contains(PROP_4 + "=" + VAL_7));
	}

	@Test
	public void C_setRuntime_get_noPersistence() throws IOException {
		SystemProperties.setRuntime(PROP_5, VAL_8);

		assertEquals(VAL_8, SystemProperties.get(PROP_5, String.class));

		String fileConts = FileUtils.readFileToString(SYSTEM_PROPERTIES).replace(" = ", "=");

		assertFalse(fileConts.contains(PROP_5 + "=" + VAL_8));
	}

	@Test(expected = InvalidParameterException.class)
	public void D_get_invalidClass() throws IOException {
		SystemProperties.get(PROP_1, getClass());
	}

	@Test
	public void E_get_null() {
		assertNull(SystemProperties.get(NO_PROP, String.class));
	}

	@AfterClass
	public static void cleanUp() throws IOException {
		Files.delete(SYSTEM_PROPERTIES.toPath());
		Files.delete(DEFAULT_PROPERTIES.toPath());
	}

}
