importScripts('https://cdnjs.cloudflare.com/ajax/libs/PapaParse/4.3.7/papaparse.min.js', '/centsa.js');
self.addEventListener('message', e => {
    const { rule, csv } = e.data;

    const $http = (() => {
        const ajax = x => {
            return new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.onreadystatechange = () => {
                    if (xhr.readyState == 4) {
                        if (xhr.status >= 400) {
                            reject(xhr);
                        } else {
                            try {
                                let data = xhr.response;
                                if (xhr.getResponseHeader('content-type').indexOf("application/json") != -1) {
                                    data = JSON.parse(data);
                                }
                                resolve({ data: data, status: xhr.status });
                            } catch (err) {
                                reject(err);
                            }
                        }
                    }
                };
                if (x.params) {
                    x.url += "?";
                    for (let p in x.params) {
                        x.url += `${p}=${encodeURIComponent(JSON.stringify(x.params[p]))}&`
                    }
                }
                xhr.open(x.method, x.url, true);
                for (let header in x.headers) xhr.setRequestHeader(header, x.headers[header]);
                xhr.send(x.data);
            });
        };

        return {
            get(url, opts) {
                return ajax({
                    url: url,
                    method: "GET",
                    params: opts && opts.params,
                    headers: opts && opts.headers
                });
            },
            post(url, data, opts) {
                return ajax({
                    url: url,
                    method: "POST",
                    headers: Object.assign({
                        "Content-Type": "application/json"
                    }, opts && opts.headers),
                    data: JSON.stringify(data)
                });
            },
            delete(url) {
                return ajax({
                    url: url,
                    method: "DELETE"
                });
            }
        };
    })();

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