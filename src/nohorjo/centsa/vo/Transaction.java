package nohorjo.centsa.vo;

import java.sql.Timestamp;

public class Transaction implements VO {
	private Long id;
	private int amount;
	private String comment;
	private long account_id;
	private long type_id;
	private Timestamp date;
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

	public Timestamp getDate() {
		return date;
	}

	public void setDate(Timestamp date) {
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

}
