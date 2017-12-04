package nohorjo.centsa.vo;

import java.util.Objects;

/**
 * VO to represent transactions
 *
 * @author muhammed.haque
 */
public class Transaction implements VO {
    private Long id;
    private int amount;
    private String comment;
    private long account_id;
    private long type_id;
    private long date;
    private long expense_id;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public int getAmount() {
        return amount;
    }

    public void setAmount(int amount) {
        this.amount = amount;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public long getDate() {
        return date;
    }

    public void setDate(long date) {
        this.date = date;
    }

    public long getAccount_id() {
        return account_id;
    }

    public void setAccount_id(long account_id) {
        this.account_id = account_id;
    }

    public long getType_id() {
        return type_id;
    }

    public void setType_id(long type_id) {
        this.type_id = type_id;
    }

    public long getExpense_id() {
        return expense_id;
    }

    public void setExpense_id(long expense_id) {
        this.expense_id = expense_id;
    }

    @Override
    public String toString() {
        return "Transaction [id=" + id + ", amount=" + amount + ", comment=" + comment + ", account_id=" + account_id
                + ", type_id=" + type_id + ", date=" + date + ", expense_id=" + expense_id + "]";
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Transaction that = (Transaction) o;
        return amount == that.amount &&
                account_id == that.account_id &&
                type_id == that.type_id &&
                date == that.date &&
                expense_id == that.expense_id &&
                Objects.equals(comment, that.comment);
    }

    @Override
    public int hashCode() {
        return Objects.hash(amount, comment, account_id, type_id, date, expense_id);
    }
}
