package nohorjo.centsa.server;

import java.io.IOException;
import java.net.InetSocketAddress;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.eclipse.jetty.server.Request;
import org.eclipse.jetty.server.Server;
import org.eclipse.jetty.server.ServerConnector;
import org.eclipse.jetty.server.handler.AbstractHandler;

import nohorjo.centsa.properties.SystemProperties;

public class EmbeddedServer extends AbstractHandler {

	private static Server server;

	@Override
	public void handle(String target, Request baseRequest, HttpServletRequest request, HttpServletResponse response)
			throws IOException, ServletException {

		try {
			switch (target.split("/")[1]) {
			case "api":
				APIRequestHandler.handle(request, response, target.replaceAll("^/api/", ""));
				break;
			case "core":
				FileRequestHandler.handle(response, target.substring(1));
				break;
			default:
				target = "layout/" + SystemProperties.get("layout", String.class) + target;
				FileRequestHandler.handle(response, target);
				break;
			}
		} catch (Exception e) {
			e.printStackTrace();
			response.sendError(500, e.getMessage());
		}

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