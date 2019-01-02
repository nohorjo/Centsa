const { insert, getAll } = require('../src/Accounts');
const { expect } = require('chai');
const Connection = require('../src/dao/Connection');
const { spy, stub, match } = require('sinon');

describe('Accounts', () => {
    const userId = 1234;
    let queryStub;

    beforeEach(() => queryStub = stub(Connection.pool, 'query'));
    afterEach(() => queryStub.restore());

    describe('getAll', () => {
        const query = 'SELECT id,name,-(COALESCE((SELECT SUM(amount) FROM transactions t WHERE t.account_id=a.id), 0)) AS balance FROM accounts a WHERE user_id=?;';
        const account1 = {
            id: 1234,
            name: 'account1',
            balance: 987,
        };
        const account2 = {
            id: 5678,
            name: 'account2',
            balance: 6543,
        };
        const request = { session: { userData: { user_id: userId } }, query: {} };
        it('returns accounts', () => {
            queryStub.withArgs(query, match([userId]), match.func).callsFake((sql, arr, cb) => {
                cb(null, [account1, account2]);
            });
            queryStub.throws('Unexpected args: query');

            const sendStub = stub();
            sendStub.withArgs(match([account1, account2])).returns(undefined);
            sendStub.throws('Unexpected args: send');

            const statusSpy = spy();

            getAll(request, {
                status: statusSpy,
                send: sendStub
            });

            expect(sendStub.calledOnce).to.be.true;
            expect(statusSpy.notCalled).to.be.true;
        });
        it('returns 500 with error', () => {
            const errorMsg = 'Error message: getAll';

            queryStub.withArgs(query, match([userId]), match.func).callsFake((sql, arr, cb) => {
                cb(errorMsg);
            });
            queryStub.throws('Unexpected args: query');

            const errorSendStub = stub();
            errorSendStub.withArgs(errorMsg).returns(undefined);
            errorSendStub.throws('Unexpected args: errorSend');

            const statusStub = stub();
            statusStub.withArgs(500).returns({ send: errorSendStub });
            statusStub.throws('Unexpected args: status');

            const sendSpy = spy();

            getAll(request, {
                status: statusStub,
                send: sendSpy
            });

            expect(statusStub.calledOnce).to.be.true;
            expect(errorSendStub.calledOnce).to.be.true;
            expect(sendSpy.notCalled).to.be.true;
        });
    });
    describe('insert', () => {
        const query = 'INSERT INTO accounts SET ?;';
        const newAccountName = 'new account';
        const newId = '5678';
        const request = {
            body: { name: newAccountName },
            session: { userData: { user_id: userId, accounts: [] } }
        };
        it('returns ID', () => {
            queryStub.withArgs(
                query,
                match([
                    match({ user_id: userId, name: newAccountName }),
                    undefined
                ]),
                match.func).callsFake((sql, arr, cb) => {
                cb(null, { insertId: newId });
            });
            queryStub.throws('Unexpected args: query');

            const sendStub = stub();
            sendStub.withArgs(newId).returns(undefined);
            sendStub.throws('Unexpected args: send');

            const statusSpy = spy();

            insert(request, {
                status: statusSpy,
                send: sendStub
            });

            expect(sendStub.calledOnce).to.be.true;
            expect(statusSpy.notCalled).to.be.true;
        });
        it('returns 500 with error', () => {
            const errorMsg = 'Error message: insert';
            queryStub.withArgs(query,
                match([
                    match({ user_id: userId, name: newAccountName }),
                    undefined
                ]),
                match.func).callsFake((sql, arr, cb) => {
                cb(errorMsg);
            });
            queryStub.throws('Unexpected args: query');

            const errorSendStub = stub();
            errorSendStub.withArgs(errorMsg).returns(undefined);
            errorSendStub.throws('Unexpected args: errorSend');

            const statusStub = stub();
            statusStub.withArgs(500).returns({ send: errorSendStub });
            statusStub.throws('Unexpected args: status');

            const sendSpy = spy();

            insert(request, {
                status: statusStub,
                send: sendSpy
            });

            expect(statusStub.calledOnce).to.be.true;
            expect(errorSendStub.calledOnce).to.be.true;
            expect(sendSpy.notCalled).to.be.true;
        });
    });
});
