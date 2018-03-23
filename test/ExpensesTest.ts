import * as Expenses from '../src/Expenses';
import { pool } from '../src/Connection';
import { stub, match, spy } from 'sinon';
import { expect } from 'chai';

describe("Expenses", () => {
    const userId = 1234;
    const date = '2017-04-22T18:32:09.101Z'
    const req = {
        session: {
            userData: { user_id: userId }
        },
        get(header) {
            switch (header) {
                case "x-date": return date;
            }
        }
    };
    let queryStub;

    beforeEach(() => {
        queryStub = stub(pool, 'query');
    });
    afterEach(() => {
        queryStub.restore();
    });
    describe("getAll", () => {
        it("returns expenses", () => {
            const expense1 = {
                id: 9876,
                name: "expense1",
                cost: 7659,
                frequency: "8",
                started: new Date(6352674),
                automatic: true,
                account_id: null,
                type_id: 6539,
                instances_count: 32
            };
            const expense2 = {
                id: 43289,
                name: "expense2",
                cost: 3524,
                frequency: "DAY 6",
                started: new Date(73241),
                automatic: false,
                account_id: 8352,
                type_id: 275,
                instances_count: 0
            };

            queryStub.withArgs(
                `SELECT id,name,cost,frequency,started,automatic,account_id,type_id, 
        (SELECT COUNT(*) FROM transactions t WHERE (t.expense_id IS NOT NULL AND t.expense_id=e.id)) AS instances_count 
        FROM expenses e WHERE user_id=?;`,
                match([userId]),
                match.func
            ).callsFake((x, y, cb) => cb(null, [expense1, expense2]));
            queryStub.throws("Unexpected args: getAll");

            const sendSpy = spy();
            const statusSpy = spy();

            Expenses.getAll(req, {
                send: sendSpy,
                status: statusSpy
            });

            expect(sendSpy.calledWith(match([expense1, expense2]))).to.be.true;
            expect(statusSpy.notCalled).to.be.true;

        });
        it("returns 500 with error", () => {
            const errorMsg = "Error message: getAll";
            queryStub.withArgs(
                `SELECT id,name,cost,frequency,started,automatic,account_id,type_id, 
        (SELECT COUNT(*) FROM transactions t WHERE (t.expense_id IS NOT NULL AND t.expense_id=e.id)) AS instances_count 
        FROM expenses e WHERE user_id=?;`,
                match.array.deepEquals([userId]),
                match.func
            ).callsFake((x, y, cb) => cb(errorMsg));
            queryStub.throws("Unexpected args: getAll");

            const sendSpy = spy();
            const statusStub = stub();

            const sendErrorSpy = spy();

            statusStub.withArgs(500).returns({ send: sendErrorSpy });
            statusStub.throws("Unexpected args: status");

            Expenses.getAll(req, {
                send: sendSpy,
                status: statusStub
            });

            expect(sendErrorSpy.calledWith(errorMsg)).to.be.true;
            expect(sendSpy.notCalled).to.be.true;
        });
    });
    describe("getTotals", () => {
        it("returns auto total", () => {
            queryStub.withArgs(
                "SELECT cost,frequency FROM expenses WHERE automatic=true AND started<? AND user_id=?;",
                match([match.date, userId]),
                match.func
            ).callsFake((x, arr, cb) => {
                expect(arr[0]).to.deep.equal(new Date(date))
                cb(null, [
                    { cost: 2, frequency: "2" },
                    { cost: 365, frequency: "DATE 1/1" },
                    { cost: 30, frequency: "DAY 9" }
                ]);
            });
            queryStub.throws("Unexpected args: getTotals");

            const statusSpy = spy();
            const sendSpy = spy();

            Expenses.getTotals(
                Object.assign({ query: { auto: "true" } }, req),
                {
                    status: statusSpy,
                    send: sendSpy
                }
            );

            expect(statusSpy.notCalled).to.be.true;
            expect(sendSpy.calledWith("3")).to.be.true;
        });
        it("returns non auto total", () => {
            queryStub.withArgs(
                "SELECT cost,frequency FROM expenses WHERE started<=? AND user_id=?;",
                match([match.date, userId]),
                match.func
            ).callsFake((x, arr, cb) => {
                expect(arr[0]).to.deep.equal(new Date(date))
                cb(null, [
                    { cost: 4, frequency: "2" },
                    { cost: 730, frequency: "DATE 1/1" },
                    { cost: 60, frequency: "DAY 9" }
                ]);
            });
            queryStub.throws("Unexpected args: getTotals");

            const statusSpy = spy();
            const sendSpy = spy();

            Expenses.getTotals(
                Object.assign({ query: { auto: "false" } }, req),
                {
                    status: statusSpy,
                    send: sendSpy
                }
            );

            expect(statusSpy.notCalled).to.be.true;
            expect(sendSpy.calledWith("6")).to.be.true;
        });
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