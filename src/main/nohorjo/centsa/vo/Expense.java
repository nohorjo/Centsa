package nohorjo.centsa.vo;

import java.util.Objects;

/**
 * VO to represent expenses
 *
 * @author muhammed.haque
 */
public class Expense implements VO {
    private static final double DAY = 8.64e+7;

    private Long id;
    private String name;
    private int cost;
    private String frequency;
    private long started;
    private boolean automatic;
    private long account_id;
    private long type_id;

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

    public String getFrequency() {
        return frequency;
    }

    /**
     * Validates and sets the frequency
     *
     * @param frequency The frequency in the correct format
     * @see Expense#validateFrequency
     */
    public void setFrequency(String frequency) {
        if (!validateFrequency(frequency))
            throw new IllegalArgumentException("Invalid frequency");
        this.frequency = frequency;
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

    /**
     * Calculates the fractional expected number of instances
     *
     * @return The expected number of instances
     */
    public double get_expected_instances_count() {
        double expected = ((System.currentTimeMillis() - started) / DAY) / Integer.parseInt(frequency);
        return ++expected > 0 ? expected : 0;
    }

    @Override
    public String toString() {
        return "Expense [id=" + id + ", name=" + name + ", cost=" + cost + ", frequency=" + frequency
                + ", started=" + started + ", automatic=" + automatic + "]";
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Expense expense = (Expense) o;
        return cost == expense.cost &&
                Objects.equals(frequency, expense.frequency) &&
                started == expense.started &&
                automatic == expense.automatic &&
                Objects.equals(name, expense.name);
    }

    @Override
    public int hashCode() {
        return Objects.hash(name, cost, frequency, started, automatic);
    }

    /**
     * Validates the frequency
     * Valid formats are:
     * <ul>
     * <li>[Days per occurrence]</li>
     * <li>DATE [date in month]</li>
     * <li>DATE [date in year (d/m)]</li>
     * <li>DAY [Nth day of the month (negative for last Nth day)]</li>
     * <li>DAY [day of week (first 2 chars)] [Nth occurrence in the month (negative for last Nth occurrence)]</li>
     * <li>WDAY [Nth work-day in month (negative for last Nth day)]</li>
     * <li>RDAY [Nth rest-day in month (negative for last Nth day)]</li>
     * </ul>
     *
     * @param frequency The frequency to check
     */
    private boolean validateFrequency(String frequency) {
        frequency = frequency.toUpperCase();
        if (frequency.matches("^\\d+$")) {
            return true;
        } else if (frequency.matches("^DATE \\d+$")) {
            int d = Integer.parseInt(frequency.substring(5));
            return d >= 1 && d <= 31;
        } else if (frequency.matches("^DATE \\d+/\\d+$")) {
            String[] dm = frequency.substring(5).split("/");
            int d = Integer.parseInt(dm[0]);
            int m = Integer.parseInt(dm[1]);

            if (m >= 1 && m <= 12 && d >= 1) {
                switch (m) {
                    case 1:
                    case 3:
                    case 5:
                    case 7:
                    case 8:
                    case 10:
                    case 12:
                        return d <= 31;
                    case 4:
                    case 6:
                    case 9:
                    case 11:
                        return d <= 30;
                    case 2:
                        return d <= 29;
                }
            }
        } else if (frequency.matches("^DAY -?\\d+$")) {
            int d = Integer.parseInt(frequency.substring(4));
            return d < 31 && d >= -31;
        } else if (frequency.matches("^DAY (MO|TU|WE|TH|FR|SA|SU) -?\\d+$")) {
            int d = Integer.parseInt(frequency.substring(7));
            return d < 5 && d >= -5;
        } else if (frequency.matches("^WDAY -?\\d+$")) {
            int d = Integer.parseInt(frequency.substring(5));
            return d < 23 && d >= -23;
        } else if (frequency.matches("^RDAY -?\\d+$")) {
            int d = Integer.parseInt(frequency.substring(5));
            return d < 10 && d >= -10;
        }
        return false;
    }
}
