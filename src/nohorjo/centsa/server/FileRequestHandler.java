package nohorjo.centsa.server;

import java.io.IOException;
import java.io.InputStream;
import java.io.PrintWriter;

import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang.exception.ExceptionUtils;
import org.apache.tika.Tika;

public class FileRequestHandler {
	private static final Tika tika = new Tika();

	public static void handle(HttpServletResponse response, String target) throws IOException {
		int code = 500;
		response.setContentType(tika.detect(target));

		try (PrintWriter writer = response.getWriter()) {
			try (InputStream in = ClassLoader.getSystemResourceAsStream(target)) {
				int b;
				while ((b = in.read()) != -1) {
					writer.write(b);
				}
				code = 200;
			} catch (NullPointerException e) {
				code = 404;
				writer.write(ExceptionUtils.getFullStackTrace(e));
			} catch (IOException e) {
				writer.write(ExceptionUtils.getFullStackTrace(e));
			}
		}
		response.setStatus(code);
	}
}
