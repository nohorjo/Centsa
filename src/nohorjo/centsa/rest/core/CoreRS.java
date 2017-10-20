package nohorjo.centsa.rest.core;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.io.StringWriter;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;

import org.glassfish.jersey.internal.inject.PerLookup;

import nohorjo.centsa.rest.AbstractRS;

/**
 * REST service for core UI resources
 * 
 * @author muhammed.haque
 *
 */
@PerLookup
@Path("/core")
public class CoreRS extends AbstractRS {

	/**
	 * Gets a resource from the core directory in the classpath
	 * 
	 * @param resource
	 *            The resource to get
	 * @return The resource
	 * @throws IOException
	 */
	@GET
	@Path("/{resource:.*}")
	public String getResource(@PathParam("resource") String resource) throws IOException {
		StringWriter writer = new StringWriter();
		try (InputStream in = ClassLoader.getSystemResourceAsStream("core/" + resource)) {
			int b;
			while ((b = in.read()) != -1) {
				writer.write(b);
			}
		} catch (NullPointerException e) {
			throw new FileNotFoundException(resource);
		}
		return writer.toString();
	}

}
