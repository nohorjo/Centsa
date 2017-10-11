package nohorjo.centsa.rest.api;

import java.sql.SQLException;
import java.util.List;

import javax.ws.rs.GET;
import javax.ws.rs.Path;

import nohorjo.centsa.dbservices.ExpensesDAO;
import nohorjo.centsa.dbservices.TransactionsDAO;
import nohorjo.centsa.vo.Expense;

@Path("/general")
public class GeneralRS {

	private TransactionsDAO tDao = new TransactionsDAO();
	private ExpensesDAO eDao = new ExpensesDAO();

	@GET
	@Path("/budget")
	public int getBudget() throws SQLException {
		int sumNonAuto = tDao.sumNonAutoExpenseAmount();
		List<Expense> autoExpenses = eDao.getAllAuto();
		int totalAuto = 0;

		for (Expense e : autoExpenses) {
			int durationDays = (int) (((e.getEnded() == null ? System.currentTimeMillis() : e.getEnded())
					- e.getStarted()) / 8.64e+7 + 0.5);
			int instances = durationDays / e.getFrequency_days();
			totalAuto += instances * e.getCost();
		}

		return -totalAuto - sumNonAuto;
	}
}
