package nohorjo.centsa.server;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import nohorjo.centsa.rest.SettingsRS;

public class APIRequestHandler {

	public static final String UNIQUE_KEY = UUID.randomUUID().toString();

	private static final Map<String, HttpServlet> SERVLETS = new HashMap<>();
	private static final Logger log = LoggerFactory.getLogger(APIRequestHandler.class);

	static {
		log.info("Key set to {}", UNIQUE_KEY);
		SERVLETS.put("settings", new SettingsRS());
	}

	public static void handle(HttpServletRequest request, HttpServletResponse response, String target)
			throws IOException, ServletException {

		String key = target.split("/")[0];
		String _target = target.replaceAll("^[^/]*/", "");
		if (key.equals(UNIQUE_KEY)) {
			HttpServlet servlet = SERVLETS.get(_target);

			if (servlet != null) {
				servlet.service(request, response);
			} else {
				response.setStatus(404);
				try (PrintWriter writer = response.getWriter()) {
					writer.write("Endpoint not found: " + _target);
				}
			}
		} else {
			response.setStatus(401);
			try (PrintWriter writer = response.getWriter()) {
				writer.write("Invalid key: " + key);
			}
		}
	}

}
