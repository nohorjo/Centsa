importScripts(
    'https://cdnjs.cloudflare.com/ajax/libs/PapaParse/4.3.7/papaparse.min.js',
    '/workers/$http.js',
    '/centsa.js'
);
self.addEventListener('message', e => {
    const { rule, csv } = e.data;

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

    Promise.all([
        $centsa.general.rule(rule),
        readFile(csv)
    ]).then(result => {
        const script = result[0].data;
        const { data, errors } = Papa.parse(result[1]);
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

    }).catch(err => setTimeout(() => { throw JSON.stringify(err.message || err.response); }, 0));

});