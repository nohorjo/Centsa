package nohorjo.centsa.updater.utils;

import java.text.SimpleDateFormat;
import java.util.Date;

/**
 * Basic stdout logger
 * 
 * @author muhammed.haque
 *
 */
public class SimpleLogger {
	private static final SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");

	/**
	 * Simple formatted logging
	 * 
	 * @param message
	 *            Message to log
	 */
	public static void log(String message) {
		System.out.printf("%s [Updater:%d] %s\n", sdf.format(new Date()),
				Thread.currentThread().getStackTrace()[2].getLineNumber(), message);
	}
}
