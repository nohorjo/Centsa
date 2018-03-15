import { insert, getAll } from '../src/Accounts';

import { expect } from 'chai';

import Connection from './MockConnection';

describe("Accounts", () => {
    const userId = 1234;
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
        it("returns accounts", () => {
            Connection.pool.query = (sql, arr, cb) => {
                expect(sql).to.equal(query);
                expect(arr.length).to.equal(1);
                expect(arr[0]).to.equal(userId);

                cb(null, [account1, account2]);
            };

            getAll({ session: { userData: { user_id: userId } } }, {
                status() {
                    expect.fail();
                },
                send(result) {
                    expect(result).to.deep.equal([account1, account2]);
                }
            });
        });
        it("returns 500 with error", () => {
            const errorMsg = "Error message";
            Connection.pool.query = (sql, arr, cb) => {
                expect(sql).to.equal(query);
                expect(arr.length).to.equal(1);
                expect(arr[0]).to.equal(userId);

                cb(errorMsg);
            };
            getAll({ session: { userData: { user_id: userId } } }, {
                status(code) {
                    expect(code).to.equal(500);
                    return {
                        send(msg) {
                            expect(msg).to.equal(errorMsg);
                        }
                    };
                },
                send() {
                    expect.fail();
                }
            });
        });
    });
    describe("insert", () => {
        const query = `INSERT INTO accounts (name,user_id) VALUES (?,?);`;
        const newAccountName = "new account";
        const newId = '5678';
        it("returns ID", () => {
            Connection.pool.query = (sql, arr, cb) => {
                expect(sql).to.equal(query);
                expect(arr.length).to.equal(2);
                expect(arr[0]).to.equal(newAccountName);
                expect(arr[1]).to.equal(userId);
                cb(null, { insertId: newId });
            };
            insert({
                body: { name: newAccountName },
                session: { userData: { user_id: userId } }
            }, {
                    status() {
                        expect.fail();
                    },
                    send(result) {
                        expect(result).to.equal(newId);
                    }
                });
        });
    });
});