package nohorjo.centsa.updater.utils;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

/**
 * Utilities class for handling properties files
 * 
 * @author muhammed.haque
 *
 */
public class PropertiesUtils {

	/**
	 * Merges two properties files. Old properties are retained while new ones are
	 * added. The result is stored in the new properties file
	 * 
	 * @param oldPropFile
	 *            The old properties
	 * @param newPropFile
	 *            The new properties
	 * @throws IOException
	 */
	public static void mergeProperties(File oldPropFile, File newPropFile) throws IOException {
		Properties newProps = new Properties();
		try (InputStream newIs = new FileInputStream(newPropFile);
				InputStream oldIs = new FileInputStream(oldPropFile)) {
			Properties oldProps = new Properties();
			newProps.load(newIs);
			oldProps.load(oldIs);
			// Put all old properties into the new properties
			newProps.putAll(oldProps);
		}
		try (FileOutputStream out = new FileOutputStream(newPropFile)) {
			newProps.store(out, "");
		}
	}
}
