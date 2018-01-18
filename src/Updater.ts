import axios from 'axios';
import * as fs from 'fs';
import { exec } from "child_process";
import * as os from 'os';

import { settings } from './Settings';

function checkNewVersion(callback: (info: any) => void) {
    axios.get('https://api.github.com/repos/nohorjo/Centsa/releases/latest')
        .then((response: any) => {
            fs.readFile(`${__dirname}/../package.json`, "utf8", (err, data) => {
                if (err) {
                    console.error(err);
                } else {
                    let currentVersion = JSON.parse(data).version.split(".");
                    let nextVersion = response.data.tag_name.substr(1).split(".");
                    if (currentVersion[0] != nextVersion[0] || currentVersion[1] != nextVersion[1]) {
                        // update available
                        callback({
                            version: "v" + nextVersion.join("."),
                            changelog: response.data.body,
                            asset: response.data.assets[0].browser_download_url
                        });
                    }
                }
            });
        })
        .catch((error: any) => {
            console.error(error);
        });
}

function downloadAndOpen(url: string) {
    axios({
        method: 'get',
        url: url, responseType:
        'stream'
    }).then((resp: any) => {
        let filePath = `${os.tmpdir()}/${url.replace(/^.*\//g, "")}`;
        let dlStream = fs.createWriteStream(filePath);
        dlStream.on("close", () => {
            let openCommand = (() => {
                switch (process.platform) {
                    case 'darwin': return 'open';
                    case 'linux': return 'xdg-open';
                    default: return 'start';
                }
            })();
            exec(`${openCommand} ${filePath}`, () => {
                fs.unlink(filePath, err => { if (err) console.log(err); });
            });
        });
        resp.data.pipe();
    }).catch((error: any) => {
        console.error(error);
    });
}

export default {
    autoCheckUpdate(callback: (update: any, confirm: () => void) => void) {
        if (settings.app.update.check) {
            checkNewVersion((update) => {
                if (settings.app.update.download) {
                    downloadAndOpen(update.asset);
                } else {
                    callback(update, () => downloadAndOpen(update.asset));
                }
            });
        }
    }
};