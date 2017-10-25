package nohorjo.centsa.server;

import java.util.UUID;

import org.eclipse.jetty.server.Server;
import org.eclipse.jetty.server.ServerConnector;
import org.eclipse.jetty.servlet.ServletContextHandler;
import org.eclipse.jetty.servlet.ServletHolder;
import org.glassfish.jersey.server.ResourceConfig;
import org.glassfish.jersey.servlet.ServletContainer;

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
	 * @return The actual IP the server is bound to
	 * @throws Exception
	 */
	public static int startServer() throws Exception {
		server = new Server(0);

		// Set up jersey REST
		ResourceConfig coreREST = new ResourceConfig().packages("nohorjo.centsa.rest.core");
		ResourceConfig apiREST = new ResourceConfig().packages("nohorjo.centsa.rest.api");

		ServletContextHandler context = new ServletContextHandler(server, "/");

		context.addServlet(new ServletHolder(new ServletContainer(coreREST)), "/*");
		context.addServlet(new ServletHolder(new ServletContainer(apiREST)), "/api/" + UNIQUE_KEY + "/*");

		server.start();
		return ((ServerConnector) server.getConnectors()[0]).getLocalPort();
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