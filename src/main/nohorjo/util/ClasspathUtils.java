package nohorjo.util;

import java.io.ByteArrayOutputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;

/**
 * Utilities class to get files from classpath
 * 
 * @author muhammed
 *
 */
public abstract class ClasspathUtils {

	/**
	 * Gets a file from the classpath
	 * 
	 * @param path
	 *            The path to the file
	 * @return The file data
	 * @throws IOException
	 */
	public static byte[] getFileData(String path) throws IOException {
		try (InputStream in = ClassLoader.getSystemResourceAsStream(path);
				ByteArrayOutputStream out = new ByteArrayOutputStream()) {
			byte[] buffer = new byte[1024];
			int len;
			while ((len = in.read(buffer)) > 0) {
				out.write(buffer, 0, len);
			}

			return out.toByteArray();
		}catch (NullPointerException e) {
			throw new FileNotFoundException(path);
		}
	}
}
