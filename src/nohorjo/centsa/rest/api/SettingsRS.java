package nohorjo.centsa.rest.api;

import java.io.IOException;
import java.io.PrintWriter;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.core.Context;

import com.fasterxml.jackson.databind.ObjectMapper;

import nohorjo.centsa.properties.SystemProperties;
import nohorjo.centsa.vo.SettingsVO;

@Path("/settings")
public class SettingsRS {

	@GET
	public void doGet(@Context HttpServletRequest req, @Context HttpServletResponse resp) throws IOException {
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

	@POST
	public void doPost(@Context HttpServletRequest req, @Context HttpServletResponse resp) throws IOException {
		SettingsVO vo = new ObjectMapper().readValue(req.getReader(), SettingsVO.class);
		SystemProperties.set(vo.getKey(), vo.getValue());
		resp.setStatus(204);
	}

}
