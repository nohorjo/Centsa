package nohorjo.centsa.rest;

import java.io.IOException;
import java.io.InputStream;
import java.io.StringWriter;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;

@Path("/core")
public class CoreRS {

	@GET
	@Path("/{resource:.*}")
	public String getResource(@PathParam("resource") String resource) throws IOException {
		StringWriter writer = new StringWriter();
		try (InputStream in = ClassLoader.getSystemResourceAsStream("core/" + resource)) {
			int b;
			while ((b = in.read()) != -1) {
				writer.write(b);
			}
		}
		return writer.toString();
	}

}
