import { settings, loadSettings } from '../src/Settings';

import * as sinon from 'sinon';
import * as fs from 'fs';
import { expect } from 'chai';


describe("Settings", () => {
    let readFileSyncStub: sinon.SinonStub;
    let writeFileStub: sinon.SinonStub;
    const mockCentsaDir = ".";
    const settingsFile = `${mockCentsaDir}/settings.json`;
    const legacySettingsFile = `${mockCentsaDir}/system.properties`;
    const settingsObj = { key: "value" };
    beforeEach(() => {
        readFileSyncStub = sinon.stub(fs, "readFileSync").throws("readFileSync");
        writeFileStub = sinon.stub(fs, "writeFile").throws('writeFile');
    });
    afterEach(() => {
        fs.readFileSync["restore"]();
        fs.writeFile["restore"]();
    });
    it("checks that settings contains the only init function", () => {
        expect(Object.keys(settings).length).to.equal(1);
        expect(settings).to.have.property("init");
    });
    it("checks init loads settings", () => {
        readFileSyncStub.withArgs(settingsFile)
            .returns(JSON.stringify(settingsObj));
        settings.init(mockCentsaDir);

        expect(Object.keys(settings).length).to.equal(3);
        expect(settings).to.have.property("init");
        expect(settings).to.have.property("save");
        expect(settings.key).to.equal(settingsObj.key);
    });
    it("checks amending and save function", () => {
        let changedVal = "changedVal";
        let newVal = "newVal";

        readFileSyncStub.withArgs(settingsFile)
            .returns(JSON.stringify(settingsObj));
        writeFileStub.withArgs(settingsFile,
            JSON.stringify({ key: changedVal, newKey: newVal }), sinon.match.any)
            .returns(null);

        settings.init(mockCentsaDir);

        settings.key = changedVal;
        settings.newKey = newVal;

        expect(settings).to.have.property("save");
        settings.save();
    });

    it("initializes settings with legacy properties file", () => {
        readFileSyncStub.withArgs(legacySettingsFile)
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

        let parsed = loadSettings(settingsFile, legacySettingsFile);
        expect(Object.keys(parsed).length).to.equal(3);
        expect(parsed.ui.width).to.equal('1303.0');
        expect(parsed.ui.height).to.equal('724.0');
        expect(parsed.app.budget.strict).to.equal('true');
        expect(parsed.app.update.check).to.equal(true);
        expect(parsed.app.update.download).to.equal(true);
        expect(parsed.app.transactions.pageSize).to.equal('15');
        expect(parsed.misc.postInstallWarning).to.equal(
'<p>Any automatic expenses have been disabled to prevent duplicate entries.\
You should <a href="#!expenses">delete and recreate</a> them with the <em>started</em> \
date as <strong>today</strong>.<p>Automatic expenses will now produce \
automatic transactions when due');
    });
});