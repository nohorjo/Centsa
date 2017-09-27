package nohorjo.centsa;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.PrintStream;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;
import java.text.SimpleDateFormat;
import java.util.Date;

public class FilePrintStreamRedirector extends PrintStream {

	private PrintStream origin;

	private FilePrintStreamRedirector(FileOutputStream file, PrintStream origin) throws FileNotFoundException {
		super(file);
		this.origin = origin;
	}

	public static FilePrintStreamRedirector getRedirector(String filename, PrintStream origin, boolean append)
			throws IOException {
		File f = new File(filename);
		if (f.exists()) {
			if (!append) {
				File copy = new File(f.getAbsolutePath()
						+ new SimpleDateFormat("-dd.MM.yyyy-hh.mm.ss").format(new Date(f.lastModified())));
				Files.copy(f.toPath(), copy.toPath(), StandardCopyOption.REPLACE_EXISTING);
			}
		} else {
			f.getParentFile().mkdirs();
		}
		try {
			return new FilePrintStreamRedirector(new FileOutputStream(f, append), origin);
		} catch (FileNotFoundException e) {
			throw new Error(e);
		}
	}

	@Override
	public void println(String s) {
		super.println(s);
		origin.println(s);
	}

}
