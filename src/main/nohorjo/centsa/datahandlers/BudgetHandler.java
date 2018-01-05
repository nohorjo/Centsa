package nohorjo.centsa.datahandlers;

import java.util.List;
import java.util.concurrent.TimeUnit;

import nohorjo.centsa.vo.Expense;

/**
 * Class to handle budget calculations
 *
 * @author muhammed
 */
public class BudgetHandler {

    private static final long DAYS = TimeUnit.DAYS.toMillis(1);

    /**
     * Calculates budget based on expenses
     *
     * @param strict   If true will round expenses
     * @param expenses List of {@link Expense}s
     * @param sumAll   Absolute amount of funds available
     * @return The budgets considering expenses
     */
    public static Budget getBudget(boolean strict, List<Expense> expenses, int sumAll) {
        Budget budget = new Budget();

        int autoExpenseReduction = sumAll;
        int allExpenseReduction = sumAll;

        long currentTime = System.currentTimeMillis();

        for (Expense e : expenses) {
            if (e.getCost() > 0 && e.getStarted() < currentTime) {
                int cost;

                if (strict) {
                    cost = e.getCost();
                } else {
                    double daysUntilNextPayment = (e.nextPaymentDateFrom(currentTime) - currentTime) / DAYS;
                    double daysSinceLastPayment = (currentTime - e.lastPaymentFrom(currentTime)) / DAYS;

                    double progress = daysSinceLastPayment / (daysSinceLastPayment + daysUntilNextPayment);

                    cost = (int) (e.getCost() * progress);
                }
                if (e.isAutomatic()) {
                    autoExpenseReduction -= cost;
                }
                allExpenseReduction -= cost;
            }
        }

        budget.setAfterAuto(autoExpenseReduction);
        budget.setAfterAll(allExpenseReduction);

        return budget;
    }
}
