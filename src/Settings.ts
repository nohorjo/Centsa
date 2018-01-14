import * as fs from 'fs';
import { app } from 'electron';
import * as os from 'os';

const centsaDir = `${app.getPath("home")}/.centsa`;
const settingsFile = `${centsaDir}/settings.json`;
const settingsFileLegacy = `${centsaDir}/system.properties`;

let settings: any;


fs.mkdir(centsaDir, err => {
    if (!err || err.code == 'EEXIST') loadSettings(settingsFile);
    else console.log(err);
});

settings.save = (done: (err?: NodeJS.ErrnoException) => void = err => {
    if (err) console.error(err);
    else console.log("Updated settings");
}) => fs.writeFile(settingsFile, JSON.stringify(settings), done);

function loadSettings(settingsFile: string) {
    fs.readFile(settingsFile, "utf8", (error, data) => {
        if (!error) settings = JSON.parse(data);
        else if (error.code == 'ENOENT') settings = loadSettingsLegacy(settingsFileLegacy);
        else console.error(error);
    });
}

function loadSettingsLegacy(settingsFile: string) {
    fs.readFile(settingsFile, "utf8", (error, data) => {
        if (!error) {
            let tmp: any = {};
            data.split(os.EOL).forEach(line => {
                if (!line.startsWith('#') && (line.indexOf('=') != -1 || line.indexOf(':') != -1)) {
                    let kv = line.split(/[=:](.+)/, 2);
                    tmp[kv[0]] = kv[1];
                }
            });

            settings = {
                ui: {
                    layout: tmp.layout,
                    width: tmp.width,
                    height: tmp.height,
                },
                app: {
                    budget: { strict: tmp["strict.mode"] },
                    update: {
                        check: tmp["auto.update.check"] != 0,
                        download: tmp["auto.update.check"] == 2,
                    },
                    transactions: { pageSize: tmp["trans.page.size"] },
                    misc: { postInstallWarning: tmp["post.install.warning"] }
                }
            };
        } else {
            console.error(error);
        }
    });
}


export default settings;