package nohorjo.centsa.rest.api;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;
import static org.mockito.Matchers.any;
import static org.mockito.Matchers.anyString;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.invocation.InvocationOnMock;
import org.mockito.stubbing.Answer;
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

	private boolean added;

	/**
	 * Mocks {@link SystemProperties} class
	 * 
	 * @throws Exception
	 */
	@Before
	public void init() throws Exception {
		PowerMockito.mockStatic(SystemProperties.class);
		PowerMockito.when(SystemProperties.class, "get", anyString(), any(Class.class)).then(new Answer<Object>() {

			@Override
			public Object answer(InvocationOnMock invocation) throws Throwable {
				String key = invocation.getArgumentAt(0, String.class);
				switch (key) {
				case "return":
					return "returned";
				case "object":
					return 123;
				}
				return null;
			}
		});
		PowerMockito.when(SystemProperties.class, "set", anyString(), anyString()).then(new Answer<Void>() {

			@Override
			public Void answer(InvocationOnMock invocation) throws Throwable {
				added = invocation.getArgumentAt(0, String.class).equals("setting")
						&& invocation.getArgumentAt(1, String.class).equals("property");
				return null;
			}
		});

	}

	/**
	 * Returns a setting that exists
	 */
	@Test
	public void getSetting_returnSetting() {
		assertEquals("returned", new SettingsRS().get("return"));
	}

	/**
	 * Returns an object as String
	 */
	@Test
	public void getSetting_returnObject() {
		assertEquals("123", new SettingsRS().get("object"));
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
		new SettingsRS().set("setting", "property");
		assertTrue(added);
	}

}