package nohorjo.centsa.server;

import java.net.InetSocketAddress;
import java.util.UUID;

import org.eclipse.jetty.server.Server;
import org.eclipse.jetty.server.ServerConnector;
import org.eclipse.jetty.servlet.ServletContextHandler;
import org.eclipse.jetty.servlet.ServletHolder;
import org.glassfish.jersey.server.ResourceConfig;
import org.glassfish.jersey.servlet.ServletContainer;

import nohorjo.centsa.rest.AccountsRS;
import nohorjo.centsa.rest.ExpensesRS;
import nohorjo.centsa.rest.SettingsRS;
import nohorjo.centsa.rest.TransactionsRS;
import nohorjo.centsa.rest.TypesRS;

public class EmbeddedServer {

	public static final String UNIQUE_KEY = UUID.randomUUID().toString();
	private static Server server;

	public static int startServer(String ip, int port) throws Exception {
		InetSocketAddress addr = new InetSocketAddress(ip, port);
		String apiPath = "/api/" + UNIQUE_KEY;

		ResourceConfig config = new ResourceConfig();
		config.packages("nohorjo.centsa.rest");

		server = new Server(addr);

		ServletContextHandler context = new ServletContextHandler(server, "/*");

		context.addServlet(new ServletHolder(new ServletContainer(config)), "/*");
		context.addServlet(SettingsRS.class, apiPath + "/settings/*");
		context.addServlet(TransactionsRS.class, apiPath + "/transactions/*");
		context.addServlet(AccountsRS.class, apiPath + "/accounts/*");
		context.addServlet(TypesRS.class, apiPath + "/types/*");
		context.addServlet(ExpensesRS.class, apiPath + "/expenses/*");

		server.start();
		return ((ServerConnector) server.getConnectors()[0]).getLocalPort();
	}

	public static void stopServer() throws Exception {
		if (server != null) {
			server.stop();
		}
	}
}