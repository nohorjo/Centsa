import { checkAuth, authSkipLogin, login, logout } from '../src/Authentication';
import { spy, stub, match } from 'sinon';
import { expect } from 'chai';
import axios from 'axios';
import * as Users from '../src/Users';

describe("Authentication", () => {
    describe("checkAuth", () => {
        it("calls next when userdata is provided", () => {
            const nextSpy = spy();
            const statusSpy = spy();

            checkAuth(
                { session: { userData: {} } },
                { status: statusSpy },
                nextSpy);

            expect(nextSpy.called).to.be.true;
            expect(statusSpy.notCalled).to.be.true;
        });
        it("returns 401 on no userdata", () => {
            const nextSpy = spy();
            const statusStub = stub();

            statusStub.withArgs(401).returns(undefined);
            statusStub.throws("Unexpected args: status");

            checkAuth(
                { session: {} },
                { sendStatus: statusStub },
                nextSpy);

            expect(statusStub.called).to.be.true;
            expect(nextSpy.notCalled).to.be.true;
        });
        it("returns 401 on no session", () => {
            const nextSpy = spy();
            const statusStub = stub();

            statusStub.withArgs(401).returns(undefined);
            statusStub.throws("Unexpected args: status");

            checkAuth(
                {},
                { sendStatus: statusStub },
                nextSpy);

            expect(statusStub.called).to.be.true;
            expect(nextSpy.notCalled).to.be.true;
        });
    });
    describe("authSkipLogin", () => {
        it("redirects to main on userdata", () => {
            const redirectSpy = spy();
            const nextSpy = spy();

            authSkipLogin(
                { session: { userData: {} } },
                { redirect: redirectSpy },
                nextSpy);

            expect(redirectSpy.calledOnce).to.be.true;
            expect(redirectSpy.calledWith("/main.html")).to.be.true;
            expect(nextSpy.notCalled).to.be.true;
        });
        it("calls next on no userdata", () => {
            const redirectSpy = spy();
            const nextSpy = spy();

            authSkipLogin(
                { session: {} },
                { redirect: redirectSpy },
                nextSpy);

            expect(nextSpy.called).to.be.true;
            expect(redirectSpy.notCalled).to.be.true;
        });
        it("calls next on no session", () => {
            const redirectSpy = spy();
            const nextSpy = spy();

            authSkipLogin(
                {},
                { redirect: redirectSpy },
                nextSpy);

            expect(nextSpy.called).to.be.true;
            expect(redirectSpy.notCalled).to.be.true;
        });
    });
    describe("login", () => {
        let getStub, getOrCreateUserStub;
        beforeEach(() => {
            getStub = stub(axios, "get");
            getOrCreateUserStub = stub(Users, "getOrCreateUser");
        });
        afterEach(() => {
            getStub.restore();
            getOrCreateUserStub.restore();
        });
        it("makes request to FB to get user data and sets userdata in session and name cookie", async () => {
            const userID = 1234;
            const accessToken = "token";
            const name = "name";
            const session = {};

            getStub.withArgs(`https://graph.facebook.com/${userID}?access_token=${accessToken}&fields=email,name`)
                .returns(Promise.resolve({ data: { name: name } }));
            getStub.throws("Unexpected args: get");

            getOrCreateUserStub.withArgs(match({ name: name }), match.func)
                .callsFake((x, cb) => cb(userID));
            getOrCreateUserStub.throws("Unexpected args: getOrCreateUserStub");

            const cookieSpy = spy();
            const sendStatusSpy = spy();
            const statusStub = stub().throws("Unexpected call: status");

            await login({
                session: session,
                body: {
                    userID: userID,
                    accessToken: accessToken
                }
            }, {
                    cookie: cookieSpy,
                    sendStatus: sendStatusSpy,
                    status: statusStub
                });

            expect(cookieSpy.calledOnce).to.be.true;
            expect(cookieSpy.calledWith('name', name, match({ maxAge: 31536000000, httpOnly: false })))
                .to.be.true;
            expect(sendStatusSpy.calledOnce).to.be.true;
            expect(sendStatusSpy.calledWith(201)).to.be.true;

        });
        it("returns 500 with error", async () => {
            const error = "Intentional throw";
            const statusStub = stub();
            const sendSpy = spy();

            statusStub.withArgs(500).returns({ send: sendSpy });
            statusStub.throws("Unexpected args: status");

            getStub.throws(error);

            await login({ body: {} }, {
                status: statusStub
            });

            expect(sendSpy.calledOnce).to.be.true;
            expect(sendSpy.calledWith(error)).to.be.true;
        });
    });
    describe("logout", () => {
        it("deletes session and clears name cookie", () => {
            const clearCookieSpy = spy();
            const sendStatusSpy = spy();
            const req = { session: { userData: {} } };

            logout(req, {
                clearCookie: clearCookieSpy,
                sendStatus: sendStatusSpy
            });

            expect(req).to.not.have.property("session");
            expect(clearCookieSpy.calledTwice).to.be.true;
            expect(clearCookieSpy.calledWith("name")).to.be.true;
            expect(clearCookieSpy.calledWith("currentUser")).to.be.true;
            expect(sendStatusSpy.calledOnce).to.be.true;
            expect(sendStatusSpy.calledWith(201)).to.be.true;
        });
    });
});
