package nohorjo.centsa.rest;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.stream.Collectors;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.fasterxml.jackson.databind.ObjectMapper;

import nohorjo.centsa.properties.SystemProperties;
import nohorjo.centsa.vo.SettingsVO;

public class SettingsRS extends HttpServlet {

	/**
	 * 
	 */
	private static final long serialVersionUID = -4610961678167873846L;

	@Override
	public void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
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

	@Override
	public void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
		SettingsVO vo = new ObjectMapper().readValue(
				req.getReader().lines().collect(Collectors.joining(System.lineSeparator())), SettingsVO.class);
		SystemProperties.set(vo.getKey(), vo.getValue());
		resp.setStatus(204);
	}

}
