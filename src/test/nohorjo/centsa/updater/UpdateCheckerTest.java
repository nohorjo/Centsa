package nohorjo.centsa.updater;

import nohorjo.centsa.properties.SystemProperties;
import nohorjo.centsa.render.Renderer;
import nohorjo.util.ClasspathUtils;
import nohorjo.util.JavaSystemUtils;
import org.apache.commons.io.FileUtils;
import org.apache.commons.lang.RandomStringUtils;
import org.apache.commons.lang.math.RandomUtils;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.powermock.api.mockito.PowerMockito;
import org.powermock.core.classloader.annotations.PrepareForTest;
import org.powermock.core.classloader.annotations.SuppressStaticInitializationFor;
import org.powermock.modules.junit4.PowerMockRunner;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.IOException;
import java.net.HttpURLConnection;
import java.util.concurrent.atomic.AtomicBoolean;

import static org.junit.Assert.*;
import static org.mockito.Mockito.any;
import static org.mockito.Mockito.mock;
import static org.powermock.api.mockito.PowerMockito.when;

/**
 * Test class for {@link UpdateChecker}
 *
 * @author muhammed
 */
@RunWith(PowerMockRunner.class)
@PrepareForTest({SystemProperties.class, Runtime.class, JavaSystemUtils.class, ClasspathUtils.class, Renderer.class})
@SuppressStaticInitializationFor({"nohorjo.centsa.properties.SystemProperties", "nohorjo.centsa.render.Renderer"})
public class UpdateCheckerTest {

    private static final int MAJOR_OLD = RandomUtils.nextInt(10),
            MINOR_OLD = RandomUtils.nextInt(10),
            MAJOR_NEW = RandomUtils.nextInt(10) + 10,
            MINOR_NEW = RandomUtils.nextInt(10) + 10;

    private static final String TEST_ROOT = RandomStringUtils.randomAlphabetic(10),
            LATEST_URL = RandomStringUtils.randomAlphabetic(10),
            TAG = String.format("v%d.%d", MAJOR_NEW, MINOR_NEW),
            CHANGELOG = RandomStringUtils.randomAlphabetic(10),
            DL_URL = RandomStringUtils.randomAlphabetic(10),
            GITHUB_RESP = String.format("{" +
                    "'tag_name' : '%s'," +
                    "'body' : '%s'," +
                    "'assets' : [{" +
                    "   'browser_download_url' : '%s'" +
                    "}]" +
                    "}", TAG, CHANGELOG, DL_URL).replace('\'', '"');

    private static final File UPDATE_DIR = new File(TEST_ROOT + File.separator + "updater"),
            UPDATER_1 = new File(UPDATE_DIR, String.format("Centsa.%d.jar", RandomUtils.nextInt(10))),
            UPDATER_2 = new File(UPDATE_DIR, String.format("Centsa.%d.jar", RandomUtils.nextInt(10) + 10)),
            NEW_UPDATE = new File(UPDATE_DIR, "Centsa.zip");

    private boolean hookAdded;


    @Before
    public void init() throws Exception {
        PowerMockito.mockStatic(SystemProperties.class, Runtime.class, JavaSystemUtils.class, ClasspathUtils.class, Renderer.class);

        when(SystemProperties.get("root.dir", String.class)).thenReturn(TEST_ROOT);

        when(JavaSystemUtils.class, "addShutdownHook", any(Thread.class)).then((i) -> {
            assertEquals(UpdateChecker.class, i.getArgument(0).getClass());
            hookAdded = true;
            return null;
        });

        StringBuilder props = new StringBuilder();
        props.append("\nlatest.url=" + LATEST_URL);
        props.append("\nmajor.version=" + MAJOR_OLD);
        props.append("\nminor.version=" + MINOR_OLD);

        when(ClasspathUtils.getFileAsStream(any(String.class))).thenReturn(new ByteArrayInputStream(props.toString().getBytes()));
        when(SystemProperties.get("auto.update", Boolean.class)).thenReturn(false);
        when(JavaSystemUtils.startThread(any(Runnable.class))).thenThrow(new IllegalStateException("Checking for updates"));

        new File(TEST_ROOT).mkdirs();

        hookAdded = false;
    }

    @After
    public void cleanup() throws IOException {
        FileUtils.deleteDirectory(new File(TEST_ROOT));
    }

    @Test
    public void initialise_addsHook() {
        UpdateChecker.initialise();
        assertTrue(hookAdded);
    }

    @Test
    public void initialise_createsDir() {
        assertFalse(UPDATE_DIR.exists());
        UpdateChecker.initialise();

        assertTrue(UPDATE_DIR.exists());

    }

    @Test
    public void initialise_deletesOld() throws IOException {
        assertTrue(UPDATE_DIR.mkdirs());

        assertTrue(UPDATER_1.createNewFile());
        assertTrue(UPDATER_2.createNewFile());


        UpdateChecker.initialise();

        assertFalse(UPDATER_1.exists());
        assertTrue(UPDATER_2.exists());

        assertTrue(hookAdded);
    }

    @Test
    public void initialise_checksUpdates() throws Exception {
        AtomicBoolean checking = new AtomicBoolean(false);

        HttpURLConnection conn = mock(HttpURLConnection.class);

        when(conn, "setRequestMethod", any(String.class)).then((i) -> {
            assertEquals("GET", i.getArgument(0));
            return null;
        });
        when(conn.getInputStream()).thenReturn(new ByteArrayInputStream(GITHUB_RESP.getBytes()));


        when(JavaSystemUtils.getHttpConnection(any(String.class))).then((i) -> {
            assertEquals(LATEST_URL, i.getArgument(0));
            return conn;
        });
        when(SystemProperties.get("auto.update", Boolean.class)).thenReturn(true);
        when(JavaSystemUtils.startThread(any(Runnable.class))).then((i) -> {
            ((Runnable) i.getArgument(0)).run();
            checking.set(true);
            return null;
        });

        UpdateChecker.initialise();

        assertTrue(checking.get());
    }

    @Test
    public void run_doesNotRunOnNoUpdate() throws Exception {
        PowerMockito.when(JavaSystemUtils.class, "runProcess", any(File.class), any(String[].class)).then((i) -> {
            fail("Should not be running");
            return null;
        });

        UpdateChecker.initialise();
        new UpdateChecker().run();
    }

    @Test
    public void run_runsWhenFound() throws Exception {
        AtomicBoolean ran = new AtomicBoolean(false);
        PowerMockito.when(JavaSystemUtils.class, "runProcess", any(File.class), any()).then((i) -> {
            assertEquals("update.log", ((File) i.getArgument(0)).getName());
            assertEquals((System.getProperty("java.home") + "/bin/java").replace('/', File.separatorChar), i.getArgument(1));
            assertEquals("-cp", i.getArgument(2));
            assertEquals(UPDATE_DIR + File.separator + "*", i.getArgument(3));
            assertEquals("nohorjo.centsa.updater.Updater", i.getArgument(4));
            assertEquals(TEST_ROOT, i.getArgument(5));
            assertEquals("false", i.getArgument(6));

            ran.set(true);
            return null;
        });

        UpdateChecker.initialise();

        assertTrue(NEW_UPDATE.createNewFile());

        new UpdateChecker().run();

        assertTrue(ran.get());
    }

    @Test
    public void getCurrentVersion() {
    	UpdateChecker.initialise();
        assertEquals("v" + MAJOR_OLD + "." + MINOR_OLD, UpdateChecker.getCurrentVersion());
    }
}
