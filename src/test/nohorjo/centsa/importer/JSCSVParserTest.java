package nohorjo.centsa.importer;

import jdk.nashorn.api.scripting.ScriptObjectMirror;
import nohorjo.centsa.dbservices.AbstractDAO;
import nohorjo.util.ClasspathUtils;
import nohorjo.util.Procedure;
import nohorjo.util.JavaSystemUtils;
import org.apache.commons.lang.RandomStringUtils;
import org.apache.commons.lang.math.RandomUtils;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.powermock.core.classloader.annotations.PrepareForTest;
import org.powermock.core.classloader.annotations.SuppressStaticInitializationFor;
import org.powermock.modules.junit4.PowerMockRunner;

import javax.script.ScriptException;
import java.io.IOException;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;

@RunWith(PowerMockRunner.class)
@PrepareForTest(AbstractDAO.class)
@SuppressStaticInitializationFor("nohorjo.centsa.dbservices.AbstractDAO")
public class JSCSVParserTest {

    private static JSCSVParser parser;

    public static boolean wait;

    public static Procedure<Double> assertProcessed = (expected) -> {
        int actual;
        if (expected != (actual = parser.getProcessed())) {
            throw new RuntimeException(String.format("Expected %s, but was %s", expected, actual));
        }
    };

    public static Procedure<ScriptObjectMirror> assertParams = (test) -> {
        Object actual = test.get(0 + "");
        Object expectedClass = test.get(1 + "");
        if (!expectedClass.equals(actual.getClass().getName())) {
            throw new RuntimeException(
                    String.format("Expected %s, but was %s", expectedClass, actual.getClass().getName()));
        }
    };

    private Throwable thrown;

    @Before
    public void init() {
        parser = new JSCSVParser();
        wait = false;
        thrown = null;

        JSCSVParser.WATCH_SLEEP = 10;
    }

    @Test
    public void getTotal_returns() throws NoSuchMethodException, ScriptException, IOException {
        final int rows = RandomUtils.nextInt(100);
        String csv = getCSV(rows);
        parser.parse(csv, "");

        assertEquals(rows, parser.getTotal());
    }

    @Test(expected = IllegalAccessError.class)
    public void setInProgress_illegal() {
        parser.setInProgress(RandomUtils.nextBoolean());
    }

    @Test(timeout = 10000)
    public void isInProgress_progressStatus() throws Throwable {
        assertFalse(parser.isInProgress());
        wait = true;

        Thread t = JavaSystemUtils.startThread(() -> {
            try {
                parser.parse(getCSV(RandomUtils.nextInt(100) + 10), ClasspathUtils.getFileAsString("test.js"));
            } catch (Exception e) {
                e.printStackTrace();
                thrown = e;
            }
        });

        while (!parser.isInProgress()) continue;
        wait = false;
        t.join();

        assertFalse(parser.isInProgress());
        if (thrown != null) {
            throw thrown;
        }
    }

    private String getCSV(final int rows) {
        StringBuilder csv = new StringBuilder();
        for (int i = 0; i < rows; i++) {
            csv.append(RandomStringUtils.randomAlphabetic(10) + "\n");
        }
        return csv.toString();
    }
}
