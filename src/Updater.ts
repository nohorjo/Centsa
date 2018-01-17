import axios from 'axios';
import * as fs from 'fs';

function checkNewVersion(callback: (info: any) => void) {
    axios.get('https://api.github.com/repos/nohorjo/Centsa/releases/latest')
        .then((response: any) => {
            fs.readFile(`${__dirname}/package.json`, "utf8", (err, data) => {
                if (err) {
                    console.error(err);
                } else {
                    let currentVersion = JSON.parse(data).version.split(".");
                    let nextVersion = response.data.tag_name.substr(1).split(".");
                    if (currentVersion[0] != nextVersion[0] || currentVersion[1] != nextVersion[1]) {
                        // update available
                        callback({
                            version: nextVersion.join("."),
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

export default {
    autoCheckUpdate() {
        checkNewVersion(
            // FIXME: 
        );
    }
};