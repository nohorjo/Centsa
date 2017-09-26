package nohorjo.centsa.server;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import nohorjo.centsa.rest.SettingsRS;

public class APIRequestHandler {

	public static final String UNIQUE_KEY = UUID.randomUUID().toString();

	private static final Map<String, HttpRequestProcessor> PROCESSORS = new HashMap<>();

	static {
		System.out.printf("Key set to %s", UNIQUE_KEY);
		PROCESSORS.put("settings", new SettingsRS());
	}

	public static void handle(HttpServletRequest request, HttpServletResponse response, String target)
			throws IOException {
		HttpRequestProcessor processor;

		String key = target.split("/")[0];
		String _target = target.replaceAll("^[^/]*/", "");
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
