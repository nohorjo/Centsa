package nohorjo.centsa.rest;

import javax.ws.rs.core.Response;
import javax.ws.rs.ext.ExceptionMapper;

public class AbstractRS implements ExceptionMapper<Throwable> {

	@Override
	public Response toResponse(Throwable e) {
		return Response.serverError().entity(e.getClass().getName() + ": " + e.getMessage()).build();
	}

}
