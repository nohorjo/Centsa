package nohorjo.centsa.server;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;
import static org.mockito.ArgumentMatchers.any;

import org.eclipse.jetty.server.Server;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.powermock.api.mockito.PowerMockito;
import org.powermock.core.classloader.annotations.PrepareForTest;
import org.powermock.core.classloader.annotations.SuppressStaticInitializationFor;
import org.powermock.modules.junit4.PowerMockRunner;

import nohorjo.centsa.properties.SystemProperties;

/**
 * Test class for {@link EmbeddedServer}
 * 
 * @author muhammed
 *
 */
@RunWith(PowerMockRunner.class)
@PrepareForTest({ RESTContextHandler.class, SystemProperties.class })
@SuppressStaticInitializationFor("nohorjo.centsa.properties.SystemProperties")
public class EmbeddedServerTest {

	private String serverRoot;

	@Before
	public void init() throws Exception {
		PowerMockito.mockStatic(RESTContextHandler.class, SystemProperties.class);

		PowerMockito.when(SystemProperties.class, "setRuntime", any(String.class), any(String.class)).then((i) -> {
			if (i.getArgument(0).equals("server.root")) {
				serverRoot = i.getArgument(1);
			}
			return null;
		});

		PowerMockito.when(RESTContextHandler.getHandler(any(Server.class), any(String.class))).then((i) -> {
			assertEquals("/", i.getArgument(1));
			return new RESTContextHandler(null, null) {
				@Override
				public void addRESTServices(String path, String... packages) {
					switch (path) {
					case "/*":
						assertEquals("nohorjo.centsa.rest.core", packages[0]);
						break;
					default:
						if (path.equals("/api/" + EmbeddedServer.UNIQUE_KEY + "/*")) {
							assertEquals("nohorjo.centsa.rest.api", packages[0]);
						} else {
							throw new IllegalStateException("Invalid path: " + path);
						}
						break;
					}

				}
			};
		});

		serverRoot = null;
	}

	@Test
	public void testStarting() throws Exception {
		EmbeddedServer.startServer();
		assertTrue(serverRoot, serverRoot.matches("http://127\\.0\\.0\\.1:\\d*/"));
	}

	@After
	public void stop() throws Exception {
		EmbeddedServer.stopServer();
	}

}
