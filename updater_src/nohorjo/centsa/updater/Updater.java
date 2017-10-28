package nohorjo.centsa.updater;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.util.Arrays;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

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
			int[] majMinA = getUpdateVersionFromZipName(a.getName());
			int[] majMinB = getUpdateVersionFromZipName(b.getName());
			if (majMinA[0] < majMinB[0] || (majMinA[0] == majMinB[0] && majMinA[1] < majMinB[1])) {
				return 1;
			}
			return -1;
		});

		File updateZip = updateZips[0];

		System.out.println("Updating with " + updateZip.getName());

		extractZip(updateZip, updaterDir);

		// TODO move files and delete old
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
		System.out.println("Launching Centsa from " + rootDir);
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

	/**
	 * Extracts zip file
	 * 
	 * @param zipFile
	 *            File to extract
	 * @param outputFolder
	 *            Folder to extract to
	 * @throws IOException
	 */
	private static void extractZip(File zipFile, File outputFolder) throws IOException {
		try (ZipInputStream zis = new ZipInputStream(new FileInputStream(zipFile))) {
			ZipEntry ze;
			while ((ze = zis.getNextEntry()) != null) {
				File newFile = new File(outputFolder, ze.getName());
				if (!ze.isDirectory()) {
					System.out.println("File extract : " + newFile.getPath());
					new File(newFile.getParent()).mkdirs();
					try (OutputStream out = new FileOutputStream(newFile)) {
						byte[] buffer = new byte[1024];
						int len;
						while ((len = zis.read(buffer)) > 0) {
							out.write(buffer, 0, len);
						}
					}
				}
			}

			zis.closeEntry();
		}
	}

	/**
	 * Gets the major-minor versions from the zip filename
	 * 
	 * @param zipName
	 *            The name of the zip file
	 * @return Integer array - [major,minor]
	 */
	private static int[] getUpdateVersionFromZipName(String zipName) {
		int rtn[] = new int[2];
		Matcher m = Pattern.compile("v\\d*\\.\\d*").matcher(zipName);
		if (m.find()) {
			String ver[] = m.group().replace("v", "").split(Pattern.quote("."));
			rtn[0] = Integer.parseInt(ver[0]);
			rtn[1] = Integer.parseInt(ver[1]);
		}
		return rtn;
	}
}
