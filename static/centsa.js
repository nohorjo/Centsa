const centsa = function ($http) {
    class baseApi {
        constructor(path) { this.apiUrl = `/api/${path}`; }
        getAll(params) {
            console.log(this.constructor.name, 'getAll', params);
            return $http.get(this.apiUrl, { params }).then(({data}) => data);
        }
        insert(item) {
            console.log(this.constructor.name, 'insert', item);
            return $http.post(this.apiUrl, item).then(({data}) => data);
        }
    }
    class genericApi extends baseApi {
        constructor(path) { super(path); }
        remove(id) {
            console.log(this.constructor.name, 'remove', id);
            return $http.delete(`${this.apiUrl}/${id}`).then(({data}) => data);
        }
    }
    class expensesApi extends genericApi {
        constructor() { super('expenses'); }
        totalActive(incAuto) {
            console.log(this.constructor.name, 'totalActive', incAuto);
            return $http.get(`${this.apiUrl}/total`, { params: { auto: incAuto } }).then(({data}) => data);
        }
    }
    class transactionsApi extends genericApi {
        constructor() { super('transactions'); }
        getCumulativeSums() {
            console.log(this.constructor.name, 'getCumulativeSums');
            return $http.get(`${this.apiUrl}/cumulativeSums`).then(({data}) => data);
        }
        getSummary(filter) {
            console.log(this.constructor.name, 'getSummary', filter);
            return $http.get(`${this.apiUrl}/summary`, { params: { filter: filter } }).then(({data}) => data);
        }
        getUniqueComments() {
            console.log(this.constructor.name, 'getUniqueComments');
            return $http.get(`${this.apiUrl}/comments`).then(({data}) => data);
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
                return $http.post(apiUrl, { key: key, value: value }).then(({data}) => data);
            }
        };
    })();
    this.general = (() => {
        const apiUrl = '/api/general';
        return {
            budget(budgetMode) {
                console.log('get budget', budgetMode);
                return $http.get(`${apiUrl}/budget`, { params: { budgetMode } }).then(({data}) => data);
            },
            rules() {
                console.log('get rules meta');
                return $http.get(`${apiUrl}/rules`).then(({data}) => data);
            },
            rule(id) {
                console.log('get rule', id);
                return $http.get(`${apiUrl}/rule/${id}`).then(({data}) => data);
            },
            saveRule(name, script) {
                console.log('save rule', name);
                return $http.post(`${apiUrl}/rule/${name}`, { script: script }).then(({data}) => data);
            }, 
            controllees() {
                console.log('get controllees');
                return $http.get(`${apiUrl}/controllees`).then(({data}) => data);
            }, 
            switchUser(id) {
                console.log('switch user', id);
                return $http.get(`${apiUrl}/switchUser/${id}`).then(({data}) => data);
            }, 
            controllers() {
                console.log('get controllers');
                return $http.get(`${apiUrl}/controllers`).then(({data}) => data);
            }, 
            addController(email) {
                console.log('add controller', email);
                return $http.post(`${apiUrl}/controllers`, {email}).then(({data}) => data);
            },
            deleteController(email) {
                console.log('delete controller', email);
                return $http.delete(`${apiUrl}/controllers/${encodeURIComponent(email)}`).then(({data}) => data);
            },
            getNotifications() {
                console.log('getting notifications');
                return $http.get(`${apiUrl}/notifications`).then(({data}) => data.map(x => ({...x, is_read:!!x.is_read})));
            },
            deleteNotification(id) {
                console.log('deleting notification', id);
                return $http.delete(`${apiUrl}/notifications/${id}`).then(({data}) => data);
            },
            readNotifications() {
                console.log('update read notifications');
                return $http.get(`${apiUrl}/notifications/update`).then(({data}) => data);
            },
            deleteUser() {
                console.log('deleting user');
                return $http.delete(`${apiUrl}/deleteUser`).then(({data}) => data);
            },
            updatePassword(password) {
                console.log('updating password', password);
                return $http.post(`${apiUrl}/password`, password).then(({data}) => data);
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
