package nohorjo.centsa.vo;

public class TransactionsSummary {
    private int sum;
    private int count;
    private int min;
    private int max;

    public void setSum(int sum) {
        this.sum = sum;
    }

    public void setCount(int count) {
        this.count = count;
    }

    public void setMin(int min) {
        this.min = min;
    }

    public void setMax(int max) {
        this.max = max;
    }

    public int getSum() {
        return sum;
    }

    public int getCount() {
        return count;
    }

    public int getMin() {
        return min;
    }

    public int getMax() {
        return max;
    }
}
