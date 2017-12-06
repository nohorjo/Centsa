package nohorjo.centsa.updater;

import nohorjo.centsa.properties.SystemProperties;
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
import java.nio.file.*;
import java.nio.file.attribute.BasicFileAttributes;
import java.util.concurrent.atomic.AtomicBoolean;

import static org.junit.Assert.*;
import static org.mockito.Mockito.any;

/**
 * Test class for {@link UpdateChecker}
 *
 * @author muhammed
 */
@RunWith(PowerMockRunner.class)
@PrepareForTest({SystemProperties.class, Runtime.class, JavaSystemUtils.class, ClasspathUtils.class})
@SuppressStaticInitializationFor("nohorjo.centsa.properties.SystemProperties")
public class UpdateCheckerTest {

    private static final String TEST_ROOT = RandomStringUtils.randomAlphabetic(10);

    private static final File UPDATE_DIR = new File(TEST_ROOT + File.separator + "updater");
    private static final File UPDATER_1 = new File(UPDATE_DIR, String.format("Centsa.%d.jar", RandomUtils.nextInt(10))),
            UPDATER_2 = new File(UPDATE_DIR, String.format("Centsa.%d.jar", RandomUtils.nextInt(10) + 10));

    private boolean hookAdded;


    @Before
    public void init() throws Exception {
        PowerMockito.mockStatic(SystemProperties.class, Runtime.class, JavaSystemUtils.class, ClasspathUtils.class);

        PowerMockito.when(SystemProperties.get("root.dir", String.class)).thenReturn(TEST_ROOT);

        PowerMockito.when(JavaSystemUtils.class, "addShutdownHook", any(Thread.class)).then((i) -> {
            assertEquals(UpdateChecker.class, i.getArgument(0).getClass());
            hookAdded = true;
            return null;
        });

        PowerMockito.when(ClasspathUtils.getFileAsStream(any(String.class))).thenReturn(new ByteArrayInputStream("".getBytes()));
        PowerMockito.when(SystemProperties.get("auto.update", Boolean.class)).thenReturn(false);
        PowerMockito.when(JavaSystemUtils.startThread(any(Runnable.class))).thenThrow(new IllegalStateException("Checking for updates"));

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
    public void initialise_checksUpdates() throws IOException {
        AtomicBoolean checking = new AtomicBoolean(false);
        PowerMockito.when(SystemProperties.get("auto.update", Boolean.class)).thenReturn(true);
        PowerMockito.when(JavaSystemUtils.startThread(any(Runnable.class))).then((i) -> {
            checking.set(true);
            return null;
        });

        UpdateChecker.initialise();

        assertTrue(checking.get());
    }
}
