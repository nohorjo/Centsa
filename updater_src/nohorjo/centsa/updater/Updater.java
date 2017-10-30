package nohorjo.centsa.updater;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.util.Arrays;

import nohorjo.centsa.updater.utils.DirectoryUtils;
import nohorjo.centsa.updater.utils.PropertiesUtils;
import nohorjo.centsa.updater.utils.SimpleLogger;
import nohorjo.centsa.updater.utils.ZipUtils;

/**
 * Main class of updater
 * 
 * @author muhammed
 *
 */
public class Updater {

	/**
	 * Updates application
	 * 
	 * @param args
	 *            <ol>
	 *            <li>Root directory of application
	 *            <li>If "true" will restart application
	 *            </ol>
	 * @throws IOException
	 */
	public static void main(String[] args) throws IOException {
		File rootDir = new File(args[0]);
		File updaterDir = new File(rootDir, "updater");
		File updateZips[] = updaterDir.listFiles((f) -> {
			return f.getName().matches("^Centsa.*\\.zip$");
		});

		// Sort by version to get the latest
		Arrays.sort(updateZips, (a, b) -> {
			int[] majMinA = ZipUtils.getUpdateVersionFromZipName(a.getName());
			int[] majMinB = ZipUtils.getUpdateVersionFromZipName(b.getName());
			if (majMinA[0] < majMinB[0] || (majMinA[0] == majMinB[0] && majMinA[1] < majMinB[1])) {
				return 1;
			}
			return -1;
		});

		File updateZip = updateZips[0];

		SimpleLogger.log("Updating with " + updateZip.getName());

		ZipUtils.extractZip(updateZip, updaterDir);

		File extracted = new File(updaterDir, "Centsa");

		// Merge properties to add any new ones
		PropertiesUtils.mergeProperties(new File(rootDir, "system.properties"),
				new File(extracted, "system.properties"));
		PropertiesUtils.mergeProperties(new File(rootDir, "log4j.properties"), new File(extracted, "log4j.properties"));

		// Delete lib and layout
		DirectoryUtils.deleteDir(new File(rootDir, "lib"));
		DirectoryUtils.deleteDir(new File(new File(rootDir, "layout"), "default"));

		DirectoryUtils.moveDir(extracted, rootDir.getAbsolutePath());

		// Delete updates
		DirectoryUtils.deleteDir(extracted);
		for (File zip : updateZips) {
			Files.delete(zip.toPath());
		}

		if (Boolean.parseBoolean(args[1])) {
			restart(rootDir);
		}
	}

	/**
	 * Launches install-run script
	 * 
	 * @param rootDir
	 *            Directory of the script
	 * @throws IOException
	 */
	private static void restart(File rootDir) throws IOException {
		SimpleLogger.log("Launching Centsa from " + rootDir);
		ProcessBuilder builder;
		// Launch the appropriate install-run script
		if (System.getProperty("os.name").startsWith("Win")) {
			builder = new ProcessBuilder("cmd", "/c", "install-run.bat");
		} else {
			builder = new ProcessBuilder("bash", "install-run.sh");
		}
		builder.directory(rootDir);
		builder.start();
	}

}
