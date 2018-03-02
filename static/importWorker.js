importScripts('https://cdnjs.cloudflare.com/ajax/libs/PapaParse/4.3.7/papaparse.min.js');
self.addEventListener('message', e => {
    const { rule, csv } = e.data;

    const ajax = x => {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.onreadystatechange = () => {
                if (xhr.readyState == 4) {
                    if (xhr.status >= 400) {
                        reject(xhr);
                    } else {
                        resolve(xhr);
                    }
                }
            };

            xhr.open(x.method, x.url, true);
            for (let header in x.headers) xhr.setRequestHeader(header, x.headers[header]);
            xhr.send(x.data);
        });
    };

    const readFile = file => {
        return new Promise(resolve => {
            const reader = new FileReader();
            reader.onload = e => resolve(e.target.result);
            reader.readAsText(file);
        });
    };

    Promise.all([
        ajax({
            url: `/api/general/rule/${rule}`,
            method: "GET"
        }),
        readFile(csv)
    ]).then(result => {
        const script = result[0].responseText;
        const { data, errors } = Papa.parse(result[1]);
        if (errors.length) {
            throw JSON.stringify(errors);
        }

        //TODO: implement
        let i = 0;
        setInterval(() => {
            if (i == 50) {
                self.close();
                throw "Done";
            }
            self.postMessage({
                processed: i++,
                total: 50
            });
        }, 200);
    });
});