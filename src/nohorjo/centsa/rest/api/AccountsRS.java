package nohorjo.centsa.rest.api;

import java.sql.SQLException;
import java.util.List;

import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.MediaType;

import org.glassfish.jersey.internal.inject.PerLookup;

import nohorjo.centsa.dbservices.AccountsDAO;
import nohorjo.centsa.rest.AbstractRS;
import nohorjo.centsa.vo.Account;

@PerLookup
@Path("/accounts")
public class AccountsRS extends AbstractRS {

	AccountsDAO dao = new AccountsDAO();

	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public Account get(@QueryParam("id") long id) throws SQLException {
		return dao.get(id);
	}

	@GET
	@Produces(MediaType.APPLICATION_JSON)
	@Path("/all")
	public List<Account> getAll(@QueryParam("page") int page, @QueryParam("pageSize") int pageSize,
			@QueryParam("order") String order) throws SQLException {
		return dao.getAll(page, pageSize, order);
	}

	@DELETE
	public void delete(@QueryParam("id") long id) throws SQLException {
		dao.delete(id);
	}

	@POST
	@Consumes(MediaType.APPLICATION_JSON)
	public long insert(Account a) throws SQLException {
		return dao.insert(a);
	}
}
