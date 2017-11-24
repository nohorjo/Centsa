package nohorjo.centsa.rest.api;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;

import org.apache.commons.lang.RandomStringUtils;
import org.apache.commons.lang.math.RandomUtils;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.powermock.api.mockito.PowerMockito;
import org.powermock.core.classloader.annotations.PrepareForTest;
import org.powermock.core.classloader.annotations.SuppressStaticInitializationFor;
import org.powermock.modules.junit4.PowerMockRunner;

import nohorjo.centsa.properties.SystemProperties;

/**
 * Test class for {@link SettingsRS}
 * 
 * @author muhammed
 *
 */
@RunWith(PowerMockRunner.class)
@PrepareForTest(SystemProperties.class)
@SuppressStaticInitializationFor("nohorjo.centsa.properties.SystemProperties")
public class SettingsRSTest {

	public static final String RETURN_STRING = RandomStringUtils.random(10),
			NEW_SETTING_KEY = RandomStringUtils.random(10), NEW_SETTING_VALUE = RandomStringUtils.random(10);
	public static final long RETURN_LONG = RandomUtils.nextLong();

	private boolean added;

	/**
	 * Mocks {@link SystemProperties} class
	 * 
	 * @throws Exception
	 */
	@SuppressWarnings("unchecked")
	@Before
	public void init() throws Exception {
		PowerMockito.mockStatic(SystemProperties.class);
		PowerMockito.when(SystemProperties.get(anyString(), any(Class.class))).then((i) -> {
			String key = i.getArgument(0);
			switch (key) {
			case "return":
				return RETURN_STRING;
			case "object":
				return RETURN_LONG;
			}
			return null;
		});
		PowerMockito.when(SystemProperties.class, "set", anyString(), anyString()).then((i) -> {
			added = i.getArgument(0).equals(NEW_SETTING_KEY) && i.getArgument(1).equals(NEW_SETTING_VALUE);
			return null;
		});

	}

	/**
	 * Returns a setting that exists
	 */
	@Test
	public void getSetting_returnSetting() {
		assertEquals(RETURN_STRING, new SettingsRS().get("return"));
	}

	/**
	 * Returns an object as String
	 */
	@Test
	public void getSetting_returnObject() {
		assertEquals(Long.toString(RETURN_LONG), new SettingsRS().get("object"));
	}

	/**
	 * Returns an empty string for a setting that doesn't exist
	 */
	@Test
	public void getSetting_returnEmpty() {
		assertEquals("", new SettingsRS().get("invalid"));
	}

	/**
	 * Calls the appropriate method to add property
	 */
	@Test
	public void setSetting_adds() {
		new SettingsRS().set(NEW_SETTING_KEY, NEW_SETTING_VALUE);
		assertTrue(added);
	}

}
