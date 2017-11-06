package nohorjo.centsa.rest.api;

import java.sql.SQLException;
import java.util.List;
import java.util.Map;

import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.MediaType;

import org.glassfish.hk2.api.PerLookup;

import nohorjo.centsa.dbservices.TransactionsDAO;
import nohorjo.centsa.rest.AbstractRS;
import nohorjo.centsa.vo.Transaction;
import nohorjo.centsa.vo.TransactionFilter;

/**
 * REST service for transactions
 * 
 * @author muhammed.haque
 *
 */
@PerLookup
@Path("/transactions")
public class TransactionsRS extends AbstractRS {

	private TransactionsDAO dao = new TransactionsDAO();

	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public Transaction get(@QueryParam("id") long id) throws SQLException {
		return dao.get(id);
	}

	@POST
	@Path("/countPages")
	public int countPages(TransactionFilter filter, @QueryParam("pageSize") int pageSize) throws SQLException {
		return dao.countPages(pageSize, filter);
	}

	@POST
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	@Path("/all")
	public List<Transaction> getAll(TransactionFilter filter, @QueryParam("page") int page,
			@QueryParam("pageSize") int pageSize, @QueryParam("order") String order) throws SQLException {
		return dao.getAll(page, pageSize, order, filter);
	}

	@DELETE
	public void delete(@QueryParam("id") long id) throws SQLException {
		dao.delete(id);
	}

	@POST
	@Consumes(MediaType.APPLICATION_JSON)
	public long insert(Transaction t) throws SQLException {
		return dao.insert(t);
	}

	@GET
	@Produces(MediaType.APPLICATION_JSON)
	@Path("/comments")
	public List<String> getUniqueComments() throws SQLException {
		return dao.getUniqueComments();
	}

	@GET
	@Produces(MediaType.APPLICATION_JSON)
	@Path("/sums")
	public List<Map<String, Long>> getCumulativeSums(@QueryParam("precision") int precision) throws SQLException {
		return dao.getCumulativeSums(precision);
	}

}
