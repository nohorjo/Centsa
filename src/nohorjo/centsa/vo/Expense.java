package nohorjo.centsa.vo;

/**
 * VO to represent expenses
 * 
 * @author muhammed.haque
 *
 */
public class Expense implements VO {
	private Long id;
	private String name;
	private int cost;
	private int frequency_days;
	private long started;
	private Long ended;
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

	public int getCost() {
		return cost;
	}

	public void setCost(int cost) {
		this.cost = cost;
	}

	public int getFrequency_days() {
		return frequency_days;
	}

	public void setFrequency_days(int frequency_days) {
		this.frequency_days = frequency_days;
	}

	public long getStarted() {
		return started;
	}

	public void setStarted(long started) {
		this.started = started;
	}

	public Long getEnded() {
		return ended;
	}

	public void setEnded(Long ended) {
		this.ended = ended;
	}

	public boolean isAutomatic() {
		return automatic;
	}

	public void setAutomatic(boolean automatic) {
		this.automatic = automatic;
	}
}
