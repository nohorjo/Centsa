package nohorjo.centsa.importer;

import java.sql.SQLException;

import jdk.nashorn.api.scripting.ScriptObjectMirror;
import nohorjo.centsa.dbservices.ExpensesDAO;
import nohorjo.centsa.vo.Expense;

/**
 * JavaScript interface for expenses
 * 
 * @author muhammed.haque
 *
 */
public class ExpensesInterface extends JSInterface {

	private ExpensesDAO dao = new ExpensesDAO();

	@Override
	public long insert(ScriptObjectMirror o) throws SQLException {
		Expense e = new Expense();
		e.setName((String) o.get("name"));

		Long id = dao.getIdByName(e.getName());

		if (id == null) {
			e.setCost(cast(o.get("cost"), Integer.class));
			e.setFrequency(cast(o.get("frequency"), String.class));
			e.setStarted(cast(o.get("started"), Long.class));
			e.setAutomatic((boolean) o.get("automatic"));

			id = dao.insert(e);
		}

		return id;
	}

	public void setDao(ExpensesDAO dao) {
		this.dao = dao;
	}

}
