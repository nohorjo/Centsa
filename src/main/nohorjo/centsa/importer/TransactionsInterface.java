package nohorjo.centsa.importer;

import java.sql.SQLException;

import jdk.nashorn.api.scripting.ScriptObjectMirror;
import nohorjo.centsa.dbservices.TransactionsDAO;
import nohorjo.centsa.vo.Transaction;

/**
 * JavaScript interface for transactions
 *
 * @author muhammed.haque
 */
public class TransactionsInterface extends JSInterface {

    private TransactionsDAO dao = new TransactionsDAO();

    @Override
    public long insert(ScriptObjectMirror o) throws SQLException {
        Transaction t = new Transaction();
        t.setAmount(cast(o.get("amount"), Integer.class));
        t.setComment((String) o.get("comment"));
        t.setAccount_id(cast(o.get("account_id"), Long.class));
        t.setType_id(cast(o.get("type_id"), Long.class));
        t.setExpense_id(cast(o.get("expense_id"), Long.class));
        t.setDate(cast(o.get("date"), Long.class));

        return dao.insert(t);
    }

    public void setDao(TransactionsDAO dao) {
        this.dao = dao;
    }
}
