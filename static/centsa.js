const centsa = function ($http) {
    class baseApi {
        constructor(path) { this.apiUrl = `/api/${path}`; }
        getAll() { return $http.get(this.apiUrl); }
        insert(item) { return $http.post(this.apiUrl, item); }
    }
    class genericApi extends baseApi {
        constructor(path) { super(path); }
        remove(id) { return $http.delete(`${this.apiUrl}/${id}`); }
    }
    class expensesApi extends genericApi {
        constructor() { super('expenses'); }
        getAll(activeOnly) { return $http.get(this.apiUrl, { params: { activeOnly: activeOnly } }); }
        totalActive(incAuto) { return $http.get(`${this.apiUrl}/total`, { params: { auto: incAuto } }); }
    }
    class transactionsApi extends genericApi {
        constructor() { super('transactions'); }
        getAll(options) { return $http.get(this.apiUrl, { params: options }); }
        getCumulativeSums() { return $http.get(`${this.apiUrl}/cumulativeSums`); }
        getSummary(filter) { return $http.get(`${this.apiUrl}/summary`, { params: { filter: filter } }); }
        getUniqueComments() { return $http.get(`${this.apiUrl}/comments`); }
    }

    this.accounts = new baseApi('accounts');
    this.types = new genericApi('types');
    this.transactions = new transactionsApi();
    this.expenses = new expensesApi();
    this.settings = (() => {
        const apiUrl = '/api/settings';
        let _settings;
        return {
            get(key) {
                return new Promise((resolve, reject) => {
                    if (!_settings) {
                        $http.get(apiUrl).then(resp => {
                            _settings = resp.data;
                            resolve(_settings[key]);
                        }, reject);
                    } else {
                        resolve(_settings[key]);
                    }
                });
            },
            set(key, value) {
                _settings[key] = value;
                return $http.post(apiUrl, { key: key, value: value });
            }
        };
    })();
    this.general = (() => {
        const apiUrl = '/api/general';
        return {
            budget(isStrictMode) { return $http.get(`${apiUrl}/budget`, { params: { strict: isStrictMode } }); },
            rules() { return $http.get(`${apiUrl}/rules`); },
            rule(id) { return $http.get(`${apiUrl}/rule/${id}`); },
            saveRule(name, script) { return $http.post(`${apiUrl}/rule/${name}`, { script: script }); }, 
            controllees() { return $http.get(`${apiUrl}/controllees`); }, 
            switchUser(id) { return $http.get(`${apiUrl}/switchUser/${id}`); }, 
            controllers() { return $http.get(`${apiUrl}/controllers`); }, 
            addController(email) { return $http.post(`${apiUrl}/controllers`, {email}); },
            deleteController(email) { return $http.delete(`${apiUrl}/controllers/${encodeURIComponent(email)}`); }
        };
    })();

};
if (typeof app == "object") {
    app.factory('httpInterceptor', function ($q) {
        return {
            'request': function (config) {
                config.headers = Object.assign({ 'x-date': Date() }, config.headers);
                return config;
            },
            'responseError': function (rejection) {
                swal("Error", JSON.stringify(rejection.data).replace(/(^"|"$)/g,''), "error");
                return $q.reject(rejection);
            }
        };
    }).config(["$httpProvider", function ($httpProvider) {
        $httpProvider.interceptors.push('httpInterceptor');
    }]).service('centsa', centsa);
}
