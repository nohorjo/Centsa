importScripts(
    'https://cdnjs.cloudflare.com/ajax/libs/PapaParse/4.3.7/papaparse.min.js',
    '/workers/$http.js',
    '/centsa.js'
);
self.addEventListener('message', e => {
    const { rule, script, csv } = e.data;

    const readFile = file => {
        return new Promise((resolve, reject) => {
            try {
                const reader = new FileReader();
                reader.onload = e => resolve(e.target.result);
                reader.readAsText(file);
            } catch (e) {
                reject(e);
            }
        });
    };

    const runScript = (result, script) => {
        const { data, errors } = Papa.parse(result);
        if (errors.length) {
            throw JSON.stringify(errors);
        }
        const total = data.length;
        self.postMessage({
            processed: 0,
            total: total
        });
        const $records = (() => {
            let i = 0;
            return {
                hasNext() {
                    const rtn = i < total;
                    if (!rtn) {
                        self.postMessage(null);
                    }
                    return rtn;
                },
                next() {
                    self.postMessage({
                        processed: i + 1,
                        total: total
                    });
                    return data[i++];
                }
            };
        })();

        eval(script);
    };

    const $centsa = new centsa($http);

    if (script) {
        readFile(csv).then(result => {
            runScript(result, script);
        });
    } else {
        Promise.all([
            $centsa.general.rule(rule),
            readFile(csv)
        ]).then(result => {
            runScript(result[1], result[0].data);
        }).catch(err => setTimeout(() => { throw JSON.stringify(err.message || err.response); }, 0));
    }

});