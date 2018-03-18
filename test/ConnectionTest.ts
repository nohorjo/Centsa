import { testConnection } from '../src/Connection';
import * as mysql from 'mysql';
import { stub, match } from 'sinon';
import { expect } from 'chai';


describe("Connection", () => {
    describe("testConnection", () => {
        let createConnectionStub;
        beforeEach(() => {
            createConnectionStub = stub(mysql, "createConnection");
        });
        afterEach(() => {
            createConnectionStub.restore();
        });
        it("Opens a connection, setting an error handler to exit", () => {
            const connectStub = stub();
            const onStub = stub();

            onStub.withArgs("error", match.func).callsFake((e, cb) => {
                const exitStub = stub(process, "exit");
                exitStub.withArgs(1).returns(undefined);
                exitStub.throws("Unexpected args: exit");

                cb();

                exitStub.restore();
            });
            onStub.throws("Unexpected args: on");

            const endStub = stub();

            const config = {
                host: "someip",
                port: 1234,
                user: "username",
                password: "password",
                database: "testdb"
            };

            createConnectionStub.withArgs(match(config)).returns({
                connect: connectStub,
                on: onStub,
                end: endStub
            });
            createConnectionStub.throws("Unexpected args: createConnection");

            testConnection();

            expect(connectStub.callCount).to.equal(1);
            expect(endStub.callCount).to.equal(1);
        });
    });
});