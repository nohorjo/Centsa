package nohorjo.centsa.server;

import org.eclipse.jetty.server.Server;
import org.eclipse.jetty.servlet.ServletContextHandler;
import org.eclipse.jetty.servlet.ServletHolder;
import org.glassfish.jersey.server.ResourceConfig;
import org.glassfish.jersey.servlet.ServletContainer;

/**
 * A {@link ServletContextHandler} to simplify adding REST services based on
 * packages
 * 
 * @author muhammed
 *
 */
public class RESTContextHandler extends ServletContextHandler {

	public RESTContextHandler(Server server, String contextPath) {
		super(server, contextPath);
	}

	public static RESTContextHandler getHandler(Server server, String contextPath) {
		return new RESTContextHandler(server, contextPath);
	}

	/**
	 * Adds REST services
	 * 
	 * @param path
	 *            Path to the services
	 * @param packages
	 *            Packages defining the services
	 */
	public void addRESTServices(String path, String... packages) {
		addServlet(new ServletHolder(new ServletContainer(new ResourceConfig().packages(packages))), path);
	}
}
