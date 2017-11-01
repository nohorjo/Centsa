package nohorjo.centsa.vo;

/**
 * VO to represent expenses
 * 
 * @author muhammed.haque
 *
 */
public class Expense implements VO {
	private static final double DAY = 8.64e+7;

	private Long id;
	private String name;
	private int cost;
	private int frequency_days;
	private long started;
	private boolean automatic;

	private int instance_count;

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

	public boolean isAutomatic() {
		return automatic;
	}

	public void setAutomatic(boolean automatic) {
		this.automatic = automatic;
	}

	public int getInstance_count() {
		return instance_count;
	}

	public void setInstance_count(int instance_count) {
		this.instance_count = instance_count;
	}

	/**
	 * Calculates the fractional expected number of instances
	 * 
	 * @return The expected number of instances
	 */
	public double get_expected_instances_count() {
		double expected = ((System.currentTimeMillis() - started) / DAY) / frequency_days;
		return ++expected > 0 ? expected : 0;
	}

	/**
	 * Calculates the number of days until the next transaction is due
	 * 
	 * @return Days until the next transaction
	 */
	public long get_eta_days() {
		long currentTime = System.currentTimeMillis();
		if (started > currentTime) {
			return Math.round((started - currentTime) / DAY);
		} else {
			double daysSinceLast = (currentTime - (started + ((instance_count - 1) * frequency_days * DAY))) / DAY;
			return Math.round(frequency_days - daysSinceLast);
		}
	}

	@Override
	public String toString() {
		return "Expense [id=" + id + ", name=" + name + ", cost=" + cost + ", frequency_days=" + frequency_days
				+ ", started=" + started + ", automatic=" + automatic + "]";
	}

}
