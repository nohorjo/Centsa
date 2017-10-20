package nohorjo.centsa.rest;

import javax.ws.rs.core.Response;
import javax.ws.rs.ext.ExceptionMapper;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Base class for REST services. Maps all exceptions to 500 errors
 * 
 * @author muhammed.haque
 *
 */
public abstract class AbstractRS implements ExceptionMapper<Throwable> {

	private Logger log = LoggerFactory.getLogger(AbstractRS.class);

	@Override
	public Response toResponse(Throwable e) {
		log.error(e.getMessage(), e);
		return Response.serverError().entity(e.getClass().getName() + ": " + e.getMessage()).build();
	}

}
