package nohorjo.centsa.rest.core;

import java.io.IOException;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;

import org.glassfish.jersey.internal.inject.PerLookup;

import nohorjo.centsa.properties.SystemProperties;
import nohorjo.centsa.rest.AbstractRS;
import nohorjo.util.ClasspathUtils;

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
	public byte[] getResource(@PathParam("resource") String resource) throws IOException {
		return ClasspathUtils.getFileData("layout/" + SystemProperties.get("layout", String.class) + "/" + resource);
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
    public byte[] getPNGImage(@PathParam("resource") String resource) throws IOException {
        return getResource(resource);
    }

    /**
     * Gets JPEG images
     *
     * @param resource
     *            The path to the image
     * @return The image data
     * @throws IOException
     */
    @GET
    @Path("/{resource:.*\\.jpeg}")
    @Produces("image/jpeg")
    public byte[] getJpegImage(@PathParam("resource") String resource) throws IOException {
        return getResource(resource);
    }

    /**
     * Gets SVG images
     *
     * @param resource
     *            The path to the image
     * @return The image data
     * @throws IOException
     */
    @GET
    @Path("/{resource:.*\\.svg}")
    @Produces("image/svg+xml")
    public byte[] getSvg(@PathParam("resource") String resource) throws IOException {
        return getResource(resource);
    }

}
