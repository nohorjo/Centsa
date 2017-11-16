package nohorjo.centsa.datahandlers;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import nohorjo.centsa.vo.Expense;

/**
 * Class to handle budget calculations
 * 
 * @author muhammed
 *
 */
public class BudgetHandler {

	/**
	 * Calculates budget based on expenses
	 * 
	 * @param strict
	 *            If true will round expenses
	 * @param expenses
	 *            List of {@link Expense}s
	 * @param sumAll
	 *            Absolute amount of funds available
	 * @return The budgets considering expenses
	 */
	public static Map<String, Integer> getBudget(boolean strict, List<Expense> expenses, int sumAll) {
		Map<String, Integer> rtn = new HashMap<>();

		int autoExpenseReduction = sumAll;
		int allExpenseReduction = sumAll;

		for (Expense e : expenses) {
			// Only ones that have started
			if (e.getId() != 1 && e.getStarted() <= System.currentTimeMillis()) {
				double expectedInstances = e.get_expected_instances_count();
				double leftToTransfer = expectedInstances - e.getInstance_count();
				if (leftToTransfer < 0) {
					leftToTransfer = 0;
				}
				if (e.getCost() < 0) {
					// If cost is negative (is income) then we floor it so as to assume the money
					// isn't in yet.
					leftToTransfer = Math.floor(leftToTransfer);
				} else if (strict) {
					// If it's positive we ceiling it so that we're 'saving' the money.
					leftToTransfer = Math.ceil(leftToTransfer);
				}
				double cost = leftToTransfer * e.getCost();
				if (e.isAutomatic()) {
					autoExpenseReduction -= cost;
				}
				allExpenseReduction -= cost;
			}
		}

		rtn.put("afterAuto", autoExpenseReduction);
		rtn.put("afterAll", allExpenseReduction);

		return rtn;
	}
}
