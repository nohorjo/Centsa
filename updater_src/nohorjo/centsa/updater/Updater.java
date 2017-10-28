package nohorjo.centsa.updater;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;
import java.text.SimpleDateFormat;
import java.util.Arrays;
import java.util.Date;
import java.util.Properties;
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

	private static final SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");

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

		log("Updating with " + updateZip.getName());

		extractZip(updateZip, updaterDir);

		File extracted = new File(updaterDir, "Centsa");

		// Delete lib and layout
		deleteDir(new File(rootDir, "lib"));
		deleteDir(new File(new File(rootDir, "layout"), "default"));

		// Merge properties to add any new ones
		mergeProperties(new File(rootDir, "system.properties"), new File(extracted, "system.properties"));
		mergeProperties(new File(rootDir, "log4j.properties"), new File(extracted, "log4j.properties"));

		moveDir(extracted, rootDir.getAbsolutePath());

		// Delete updates
		deleteDir(extracted);
		for (File zip : updateZips) {
			Files.delete(zip.toPath());
		}

		if (Boolean.parseBoolean(args[1])) {
			restart(rootDir);
		}
	}

	/**
	 * Recursively moves the contents of dir to dest
	 * 
	 * @param dir
	 *            Directory of which its contents to move
	 * @param dest
	 *            Directory path to move it to
	 * @throws IOException
	 */
	private static void moveDir(File dir, String dest) throws IOException {
		File destFile = new File(dest);
		destFile.mkdirs();
		for (File toMove : dir.listFiles()) {
			if (toMove.isDirectory()) {
				String subDest = dest + File.separator + toMove.getName();
				new File(subDest).mkdirs();
				moveDir(toMove, subDest);
				Files.delete(toMove.toPath());
			} else {
				Files.move(toMove.toPath(), destFile.toPath().resolve(toMove.getName()),
						StandardCopyOption.REPLACE_EXISTING);
			}
		}
	}

	/**
	 * Recursively delete a directory
	 * 
	 * @param dir
	 *            Directory to delete
	 * @throws IOException
	 */
	private static void deleteDir(File dir) throws IOException {
		if (dir.isDirectory()) {
			for (File f : dir.listFiles()) {
				deleteDir(f);
			}
		}
		Files.deleteIfExists(dir.toPath());
	}

	/**
	 * Merges two properties files. Old properties are retained while new ones are
	 * added. The result is stored in the new properties file
	 * 
	 * @param oldPropFile
	 *            The old properties
	 * @param newPropFile
	 *            The new properties
	 * @throws IOException
	 */
	private static void mergeProperties(File oldPropFile, File newPropFile) throws IOException {
		Properties newProps = new Properties();
		try (InputStream newIs = new FileInputStream(newPropFile);
				InputStream oldIs = new FileInputStream(oldPropFile)) {
			Properties oldProps = new Properties();
			newProps.load(newIs);
			oldProps.load(oldIs);
			// Put all old properties into the new properties
			newProps.putAll(oldProps);
		}
		try (FileOutputStream out = new FileOutputStream(newPropFile)) {
			newProps.store(out, "");
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
		log("Launching Centsa from " + rootDir);
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
					log("File extract : " + newFile.getPath());
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

	/**
	 * Simple formatted logging
	 * 
	 * @param message
	 *            Message to log
	 */
	private static void log(String message) {
		System.out.printf("%s [Updater:%d] %s\n", sdf.format(new Date()),
				Thread.currentThread().getStackTrace()[2].getLineNumber(), message);
	}
}
