// register the interceptor as a service
app.factory('myHttpInterceptor', function ($q) {
    return {
        'responseError': function (rejection) {
            // do something on error
            if (canRecover(rejection)) {
                return responseOrNewPromise
            }
            return $q.reject(rejection);
        }
    };
});


const centsa = function ($http, $httpProvider) {
    $httpProvider.interceptors.push('myHttpInterceptor');
    const headers = h => Object.assign({ 'x-date': Date().toString() }, h);
    class baseApi {
        constructor(path) { this.apiUrl = `/api/${path}`; }
        getAll() { return $http.get(this.apiUrl); }
        insert(item) { return $http.post(this.apiUrl, item, { headers: headers() }); }
    }
    class genericApi extends baseApi {
        constructor(path) { super(path); }
        remove(id) { return $http.delete(`${this.apiUrl}/${id}`); }
    }
    class expensesApi extends genericApi {
        constructor() { super('expenses'); }
        getAll(activeOnly) { return $http.get(this.apiUrl, { params: { activeOnly: activeOnly } }); }
        totalActive(incAuto) {
            return $http.get(`${this.apiUrl}/total`, {
                headers: headers(),
                params: { auto: incAuto }
            });
        }
    }
    class transactionsApi extends genericApi {
        constructor() { super('transactions'); }
        getAll(options) {
            return $http.get(this.apiUrl, {
                headers: headers(),
                params: options
            });
        }
        getCumulativeSums() { return $http.get(`${this.apiUrl}/cumulativeSums`); }
        countPages(options) {
            return $http.get(`${this.apiUrl}/countPages`, {
                headers: headers(), params: options
            });
        }
        getSummary(filter) {
            return $http.get(`${this.apiUrl}/summary`, {
                headers: headers(),
                params: { filter: filter }
            });
        }
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
            budget(isStrictMode) {
                return $http.get(`${apiUrl}/budget`, {
                    headers: headers(),
                    params: { strict: isStrictMode }
                });
            },
            rules() { return $http.get(`${apiUrl}/rules`); },
            rule(id) { return $http.get(`${apiUrl}/rule/${id}`); }
        };
    })();

};
if (typeof app == "object") {
    app.service('centsa', centsa);
}