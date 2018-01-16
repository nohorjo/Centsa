import * as fs from 'fs';
import { app } from 'electron';
import * as os from 'os';


export let settings: any = {
    init(centsaDir: any) {
        const settingsFile = `${centsaDir}/settings.json`;

        settings = loadSettings(settingsFile, `${centsaDir}/system.properties`);

        settings.save = (done: (err?: NodeJS.ErrnoException) => void = err => {
            if (err) console.error(err);
            else console.log("Updated settings");
        }) => fs.writeFile(settingsFile, JSON.stringify(settings), done);

        settings.init = () => console.warn("Settings already initialized");
    }
};

export function loadSettings(settingsFile: string, legacySettingsFile: string) {
    try {
        return JSON.parse(fs.readFileSync(settingsFile, "utf8"));
    } catch (error) {
        if (error.code != 'ENOENT') throw error;

        let data = fs.readFileSync(legacySettingsFile, "utf8");
        let tmp: any = {};
        data.replace(/\\\r?\n/g, '').split(os.EOL).forEach(line => {
            if (!(line.startsWith('#') || line.startsWith("!"))
                && (line.indexOf('=') != -1 || line.indexOf(':') != -1)) {
                let kv = line.split(/[=:](.+)/, 2);
                tmp[kv[0].trim()] = kv[1].trim();
            }
        });

        return {
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
            },
            misc: { postInstallWarning: tmp["post.install.warning"] }
        };
    }
}


