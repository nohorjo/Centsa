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

    const $centsa = new centsa($http);

    const runScript = async (result, script) => {
        const { data, errors } = Papa.parse(result);
        if (errors.length) {
            throw JSON.stringify(errors);
        }
        const total = data.length;
        self.postMessage({
            processed: 0,
            total
        });
        // eslint-disable-next-line no-unused-vars
        const $records = (() => {
            let i = 0;
            return {
                hasNext() {
                    const rtn = i < total - 1;
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

        return eval(`async () => {${script}}`)();
    };

    Promise.all([
        Promise.resolve(script || $centsa.general.rule(rule)),
        readFile(csv)
    ]).then(([
        scriptData,
        file
    ]) => runScript(file, scriptData.data || scriptData))
        .catch(e => {
            console.error(e);
            setTimeout(() => { throw e.message || e.response || e; }, 0);
        });
});
