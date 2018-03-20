describe("Transactions", () => {
    describe("getAll", () => {
        it("returns all with sort given");
        it("returns all with no sort given");
        it("returns all with invalid sort given");
        it("returns all with standard comment");
        it("returns all with regex comment");
        it("returns 500 with error");
    });
    describe("insert", () => {
        it("calls insertBatch when Array");
        it("calls insertSingle when not Array");
    });
    describe("insertBatch", () => {
        it("returns 500 with error on checks");
        it("returns 500 with error on insert");
        it("returns 400 on checks failed");
        it("inserts");
    });
    describe("insertSingle", () => {
        it("returns 500 with error on checks");
        it("returns 500 with error on insert");
        it("returns 400 on checks failed");
        it("inserts");
    });
    describe("deleteTransaction", () => {
        it("deletes transaction");
        it("returns 500 with error");
    });
    describe("getSums", () => {
        it("returns sums");
        it("returns 500 with error");
    });
    describe("getSummary", () => {
        it("returns summary with standard comment");
        it("returns summary with regex comment");
        it("returns 500 with error");
    });
    describe("getComments", () => {
        it("returns comments");
        it("returns 500 with error");
    });
    describe("countPages", () => {
        it("returns pages count with standard comment");
        it("returns pages count with regex comment");
        it("returns 500 with error");
    });
    describe("parseFilter", () => {
        it("returns filter with no comment");
        it("returns filter with standard comment");
        it("returns filter with regex comment");
        it("returns filter with no from date");
        it("returns filter with no to date");
        it("returns filter with no from amount");
        it("returns filter with no to amount");
    });
});