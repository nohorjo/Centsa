package nohorjo.centsa.importer;

import java.sql.SQLException;

import jdk.nashorn.api.scripting.ScriptObjectMirror;
import nohorjo.centsa.dbservices.ExpensesDAO;
import nohorjo.centsa.vo.Expense;

public class ExpensesInterface extends JSInterface {

	private ExpensesDAO dao = new ExpensesDAO();

	@Override
	public long insert(ScriptObjectMirror o) throws SQLException {
		Expense e = new Expense();
		e.setName((String) o.get("name"));

		Long id = dao.getIdByName(e.getName());

		if (id == null) {
			e.setCost(cast(o.get("cost"), Integer.class));
			e.setFrequency_days(cast(o.get("frequency_days"), Integer.class));
			e.setStarted(cast(o.get("started"), Long.class));
			e.setEnded(cast(o.get("ended"), Long.class));
			e.setAutomatic((boolean) o.get("automatic"));

			id = dao.insert(e);
		}

		return id;
	}

}
