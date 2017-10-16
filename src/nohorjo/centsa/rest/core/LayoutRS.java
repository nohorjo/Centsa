package nohorjo.centsa.rest.core;

import java.io.IOException;
import java.io.InputStream;
import java.io.StringWriter;
import java.util.LinkedList;
import java.util.List;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;

import org.glassfish.jersey.internal.inject.PerLookup;

import nohorjo.centsa.properties.SystemProperties;
import nohorjo.centsa.rest.AbstractRS;

@PerLookup
@Path("/layout")
public class LayoutRS extends AbstractRS {

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
		}
		return writer.toString();
	}

	@GET
	@Path("/{resource:.*\\.png}")
	@Produces("image/png")
	public byte[] getImage(@PathParam("resource") String resource) throws IOException {
		List<Byte> bs = new LinkedList<>();
		try (InputStream in = ClassLoader
				.getSystemResourceAsStream("layout/" + SystemProperties.get("layout", String.class) + "/" + resource)) {
			int b;
			while ((b = in.read()) != -1) {
				bs.add((byte) b);
			}
		}
		byte[] rtn = new byte[bs.size()];
		for (int i = 0; i < rtn.length; i++) {
			rtn[i] = bs.get(i);
		}
		return rtn;
	}

}
