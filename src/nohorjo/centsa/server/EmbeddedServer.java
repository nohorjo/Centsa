package nohorjo.centsa.server;

import java.io.IOException;
import java.io.InputStream;
import java.net.InetSocketAddress;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang.exception.ExceptionUtils;
import org.apache.tika.Tika;
import org.eclipse.jetty.server.Request;
import org.eclipse.jetty.server.Server;
import org.eclipse.jetty.server.ServerConnector;
import org.eclipse.jetty.server.handler.AbstractHandler;

import nohorjo.centsa.properties.SystemProperties;

public class EmbeddedServer extends AbstractHandler {

	private static final Tika tika = new Tika();
	private static Server server;

	@Override
	public void handle(String target, Request baseRequest, HttpServletRequest request, HttpServletResponse response)
			throws IOException, ServletException {
		int code = 500;
		target = "layout/" + (target.endsWith("/uiroot") ? "ui.html" : SystemProperties.get("layout") + target);

		response.setContentType(tika.detect(target));

		try (InputStream in = ClassLoader.getSystemResourceAsStream(target)) {
			int b;
			while ((b = in.read()) != -1) {
				response.getWriter().write(b);
			}
			code = 200;
		} catch (NullPointerException e) {
			code = 404;
			response.getWriter().write(ExceptionUtils.getFullStackTrace(e));
		}
		response.setStatus(code);

		baseRequest.setHandled(true);
	}

	public static int startServer(String ip, int port) throws Exception {
		InetSocketAddress addr = new InetSocketAddress(ip, port);
		server = new Server(addr);
		server.setHandler(new EmbeddedServer());
		server.start();
		return ((ServerConnector) server.getConnectors()[0]).getLocalPort();
	}

	public static void stopServer() throws Exception {
		if (server != null) {
			server.stop();
		}
	}
}