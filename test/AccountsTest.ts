import { insert, getAll } from '../src/Accounts';

import { expect } from 'chai';

import Connection from './MockConnection';

describe("Accounts", () => {
    describe("getAll", () => {
        it("returns accounts", () => {
            const userId = 1234;
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
            Connection.pool.query = (sql, arr, cb) => {
                expect(sql).to.equal('SELECT id,name,-(SELECT SUM(amount) FROM transactions t WHERE t.account_id=a.id) AS balance FROM accounts a WHERE user_id=?;');
                expect(arr.length).to.equal(1);
                expect(arr[0]).to.equal(userId);

                cb(null, [account1, account2]);
            };

            getAll({ session: { userData: { user_id: userId } } }, {
                status() {
                    expect(1).to.equal(2);
                },
                send(result) {
                    expect(result).to.deep.equal([account1, account2]);
                }
            });
        });
    });
});