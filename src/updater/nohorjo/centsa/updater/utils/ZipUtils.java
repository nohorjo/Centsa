package nohorjo.centsa.updater.utils;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

/**
 * Utilities class for handling zip files
 * 
 * @author muhammed.haque
 *
 */
public class ZipUtils {

	/**
	 * Extracts zip file
	 * 
	 * @param zipFile
	 *            File to extract
	 * @param outputFolder
	 *            Folder to extract to
	 * @throws IOException
	 */
	public static void extractZip(File zipFile, File outputFolder) throws IOException {
		try (ZipInputStream zis = new ZipInputStream(new FileInputStream(zipFile))) {
			ZipEntry ze;
			while ((ze = zis.getNextEntry()) != null) {
				File newFile = new File(outputFolder, ze.getName());
				if (!ze.isDirectory()) {
					SimpleLogger.log("File extract : " + newFile.getPath());
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
	public static int[] getUpdateVersionFromZipName(String zipName) {
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
