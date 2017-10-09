package nohorjo.centsa.rest.api;

import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.QueryParam;

import nohorjo.centsa.properties.SystemProperties;
import nohorjo.centsa.vo.SettingsVO;

@Path("/settings")
public class SettingsRS {

	@GET
	public String get(@QueryParam("key") String key) {
		return SystemProperties.get(key, Object.class).toString();
	}

	@POST
	public void set(SettingsVO vo) {
		SystemProperties.set(vo.getKey(), vo.getValue());
	}

}
