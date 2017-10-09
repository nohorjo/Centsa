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

import nohorjo.centsa.dbservices.TransactionsDAO;
import nohorjo.centsa.vo.Transaction;

@Path("/transactions")
public class TransactionsRS {

	TransactionsDAO dao = new TransactionsDAO();

	@GET
	public Transaction get(@QueryParam("id") long id) throws SQLException {
		return dao.get(id);
	}

	@GET
	@Path("/countPages")
	public int countPages(@QueryParam("pageSize") int pageSize) throws SQLException {
		return dao.countPages(pageSize);
	}

	@GET
	@Path("/all")
	public List<Transaction> getAll(@QueryParam("page") int page, @QueryParam("pageSize") int pageSize,
			@QueryParam("order") String order) throws SQLException {
		return dao.getAll(page, pageSize, order);
	}

	@DELETE
	public void delete(@QueryParam("id") long id) throws SQLException {
		dao.delete(id);
	}

	@POST
	public long insert(Transaction t, @Context HttpServletRequest req, @Context HttpServletResponse resp)
			throws IOException, SQLException {
		return dao.insert(t);
	}

}
