package nohorjo.util;

import java.io.File;
import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.URL;

/**
 * Class that calls system classes. Can be mocked for testing
 *
 * @author muhammed
 */
public class JavaSystemUtils {

    private JavaSystemUtils() {
    }

    public static Thread startThread(Runnable r) {
        Thread t = new Thread(r);
        t.start();
        return t;
    }

    public static void addShutdownHook(Thread t) {
        Runtime.getRuntime().addShutdownHook(t);
    }

    public static void runProcess(File logFile, String... command) throws IOException {
        ProcessBuilder builder = new ProcessBuilder(command);
        builder.redirectErrorStream(true);
        builder.redirectOutput(logFile);
        builder.start();
    }

    public static HttpURLConnection getHttpConnection(String url) throws IOException {
        return (HttpURLConnection) new URL(url).openConnection();
    }

}
