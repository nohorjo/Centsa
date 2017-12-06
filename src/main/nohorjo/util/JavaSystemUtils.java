package nohorjo.util;

import nohorjo.centsa.properties.SystemProperties;

import java.io.File;
import java.io.IOException;

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

    public static void runProcess(File dir, String... command) throws IOException {
        ProcessBuilder builder = new ProcessBuilder(command);
        builder.redirectErrorStream(true);
        builder.redirectOutput(dir);
        builder.start();
    }

}
