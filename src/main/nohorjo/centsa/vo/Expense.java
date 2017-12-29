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

    public void setFrequency(String frequency) {
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
}
