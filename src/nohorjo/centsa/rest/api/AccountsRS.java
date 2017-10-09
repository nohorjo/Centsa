package nohorjo.centsa.rest.api;

import java.sql.SQLException;
import java.util.List;

import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.QueryParam;

import nohorjo.centsa.dbservices.AccountsDAO;
import nohorjo.centsa.vo.Account;

@Path("/accounts")
public class AccountsRS {

	AccountsDAO dao = new AccountsDAO();

	@GET
	public Account get(@QueryParam("id") long id) throws SQLException {
		return dao.get(id);
	}

	@GET
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
	public long insert(Account a) throws SQLException {
		return dao.insert(a);
	}
}
