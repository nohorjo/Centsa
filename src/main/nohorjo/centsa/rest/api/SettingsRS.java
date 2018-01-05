package nohorjo.centsa.rest.api;

import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

import org.glassfish.jersey.internal.inject.PerLookup;

import nohorjo.centsa.properties.SystemProperties;
import nohorjo.centsa.rest.AbstractRS;

/**
 * REST service for settings
 *
 * @author muhammed.haque
 */
@PerLookup
@Path("/settings")
public class SettingsRS extends AbstractRS {

    @GET
    @Produces(MediaType.TEXT_PLAIN)
    @Path("/{key}")
    public String get(@PathParam("key") String key) {
        Object setting = SystemProperties.get(key, Object.class);
        if (setting == null) {
            setting = "";
        }
        return setting.toString();
    }

    @POST
    @Consumes(MediaType.TEXT_PLAIN)
    @Path("/{key}")
    public void set(@PathParam("key") String key, String value) {
        if ("".equals(value)) SystemProperties.clear(key);
        else SystemProperties.set(key, value);
    }

}
