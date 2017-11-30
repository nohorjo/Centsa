package nohorjo.centsa.rest.core;

import java.io.IOException;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;

import org.glassfish.jersey.internal.inject.PerLookup;

import nohorjo.centsa.rest.AbstractRS;
import nohorjo.util.ClasspathUtils;

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
		return ClasspathUtils.getFileAsString("core/" + resource);
	}

}
