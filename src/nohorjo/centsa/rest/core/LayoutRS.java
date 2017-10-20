package nohorjo.centsa.rest.core;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.io.StringWriter;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;

import org.glassfish.jersey.internal.inject.PerLookup;

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
		StringWriter writer = new StringWriter();
		try (InputStream in = ClassLoader
				.getSystemResourceAsStream("layout/" + SystemProperties.get("layout", String.class) + "/" + resource)) {
			int b;
			while ((b = in.read()) != -1) {
				writer.write((byte) b);
			}
		} catch (NullPointerException e) {
			throw new FileNotFoundException(resource);
		}
		return writer.toString();
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
				.getSystemResourceAsStream("layout/" + SystemProperties.get("layout", String.class) + "/" + resource)) {
			byte imageData[] = new byte[in.available()];
			in.read(imageData);
			return imageData;
		} catch (NullPointerException e) {
			throw new FileNotFoundException(resource);
		}
	}

}
