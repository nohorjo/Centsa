package nohorjo.centsa.rest.api;

import java.io.IOException;
import java.sql.SQLException;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.Context;

import nohorjo.centsa.dbservices.TypesDAO;
import nohorjo.centsa.vo.Type;

@Path("/types")
public class TypesRS {

	TypesDAO dao = new TypesDAO();

	@GET
	public Type get(@QueryParam("id") long id) throws SQLException {
		return dao.get(id);
	}

	@GET
	@Path("/all")
	public List<Type> getAll(@QueryParam("page") int page, @QueryParam("pageSize") int pageSize,
			@QueryParam("order") String order) throws SQLException {
		return dao.getAll(page, pageSize, order);
	}

	@DELETE
	public void delete(@QueryParam("id") long id) throws SQLException {
		dao.delete(id);
	}

	@POST
	public long insert(Type t, @Context HttpServletRequest req, @Context HttpServletResponse resp)
			throws IOException, SQLException {
		return dao.insert(t);
	}
}
