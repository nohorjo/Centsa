package nohorjo.util;

import java.io.ByteArrayOutputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;

/**
 * Utilities class to get files from classpath
 *
 * @author muhammed
 */
public class ClasspathUtils {

    private ClasspathUtils() {

    }

    /**
     * Gets a file from the classpath
     *
     * @param path The path to the file
     * @return The file data
     * @throws IOException
     */
    public static byte[] getFileData(String path) throws IOException {
        try (InputStream in = getFileAsStream(path); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            byte[] buffer = new byte[1024];
            int len;
            while ((len = in.read(buffer)) > 0) {
                out.write(buffer, 0, len);
            }
            return out.toByteArray();
        }
    }

    /**
     * Gets a file as an {@link InputStream} from the classpath
     *
     * @param path The path to the file
     * @return The file as a stream
     * @throws FileNotFoundException
     */
    public static InputStream getFileAsStream(String path) throws FileNotFoundException {
        InputStream in = ClassLoader.getSystemResourceAsStream(path);
        if (in == null) {
            throw new FileNotFoundException(path);
        }
        return in;
    }

    /**
     * Gets a file as a String
     *
     * @param path The path to the file
     * @return The file as a String
     * @throws IOException
     */
    public static String getFileAsString(String path) throws IOException {
        return new String(getFileData(path));
    }
}
