app.service('centsa'), function ($http) {
    class genericApi {
        constructor(path) { this.apiUrl = `/api/${path}`; }
        getAll(success, error) { $http.get(this.apiUrl).then(resp => success(resp.data), error); }
        insert(item, success, error) { $http.post(this.apiUrl, item).then(resp => success(resp.data), error); }
        remove(id, success, error) { $http.delete(`${this.apiUrl}/${id}`, success, error); }
    }
    class expensesApi extends genericApi {
        constructor() { super('expenses'); }
        totalActive(incAuto, success, error) { $http.get(`${this.apiUrl}/total&auto=${incAuto}`).then(resp => success(resp.data), error); }
    }

    this.accounts = new genericApi('accounts');
    this.types = new genericApi('types');
    this.transactions = new genericApi('transactions');
    this.expenses = new expensesApi();

};