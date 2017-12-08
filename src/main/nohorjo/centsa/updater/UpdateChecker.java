package nohorjo.centsa.updater;

import com.fasterxml.jackson.databind.ObjectMapper;
import javafx.application.Platform;
import nohorjo.centsa.properties.SystemProperties;
import nohorjo.centsa.render.Renderer;
import nohorjo.util.ClasspathUtils;
import nohorjo.util.JavaSystemUtils;
import org.apache.commons.configuration.ConfigurationException;
import org.apache.commons.configuration.PropertiesConfiguration;
import org.apache.commons.io.FileUtils;

import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.file.Files;
import java.util.*;
import java.util.regex.Pattern;

/**
 * Class to handle checking for and initating updates
 *
 * @author muhammed
 */
public class UpdateChecker extends Thread {

    private static final PropertiesConfiguration updateProperties = new PropertiesConfiguration();
    private static final String UPDATER_DIR_NAME = SystemProperties.get("root.dir", String.class) + File.separator
            + "updater";
    private static final File UPDATER_DIR = new File(UPDATER_DIR_NAME);

    private static boolean shouldRestart;

    /**
     * <ul>
     * <li>Adds the shutdown hook to apply updates</li>
     * <li>Deletes old updaters</li>
     * <li>Loads properties</li>
     * <li>Checks updates</li>
     * </ul>
     */
    public static void initialise() {
        // Adds shutdown hook to launch updater
        JavaSystemUtils.addShutdownHook(new UpdateChecker());

        try (InputStream in = ClasspathUtils.getFileAsStream("update.properties")) {
            if (!UPDATER_DIR.exists() && !UPDATER_DIR.mkdirs()) {
                throw new IOException("Failed to create updater directory");
            }

            // Delete all but the latest updater jar
            File[] updaterJars = UPDATER_DIR.listFiles((f) -> f.getName().matches("^Centsa.*\\.jar$"));
            if (updaterJars != null) {
                Arrays.sort(updaterJars, (a, b) ->
                        Integer.parseInt(b.getName().replaceAll("[^\\d]", ""))
                                - Integer.parseInt(a.getName().replaceAll("[^\\d]", ""))
                );
                for (int i = 1; i < updaterJars.length; i++) {
                    FileUtils.forceDelete(updaterJars[i]);
                }
            }

            updateProperties.load(in);

            if (SystemProperties.get("auto.update", Boolean.class)) {
                // Check for updates in new thread
                JavaSystemUtils.startThread(() -> {
                    try {
                        UpdateInfo info = checkNewVersion();
                        if (info != null) {
                            requestUpdate(info);
                        }
                    } catch (IOException e) {
                        throw new RuntimeException(e);
                    }
                });
            }

        } catch (IOException | ConfigurationException e) {
            throw new RuntimeException(e);
        }
    }

    /**
     * Starts a process for updater
     */
    @Override
    public void run() {
        if (UPDATER_DIR.listFiles((f) -> f.getName().matches("^Centsa.*\\.zip$")).length > 0) {
            try {
                // Zip file exists - run updater
                JavaSystemUtils.runProcess(new File(UPDATER_DIR, "update.log"),
                        (System.getProperty("java.home") + "/bin/java").replace('/', File.separatorChar),
                        "-cp",
                        UPDATER_DIR_NAME + File.separator + "*",
                        "nohorjo.centsa.updater.Updater",
                        SystemProperties.get("root.dir", String.class),
                        Boolean.toString(shouldRestart));
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }

    /**
     * Checks Github for a new release
     *
     * @return Info on the latest version or <code>null</code> if this is the latest
     * @throws IOException
     */
    @SuppressWarnings("unchecked")
    public static UpdateInfo checkNewVersion() throws IOException {
        UpdateInfo info;
        // Connect to Github's REST API
        HttpURLConnection conn = JavaSystemUtils.getHttpConnection(updateProperties.getString("latest.url"));
        conn.setRequestMethod("GET");
        try (InputStream in = conn.getInputStream()) {
            info = new UpdateInfo();
            Map<String, ?> resp = new ObjectMapper().readValue(in, HashMap.class);

            String versionInfo[] = resp.get("tag_name").toString().substring(1).split(Pattern.quote("."));

            info.setMajorVersion(Integer.parseInt(versionInfo[0]));
            info.setMinorVersion(Integer.parseInt(versionInfo[1]));

            if (info.getMajorVersion() == updateProperties.getInt("major.version")
                    && info.getMinorVersion() == updateProperties.getInt("minor.version")) {
                return null; // This is the latest
            }

            String changelog = resp.get("body").toString();

            info.setChangelog(changelog);
            info.setAsset((((List<Map<String, ?>>) resp.get("assets")).get(0)).get("browser_download_url").toString());
        }
        return info;
    }

    /**
     * Gets the current version
     *
     * @return v[major].[minor]
     */
    public static String getCurrentVersion() {
        return "v" + updateProperties.getInt("major.version") + "." + updateProperties.getInt("minor.version");
    }

    /**
     * Downloads new zip and deletes old ones
     *
     * @param info        The update to download
     * @param applyUpdate If true application will shutdown to apply update
     */
    public static void downloadUpdate(UpdateInfo info, boolean applyUpdate) {
        // Run in new thread
        JavaSystemUtils.startThread(() -> {
            try {
                File zip = new File(UPDATER_DIR_NAME + File.separator + info.getAssetName());
                if (zip.createNewFile()) {
                    HttpURLConnection conn = (HttpURLConnection) new URL(info.getAsset()).openConnection();
                    conn.setRequestMethod("GET");
                    try (InputStream in = conn.getInputStream(); OutputStream out = new FileOutputStream(zip)) {
                        byte[] buffer = new byte[1024];
                        int len;
                        while ((len = in.read(buffer)) > 0) {
                            out.write(buffer, 0, len);
                        }
                    }
                    for (File old : zip.getParentFile().listFiles((f) -> f.getName().endsWith(".zip") && !f.getName().equals(zip.getName()))) {
                        Files.delete(old.toPath());
                    }
                }
                if (applyUpdate) {
                    shouldRestart = true;
                    Platform.exit();
                    System.exit(0);
                }
            } catch (Exception e) {
                e.printStackTrace();
                Renderer.showExceptionDialog(e, "Download error", "Failed to download update");
            }
        }).start();
    }

    /**
     * Request user to update or download
     *
     * @param info Update info
     */
    public static void requestUpdate(UpdateInfo info) {
        Map<String, Runnable> buttons = new LinkedHashMap<>();
        buttons.put("Yes", () -> {
            Renderer.showAlert(
                    "Update is being downloaded in the background. Once complete this program will shut down");
            UpdateChecker.downloadUpdate(info, true);
        });
        buttons.put("Download", () -> {
            Renderer.showAlert("Update is being downloaded in the background");
            UpdateChecker.downloadUpdate(info, false);
        });
        Renderer.showConfirm("Update available", "New version found!", "Do you wish to update?", buttons,
                info.getChangelog());
    }

}
