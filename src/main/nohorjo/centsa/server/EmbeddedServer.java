package nohorjo.centsa.server;

import java.util.UUID;

import org.eclipse.jetty.server.Server;
import org.eclipse.jetty.server.ServerConnector;

import nohorjo.centsa.properties.SystemProperties;

/**
 * Class to handle embedded jetty server
 * 
 * @author muhammed.haque
 *
 */
public class EmbeddedServer {

	public static final String UNIQUE_KEY = UUID.randomUUID().toString();
	private static Server server;

	/**
	 * Starts the server
	 * 
	 * @throws Exception
	 */
	public static void startServer() throws Exception {
		server = new Server(0);

		// Set up jersey REST
		RESTContextHandler context = RESTContextHandler.getHandler(server, "/");

		context.addRESTServices("/*", "nohorjo.centsa.rest.core");
		context.addRESTServices("/api/" + UNIQUE_KEY + "/*", "nohorjo.centsa.rest.api");

		server.start();
		SystemProperties.setRuntime("server.root",
				String.format("http://127.0.0.1:%d/", ((ServerConnector) server.getConnectors()[0]).getLocalPort()));
	}

	/**
	 * Stop the server if it's running
	 * 
	 * @throws Exception
	 */
	public static void stopServer() throws Exception {
		if (server != null) {
			server.stop();
		}
	}
}