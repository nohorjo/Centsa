import { settings } from '../src/Settings';

import * as sinon from 'sinon';
import * as fs from 'fs';
import { expect } from 'chai';


describe("Settings", () => {
    let readFileSyncStub: sinon.SinonStub;
    const mockCentsaDir = ".";
    beforeEach(() => {
        readFileSyncStub = sinon.stub(fs, "readFileSync").throws();
    });
    afterEach(() => {
        fs.readFileSync["restore"]();
    });
    it("checks that settings contains the only init function", () => {
        expect(Object.keys(settings).length).to.equal(1);
        expect(settings).to.have.property("init");
    });
    it("initializes settings and checks properties and save function", () => {
        let key = "testKey";
        let value = "testValue";
        readFileSyncStub.withArgs(`${mockCentsaDir}/settings.json`)
            .returns(`{"${key}":"${value}"}`);

        settings.init(mockCentsaDir);
        expect(Object.keys(settings).length).to.equal(3);
        expect(settings).to.have.property("save");
        expect(settings[key]).to.equal(value);
    });
    it("initializes settings with legacy properties file", () => {
        readFileSyncStub.withArgs(`${mockCentsaDir}/system.properties`)
            .returns(
`# ui configuration
layout=default
width=1303.0
height=724.0

# application configuration
strict.mode=true
auto.update.check=2

# extra
trans.page.size = 15

# is deleted after first run
post.install.warning=<p>Any automatic expenses have been disabled to prevent duplicate entries.\
  You should <a href="#!expenses">delete and recreate</a> them with the <em>started</em> date as <strong>today</strong>.\
  <p>Automatic expenses will now produce automatic transactions when due`);
        readFileSyncStub.throws({ code: 'ENOENT' });

        settings.init(mockCentsaDir);
        expect(Object.keys(settings).length).to.equal(4);
        expect(settings).to.have.property("save");
        expect(settings.ui.width).to.equal(1303.0);
        expect(settings.ui.height).to.equal(724.0);
        expect(settings.app.budget.strict).to.equal(true);
        expect(settings.app.update.check).to.equal(true);
        expect(settings.app.update.download).to.equal(true);
        expect(settings.app.transactions.pageSize).to.equal(15);
        expect(settings.misc.postInstallWarning).to.equal('<p>Any automatic expenses have been disabled to prevent duplicate entries.You should <a href="#!expenses">delete and recreate</a> them with the <em>started</em> date as <strong>today</strong>.<p>Automatic expenses will now produce automatic transactions when due');
    });
});