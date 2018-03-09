importScripts(
    'https://cdnjs.cloudflare.com/ajax/libs/PapaParse/4.3.7/papaparse.min.js',
    '/lib/util/dateFormat.js',
    '/workers/$http.js',
    '/centsa.js'
);
self.addEventListener('message', e => {
    const $centsa = new centsa($http);
    Promise.all([
        $centsa.transactions.getAll({
            page: 1,
            pageSize: Number.MAX_SAFE_INTEGER,
            filter: e.data
        }),
        $centsa.accounts.getAll(),
        $centsa.types.getAll()
    ]).then(result => {
        const transactions = result[0].data;
        const accounts = result[1].data;
        const types = result[2].data;

        const csv = transactions.map(t => ({
            Date: new Date(t.date).formatDate("yyyy/MM/dd"),
            Amount: (t.amount / 100).toFixed(2),
            Comment: t.comment,
            Account: accounts.find(x => x.id == t.account_id).name,
            Type: types.find(x => x.id == t.type_id).name
        }));

        self.postMessage(Papa.unparse(csv));
    }).catch(err => setTimeout(() => { throw JSON.stringify(err.message || err.response); }, 0));

});