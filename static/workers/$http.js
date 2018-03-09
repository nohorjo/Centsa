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