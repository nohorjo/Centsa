package nohorjo.centsa.properties;

import java.io.File;

import org.apache.commons.configuration.ConfigurationException;
import org.apache.commons.configuration.PropertiesConfiguration;

public class SystemProperties {
	private static final PropertiesConfiguration systemProperties = new PropertiesConfiguration();
	private static final PropertiesConfiguration runtimeProperties = new PropertiesConfiguration();

	static {
		try {
			File propertiesFile = new File(ClassLoader.getSystemResource("system.properties").getPath());
			
			systemProperties.load(propertiesFile);
			systemProperties.setFile(propertiesFile);
			systemProperties.setAutoSave(true);
			
			runtimeProperties.setProperty("root.dir", propertiesFile.getParentFile().getAbsolutePath());
		} catch (ConfigurationException e) {
			throw new Error(e);
		}
	}

	@SuppressWarnings("unchecked")
	public static <T> T get(String key) {
		T prop = null;

		prop = (T) systemProperties.getProperty(key);

		if (prop == null) {
			prop = (T) runtimeProperties.getProperty(key);
		}
		return prop;
	}

	public static void set(String key, Object value) {
		systemProperties.setProperty(key, value);
	}

	public static void setRuntime(String key, Object value) {
		runtimeProperties.setProperty(key, value);
	}
}
