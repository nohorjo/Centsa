package nohorjo.centsa.rest.api;

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

import nohorjo.centsa.dbservices.ExpensesDAO;
import nohorjo.centsa.vo.Expense;

@Path("/expenses")
public class ExpensesRS {

	ExpensesDAO dao = new ExpensesDAO();

	@GET
	public Expense get(@QueryParam("id") long id) throws SQLException {
		return dao.get(id);
	}

	@GET
	@Path("/all")
	public List<Expense> getAll(@QueryParam("page") int page, @QueryParam("pageSize") int pageSize,
			@QueryParam("order") String order) throws SQLException {
		return dao.getAll(page, pageSize, order);
	}

	@DELETE
	public void delete(@QueryParam("id") long id) throws SQLException {
		dao.delete(id);
	}

	@POST
	public long insert(Expense e, @Context HttpServletRequest req, @Context HttpServletResponse resp)
			throws SQLException {
		return dao.insert(e);
	}
}
