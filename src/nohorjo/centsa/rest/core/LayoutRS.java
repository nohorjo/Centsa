package nohorjo.centsa.rest.core;
import java.io.IOException;
import java.io.InputStream;
import java.io.StringWriter;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;

import nohorjo.centsa.properties.SystemProperties;

@Path("/")
public class LayoutRS {

	@GET
	@Path("/{resource:.*}")
	public String getResource(@PathParam("resource") String resource) throws IOException {
		StringWriter writer = new StringWriter();
		try (InputStream in = ClassLoader
				.getSystemResourceAsStream("layout/" + SystemProperties.get("layout", String.class) + "/" + resource)) {
			int b;
			while ((b = in.read()) != -1) {
				writer.write(b);
			}
		}
		return writer.toString();
	}

}
