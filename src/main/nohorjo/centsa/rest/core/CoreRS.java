package nohorjo.centsa.rest.core;

import java.io.ByteArrayOutputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;

import org.glassfish.hk2.api.PerLookup;

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
		try (InputStream in = ClassLoader.getSystemResourceAsStream("core/" + resource);
				ByteArrayOutputStream out = new ByteArrayOutputStream()) {
			byte[] buffer = new byte[1024];
			int len;
			while ((len = in.read(buffer)) > 0) {
				out.write(buffer, 0, len);
			}

			return out.toString();
		} catch (NullPointerException e) {
			throw new FileNotFoundException(resource);
		}
	}

}
