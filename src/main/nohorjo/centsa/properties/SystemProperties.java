package nohorjo.centsa.properties;

import java.io.File;
import java.io.InputStream;
import java.security.InvalidParameterException;
import java.util.Iterator;

import org.apache.commons.configuration.PropertiesConfiguration;

/**
 * Class to handle properties throughout the application
 * 
 * @author muhammed.haque
 *
 */
public class SystemProperties {
	private static final PropertiesConfiguration systemProperties = new PropertiesConfiguration();
	private static final PropertiesConfiguration runtimeProperties = new PropertiesConfiguration();

	/**
	 * Loads system.properties file fromt the classpath and sets the root.dir from
	 * the system properties. Also loads a set of default properties should any be
	 * missing
	 */
	static {
		try {
			File propertiesFile = new File(ClassLoader.getSystemResource("system.properties").getPath());
			systemProperties.load(propertiesFile);
			systemProperties.setFile(propertiesFile);
			systemProperties.setAutoSave(true);

			runtimeProperties.setProperty("root.dir", new File(System.getProperty("root.dir")).getAbsolutePath());

			try (InputStream in = ClassLoader.getSystemResourceAsStream("default.properties")) {
				PropertiesConfiguration defaultProperties = new PropertiesConfiguration();
				defaultProperties.load(in);
				Iterator<String> keys = defaultProperties.getKeys();
				while (keys.hasNext()) {
					String key = keys.next();
					if (!systemProperties.containsKey(key)) {
						systemProperties.setProperty(key, defaultProperties.getProperty(key));
					}
				}
			}
		} catch (Exception e) {
			throw new RuntimeException(e);
		}
	}

	/**
	 * Gets a property
	 * 
	 * @param key
	 *            The property
	 * @param clazz
	 *            The expected class of the property
	 * @return The value
	 */
	@SuppressWarnings("unchecked")
	public static <T> T get(String key, Class<T> clazz) {
		T prop = null;

		switch (clazz.getName()) {
		case "java.lang.String":
			prop = (T) systemProperties.getString(key);
			break;
		case "java.lang.Integer":
			prop = (T) (Integer) systemProperties.getInt(key);
			break;
		case "java.lang.Double":
			prop = (T) (Double) systemProperties.getDouble(key);
			break;
		case "java.lang.Object":
			prop = (T) systemProperties.getProperty(key);
			break;
		case "java.lang.Boolean":
			prop = (T) (Boolean) systemProperties.getBoolean(key);
			break;
		default:
			throw new InvalidParameterException("Cannot get type: " + clazz.getName());
		}

		if (prop == null) {// If it's not in the system.properties get it from the runtime properties
			prop = (T) runtimeProperties.getProperty(key);
		}
		return prop;
	}

	/**
	 * Set a property
	 * 
	 * @param key
	 *            The property
	 * @param value
	 *            The value
	 */
	public static void set(String key, Object value) {
		systemProperties.setProperty(key, value);
	}

	/**
	 * Sets a property that's only persistent during runtime
	 * 
	 * @param key
	 *            The property
	 * @param value
	 *            The value
	 */
	public static void setRuntime(String key, Object value) {
		runtimeProperties.setProperty(key, value);
	}
}
