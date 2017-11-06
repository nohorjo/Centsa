package nohorjo.centsa.rest.core;

import java.io.ByteArrayOutputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;

import org.glassfish.hk2.api.PerLookup;

import nohorjo.centsa.properties.SystemProperties;
import nohorjo.centsa.rest.AbstractRS;

/**
 * REST service for UI layout resources
 * 
 * @author muhammed.haque
 *
 */
@PerLookup
@Path("/layout")
public class LayoutRS extends AbstractRS {

	/**
	 * Gets a resource from the selected layout directory
	 * 
	 * @param resource
	 *            The resource to get
	 * @return The resource
	 * @throws IOException
	 */
	@GET
	@Path("/{resource:.*}")
	public String getResource(@PathParam("resource") String resource) throws IOException {
		try (InputStream in = ClassLoader
				.getSystemResourceAsStream("layout/" + SystemProperties.get("layout", String.class) + "/" + resource);
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

	/**
	 * Gets PNG images
	 * 
	 * @param resource
	 *            The path to the image
	 * @return The image data
	 * @throws IOException
	 */
	@GET
	@Path("/{resource:.*\\.png}")
	@Produces("image/png")
	public byte[] getImage(@PathParam("resource") String resource) throws IOException {
		try (InputStream in = ClassLoader
				.getSystemResourceAsStream("layout/" + SystemProperties.get("layout", String.class) + "/" + resource);
				ByteArrayOutputStream out = new ByteArrayOutputStream()) {
			byte[] buffer = new byte[1024];
			int len;
			while ((len = in.read(buffer)) > 0) {
				out.write(buffer, 0, len);
			}

			return out.toByteArray();
		} catch (NullPointerException e) {
			throw new FileNotFoundException(resource);
		}
	}

}
