package nohorjo.centsa.rest.api;

import nohorjo.centsa.dbservices.TransactionsDAO;
import nohorjo.centsa.rest.AbstractRS;
import nohorjo.centsa.vo.Transaction;
import nohorjo.centsa.vo.TransactionFilter;
import nohorjo.centsa.vo.TransactionsSummary;
import org.glassfish.jersey.internal.inject.PerLookup;

import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import java.sql.SQLException;
import java.util.List;
import java.util.Map;

/**
 * REST service for transactions
 *
 * @author muhammed.haque
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

    @POST
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    @Path("/summary")
    public TransactionsSummary getSummary(TransactionFilter filter) throws SQLException {
        TransactionsSummary summ = new TransactionsSummary();
        summ.setCount(dao.count(filter));
        summ.setSum(dao.sumAll(filter));
        summ.setMin(dao.getMin(filter));
        summ.setMax(dao.getMax(filter));
        return summ;
    }


    public void setDao(TransactionsDAO dao) {
        this.dao = dao;
    }

}
