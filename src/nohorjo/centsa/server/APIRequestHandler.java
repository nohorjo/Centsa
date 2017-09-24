package nohorjo.centsa.server;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang.exception.ExceptionUtils;

public class APIRequestHandler {

	private static final Map<String, HttpRequestProcessor> PROCESSORS = new HashMap<>();
	private static final String UNIQUE_KEY = UUID.randomUUID().toString();

	static {
		PROCESSORS.put("centsa.api.js", (HttpServletRequest req, HttpServletResponse resp) -> {
			int code = 500;
			resp.setContentType("application/javascript");
			try (PrintWriter writer = resp.getWriter()) {
				try (BufferedReader reader = new BufferedReader(
						new InputStreamReader(ClassLoader.getSystemResourceAsStream("centsa.api.js")))) {
					String line;
					String contents = "";
					while ((line = reader.readLine()) != null) {
						contents += line + "\n";
					}
					writer.write(contents.replace("#UNIQUE_KEY#", UNIQUE_KEY));
				} catch (IOException e) {
					e.printStackTrace();
					writer.write(ExceptionUtils.getFullStackTrace(e));
				}
			}
			resp.setStatus(code);
		});
	}

	public static void handle(HttpServletRequest request, HttpServletResponse response, String target)
			throws IOException {
		HttpRequestProcessor processor;

		String key = target.split("/")[0];
		String _target = target.replaceAll("^/[^/]*/", "");
		if (key.equals(UNIQUE_KEY)) {
			processor = PROCESSORS.get(_target);
			
			if (processor == null) {
				processor = (HttpServletRequest req, HttpServletResponse resp) -> {
					resp.setStatus(404);
					try (PrintWriter writer = resp.getWriter()) {
						writer.write("Endpoint not found: " + _target);
					}
				};
			}
		} else {
			processor = (HttpServletRequest req, HttpServletResponse resp) -> {
				resp.setStatus(401);
				try (PrintWriter writer = resp.getWriter()) {
					writer.write("Invalid key: " + key);
				}
			};
		}

		processor.process(request, response);
	}

}
