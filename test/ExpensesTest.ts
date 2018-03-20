describe("Expenses", () => {
    describe("getAll", () => {
        it("returns expenses");
        it("returns 500 with error");
    });
    describe("getTotals", () => {
        it("returns total");
        it("returns 500 with error");
    });
    describe("insert", () => {
        it("returns 500 with error on checks");
        it("returns 500 with error on insert");
        it("returns 400 on checks failed");
        it("inserts and applies auto transactions");
        it("inserts without applying auto transactions");
    });
    describe("deleteExpense", () => {
        it("deletes expense");
        it("returns 500 with error");
    });
    describe("lastPaymentDate", () => {
        it("returns when last day of payment reached");
        it("returns when start date reached");
    });
    describe("nextPaymentDate", () => {
        it("returns when next day of payment reached");
        it("sets date to start if it's before start");
    });
    describe("applyAutoTransactions", () => {
        it("throws error on getting expenses");
        it("throws error on inserting transactions");
        it("applies historical expense transactions");
        it("applies single day's expense transactions");
        it("applies all transactions");
        it("applies single expense's transactions");
        it("applies transactions up to date given");
        it("applies transactions up to 'today'");
    });
    describe("isDayOfPayment", () => {
        it("returns false for not yet started");
        it("returns true for d");
        it("returns true for DATE d");
        it("returns true for DATE d/m");
        it("returns true for DAY d");
        it("returns true for DAY DD d");
        it("returns true for WDAY d");
        it("returns true for RDAY d");
    });
    describe("isFrequencyValid", () => {
        it("returns false for no match");
        it("returns true for d");
        it("returns true for DATE d");
        it("returns true for DATE d/m");
        it("returns true for DAY d");
        it("returns true for DAY DD d");
        it("returns true for WDAY d");
        it("returns true for RDAY d");
        it("returns false for d");
        it("returns false for DATE d");
        it("returns false for DATE d/m");
        it("returns false for DAY d");
        it("returns false for DAY DD d");
        it("returns false for WDAY d");
        it("returns false for RDAY d");
    });
});