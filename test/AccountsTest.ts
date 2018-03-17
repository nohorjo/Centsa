import { insert, getAll } from '../src/Accounts';

import { expect } from 'chai';

import * as Connection from '../src/Connection';

import { stub, match } from 'sinon';

describe("Accounts", () => {
    const userId = 1234;
    let queryStub;

    beforeEach(() => queryStub = stub(Connection.pool, "query"));
    afterEach(() => queryStub.restore());

    describe("getAll", () => {
        const query = 'SELECT id,name,-(SELECT SUM(amount) FROM transactions t WHERE t.account_id=a.id) AS balance FROM accounts a WHERE user_id=?;';
        const account1 = {
            id: 1234,
            name: "account1",
            balance: 987,
        };
        const account2 = {
            id: 5678,
            name: "account2",
            balance: 6543,
        };
        const request = { session: { userData: { user_id: userId } } };
        it("returns accounts", () => {
            queryStub.withArgs(query, match([userId]), match.func).callsFake((sql, arr, cb) => {
                cb(null, [account1, account2]);
            });
            queryStub.throws("Unexpected args: query");

            const sendStub = stub();
            sendStub.withArgs(match([account1, account2])).returns(undefined);
            sendStub.throws("Unexpected args: send");

            const statusStub = stub().throws("Unexpected call: status");

            getAll(request, {
                status: statusStub,
                send: sendStub
            });
        });
        it("returns 500 with error", () => {
            const errorMsg = "Error message: getAll";

            queryStub.withArgs(query, match([userId]), match.func).callsFake((sql, arr, cb) => {
                cb(errorMsg);
            });
            queryStub.throws("Unexpected args: query");

            const errorSendStub = stub();
            errorSendStub.withArgs(errorMsg).returns(undefined);
            errorSendStub.throws("Unexpected args: errorSend");

            const statusStub = stub();
            statusStub.withArgs(500).returns({ send: errorSendStub });
            statusStub.throws("Unexpected args: status");

            const sendStub = stub().throws("Unexpected call: send");

            getAll(request, {
                status: statusStub,
                send: sendStub
            });
        });
    });
    describe("insert", () => {
        const query = `INSERT INTO accounts (name,user_id) VALUES (?,?);`;
        const newAccountName = "new account";
        const newId = '5678';
        const request = {
            body: { name: newAccountName },
            session: { userData: { user_id: userId } }
        };
        it("returns ID", () => {
            queryStub.withArgs(query, match([newAccountName, userId]), match.func).callsFake((sql, arr, cb) => {
                cb(null, { insertId: newId });
            });
            queryStub.throws("Unexpected args: query");

            const sendStub = stub();
            sendStub.withArgs(newId).returns(undefined);
            sendStub.throws("Unexpected args: send");

            const statusStub = stub().throws("Unexpected call: status");

            insert(request, {
                status: statusStub,
                send: sendStub
            });
        });
        it("returns 500 with error", () => {
            const errorMsg = "Error message: insert";
            queryStub.withArgs(query, match([newAccountName, userId]), match.func).callsFake((sql, arr, cb) => {
                cb(errorMsg);
            });
            queryStub.throws("Unexpected args: query");

            const errorSendStub = stub();
            errorSendStub.withArgs(errorMsg).returns(undefined);
            errorSendStub.throws("Unexpected args: errorSend");

            const statusStub = stub();
            statusStub.withArgs(500).returns({ send: errorSendStub });
            statusStub.throws("Unexpected args: status");

            const sendStub = stub().throws("Unexpected call: send");

            insert(request, {
                status: statusStub,
                send: sendStub
            });
        });
    });
});