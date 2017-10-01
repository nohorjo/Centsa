package nohorjo.centsa.vo;

import java.sql.Timestamp;

public class Expense implements VO {
	private Long id;
	private String name;
	private double cost;
	private int frequencyDays;
	private Timestamp started;
	private Timestamp ended;
	private boolean automatic;

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public double getCost() {
		return cost;
	}

	public void setCost(double cost) {
		this.cost = cost;
	}

	public int getFrequencyDays() {
		return frequencyDays;
	}

	public void setFrequencyDays(int frequencyDays) {
		this.frequencyDays = frequencyDays;
	}

	public Timestamp getStarted() {
		return started;
	}

	public void setStarted(Timestamp started) {
		this.started = started;
	}

	public Timestamp getEnded() {
		return ended;
	}

	public void setEnded(Timestamp ended) {
		this.ended = ended;
	}

	public boolean isAutomatic() {
		return automatic;
	}

	public void setAutomatic(boolean automatic) {
		this.automatic = automatic;
	}
}
