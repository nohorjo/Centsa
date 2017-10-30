package nohorjo.centsa.updater.utils;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;

/**
 * Utilities class for handling directories
 * 
 * @author muhammed.haque
 *
 */
public class DirectoryUtils {

	/**
	 * Recursively moves the contents of dir to dest
	 * 
	 * @param dir
	 *            Directory of which its contents to move
	 * @param dest
	 *            Directory path to move it to
	 * @throws IOException
	 */
	public static void moveDir(File dir, String dest) throws IOException {
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
	public static void deleteDir(File dir) throws IOException {
		if (dir.isDirectory()) {
			for (File f : dir.listFiles()) {
				deleteDir(f);
			}
		}
		Files.deleteIfExists(dir.toPath());
	}
}
