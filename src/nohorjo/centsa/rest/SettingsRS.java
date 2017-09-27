package nohorjo.centsa.rest;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.stream.Collectors;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.fasterxml.jackson.databind.ObjectMapper;

import nohorjo.centsa.properties.SystemProperties;
import nohorjo.centsa.server.HttpRequestProcessor;
import nohorjo.centsa.vo.SettingsVO;

public class SettingsRS implements HttpRequestProcessor {

	@Override
	public void process(HttpServletRequest req, HttpServletResponse resp) throws IOException {
		switch (req.getMethod()) {
		case "POST":
			saveSetting(req, resp);
			break;
		case "GET":
			getSetting(req, resp);
			break;
		default:
			resp.sendError(405, "Method not allowed");
		}
	}

	private void getSetting(HttpServletRequest req, HttpServletResponse resp) throws IOException {
		int status = 404;
		String value = SystemProperties.get(req.getParameter("key"), Object.class).toString();
		if (value != null) {
			try (PrintWriter w = resp.getWriter()) {
				w.write(value);
			}
			status = 200;
		}
		resp.setStatus(status);
	}

	private void saveSetting(HttpServletRequest req, HttpServletResponse resp) throws IOException {
		SettingsVO vo = new ObjectMapper().readValue(
				req.getReader().lines().collect(Collectors.joining(System.lineSeparator())), SettingsVO.class);
		SystemProperties.set(vo.getKey(), vo.getValue());
		resp.setStatus(204);
	}

}
