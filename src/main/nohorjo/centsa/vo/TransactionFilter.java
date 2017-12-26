package nohorjo.centsa.vo;

import java.util.regex.Pattern;

/**
 * This class is used to filter transaction lists
 *
 * @author muhammed
 */
public class TransactionFilter {
    private long fromDate = Long.MIN_VALUE;
    private long toDate = Long.MAX_VALUE;
    private int fromAmount = Integer.MIN_VALUE;
    private int toAmount = Integer.MAX_VALUE;
    private long account_id;
    private long type_id;
    private long expense_id;
    private String comment = "";
    private boolean regex;

    /**
     * Generates the WHERE clause based on the properties
     *
     * @return The WHERE clause
     */
    public String getFilterClause() {
        String clause = String.format(
                "WHERE DATE >= %d AND DATE <= %d AND AMOUNT >= %d AND AMOUNT <= %d AND COMMENT REGEXP '%s'",
                fromDate, toDate, fromAmount, toAmount, regex ? comment : ".*" + Pattern.quote(comment) + ".*");
        if (account_id != 0) {
            clause += " AND ACCOUNT_ID=" + account_id;
        }
        if (type_id != 0) {
            clause += " AND TYPE_ID=" + type_id;
        }
        if (expense_id != 0) {
            clause += " AND EXPENSE_ID=" + expense_id;
        }
        return clause;
    }

    public void setFromDate(long fromDate) {
        this.fromDate = fromDate;
    }

    public void setToDate(long toDate) {
        this.toDate = toDate;
    }

    public void setFromAmount(int fromAmount) {
        this.fromAmount = fromAmount;
    }

    public void setToAmount(int toAmount) {
        this.toAmount = toAmount;
    }

    public void setAccount_id(long account_id) {
        this.account_id = account_id;
    }

    public void setType_id(long type_id) {
        this.type_id = type_id;
    }

    public void setExpense_id(long expense_id) {
        this.expense_id = expense_id;
    }

    public void setComment(String comment) {
        this.comment = comment.replace("'", "''");
    }

    public void setRegex(boolean regex) {
        this.regex = regex;
    }

    public long getFromDate() {
        return fromDate;
    }

    public long getToDate() {
        return toDate;
    }

    public int getFromAmount() {
        return fromAmount;
    }

    public int getToAmount() {
        return toAmount;
    }

    public long getAccount_id() {
        return account_id;
    }

    public long getType_id() {
        return type_id;
    }

    public long getExpense_id() {
        return expense_id;
    }

    public String getComment() {
        return comment;
    }

    public boolean isRegex() {
        return regex;
    }
}
