const { testConnection } = require('../src/dao/Connection');
const mysql = require('mysql');
const { spy, stub, match } = require('sinon');
const { expect } = require('chai');


describe('Connection', () => {
    describe('testConnection', () => {
        let createConnectionStub;
        beforeEach(() => {
            createConnectionStub = stub(mysql, 'createConnection');
        });
        afterEach(() => {
            createConnectionStub.restore();
        });
        it('Opens a connection, setting an error handler to exit', () => {
            const connectSpy = spy();
            const onStub = stub();

            onStub.withArgs('error', match.func).callsFake((e, cb) => {
                const exitStub = stub(process, 'exit');
                exitStub.withArgs(1).returns(undefined);
                exitStub.throws('Unexpected args: exit');

                cb();

                exitStub.restore();
            });
            onStub.throws('Unexpected args: on');

            const endSpy = spy();

            const config = {
                host: 'someip',
                port: 1234,
                user: 'username',
                password: 'password',
                database: 'testdb'
            };

            createConnectionStub.withArgs(match(config)).returns({
                connect: connectSpy,
                on: onStub,
                end: endSpy
            });
            createConnectionStub.throws('Unexpected args: createConnection');

            testConnection();

            expect(connectSpy.calledOnce).to.be.true;
            expect(endSpy.calledOnce).to.be.true;
        });
    });
});
