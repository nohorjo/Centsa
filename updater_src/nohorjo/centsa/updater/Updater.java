package nohorjo.centsa.updater;

import java.io.File;
import java.io.IOException;

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
		System.out.println("Updating");
		File rootDir = new File(args[0]);
		// TODO extract zip
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
}
