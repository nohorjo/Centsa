package nohorjo.centsa.rest.api;

import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.MediaType;

import nohorjo.centsa.properties.SystemProperties;

@Path("/settings")
public class SettingsRS {

	@GET
	@Produces(MediaType.TEXT_PLAIN)
	public String get(@QueryParam("key") String key) {
		return SystemProperties.get(key, Object.class).toString();
	}

	@POST
	@Consumes(MediaType.TEXT_PLAIN)
	@Path("/{key}")
	public void set(@PathParam("key") String key, String value) {
		SystemProperties.set(key, value);
	}

}
