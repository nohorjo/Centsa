const centsa = function ($http) {
    class baseApi {
        constructor(path) { this.apiUrl = `/api/${path}`; }
        getAll(params) {
            console.log(this.constructor.name, 'getAll', params);
            return $http.get(this.apiUrl, { params });
        }
        insert(item) {
            console.log(this.constructor.name, 'insert', item);
            return $http.post(this.apiUrl, item);
        }
    }
    class genericApi extends baseApi {
        constructor(path) { super(path); }
        remove(id) {
            console.log(this.constructor.name, 'remove', id);
            return $http.delete(`${this.apiUrl}/${id}`);
        }
    }
    class expensesApi extends genericApi {
        constructor() { super('expenses'); }
        totalActive(incAuto) {
            console.log(this.constructor.name, 'totalActive', incAuto);
            return $http.get(`${this.apiUrl}/total`, { params: { auto: incAuto } });
        }
    }
    class transactionsApi extends genericApi {
        constructor() { super('transactions'); }
        getCumulativeSums() {
            console.log(this.constructor.name, 'getCumulativeSums');
            return $http.get(`${this.apiUrl}/cumulativeSums`);
        }
        getSummary(filter) {
            console.log(this.constructor.name, 'getSummary', filter);
            return $http.get(`${this.apiUrl}/summary`, { params: { filter: filter } });
        }
        getUniqueComments() {
            console.log(this.constructor.name, 'getUniqueComments');
            return $http.get(`${this.apiUrl}/comments`);
        }
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
                        console.log('loading settings');
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
                console.log('saving setting', key, value);
                _settings[key] = value;
                return $http.post(apiUrl, { key: key, value: value });
            }
        };
    })();
    this.general = (() => {
        const apiUrl = '/api/general';
        return {
            budget(budgetMode) {
                console.log('get budget', budgetMode);
                return $http.get(`${apiUrl}/budget`, { params: { budgetMode } });
            },
            rules() {
                console.log('get rules meta');
                return $http.get(`${apiUrl}/rules`);
            },
            rule(id) {
                console.log('get rule', id);
                return $http.get(`${apiUrl}/rule/${id}`);
            },
            saveRule(name, script) {
                console.log('save rule', name);
                return $http.post(`${apiUrl}/rule/${name}`, { script: script });
            }, 
            controllees() {
                console.log('get controllees');
                return $http.get(`${apiUrl}/controllees`);
            }, 
            switchUser(id) {
                console.log('switch user', id);
                return $http.get(`${apiUrl}/switchUser/${id}`);
            }, 
            controllers() {
                console.log('get controllers');
                return $http.get(`${apiUrl}/controllers`);
            }, 
            addController(email) {
                console.log('add controller', email);
                return $http.post(`${apiUrl}/controllers`, {email});
            },
            deleteController(email) {
                console.log('delete controller', email);
                return $http.delete(`${apiUrl}/controllers/${encodeURIComponent(email)}`);
            },
            getNotifications() {
                console.log('getting notifications');
                return $http.get(`${apiUrl}/notifications`);
            },
            deleteNotification(id) {
                console.log('deleting notification', id);
                return $http.delete(`${apiUrl}/notifications/${id}`);
            },
            readNotifications() {
                console.log('update read notifications');
                return $http.get(`${apiUrl}/notifications/update`);
            }
        };
    })();

};
if (typeof app == "object") {
    app.factory('httpInterceptor', function ($q) {
        return {
            'request': function (config) {
                config.headers = {'x-date': Date(), ...config.headers};
                return config;
            },
            'responseError': function (rejection) {
                swal(
                    "Error",
                    JSON.stringify(rejection.data).replace(/(^"|"$)/g,''),
                    "error"
                ).then(() => {
                    if(rejection.status == 401) window.location.pathname = '/index.html';
                });
                return $q.reject(rejection);
            }
        };
    }).config(["$httpProvider", function ($httpProvider) {
        $httpProvider.interceptors.push('httpInterceptor');
    }]).service('centsa', centsa);
}
