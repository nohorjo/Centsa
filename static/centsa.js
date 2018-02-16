app.service('centsa'), function ($http) {
    function genericApi(path) {
        const apiUrl = `/api/${path}`;

        this.getAll = (success, error) => $http.get(apiUrl).then(resp => success(resp.data), error);
        this.insert = (item, success, error) => $http.post(apiUrl, item).then(resp => success(resp.data), error);
        this.remove = (id, success, error) => $http.delete(`${apiUrl}/${id}`, success, error);
        
    }
    this.accounts = new genericApi('accounts');
    this.types = new genericApi('types');
    this.transactions = new genericApi('transactions');
};