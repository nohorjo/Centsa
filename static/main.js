const app = angular.module('app', ['ngRoute', 'ngCookies', 'ngAnimate']);

app.controller('mainCtrl', function ($scope, $rootScope, $location, $cookies, $timeout, centsa) {
    $rootScope.name = $cookies.get('name');
    $scope.currentUser = $cookies.get('currentUser') || '-1';
    $scope.controllees = [];
    $rootScope.notifications = [];
    $rootScope.currency = {
        symbol: '£',
        prepend: true,
    };

    $rootScope.formatDate = date => {
        if (date.constructor == String) {
            date = date.substr(0, 19);
        }
        return new Date(date).formatDate('yyyy/MM/dd');
    };

    $rootScope.sort = (() => {
        let lastProp;
        let asc = true;
        return (prop, arr, cb) => {
            if (lastProp != prop) {
                lastProp = prop;
                asc = false;
            }
            asc = !asc;
            arr.sort((p1, p2) => {
                if (prop) {
                    p1 = p1[prop];
                    p2 = p2[prop];
                }
                var comp;
                if (p1.constructor == String) {
                    comp = p1.localeCompare(p2);
                } else {
                    comp = p1 - p2;
                }
                return comp * (asc ? 1 : -1);
            });
            if (cb) cb();
        };
    })();

    /**
     * Used to filter transactions. Available in the rootscope so that other
     * pages can set it if needed
     */
    $rootScope.resetFilter = () => {
        console.log('reset filter');
        $rootScope.filter = {
            account_id: '0',
            type_id: '0',
            expense_id: '0',
            comments: [{comment:''}],
            regex: false
        };
        $rootScope.showFilter = false;
    };
    $rootScope.resetFilter();
    $rootScope.showFilter = false;

    $rootScope.setFilter = f => {
        console.log('filter', f);
        $rootScope.showFilter = true;
        $rootScope.filter = {
            comments:[{comment:''}],
            ...f
        };
        $location.path('transactions');
        $timeout(() => $rootScope.showFilter = false, 1000);
    };

    $rootScope.applyCurrency = v => `${v < 0 ? '-' : ''}${$rootScope.currency.prepend ? $rootScope.currency.symbol : ''}${Math.abs(v)}${$rootScope.currency.prepend ? '' : $rootScope.currency.symbol}`;

    $scope.isActive = path => $location.path() == path;
    
    $scope.switchUser = () => centsa.general.switchUser($scope.currentUser).then(() => window.location.reload());

    $scope.$on('$routeChangeStart', () => { 
        delete $rootScope.onScrollBottom;
    });

    centsa.general.controllees().then(resp => $scope.controllees = resp.data);

    !function checkNotifications() {
        centsa.general.getNotifications().then(({data}) => {
            $rootScope.notifications = data;
            setTimeout(checkNotifications, 3.6e6);
        });
    }();

    centsa.settings.get('currency').then(data => {
        if (data) {
            $scope.$apply(() => {
                $rootScope.currency = JSON.parse(data);
            });
        }
    });

});

app.filter('prop', () => {
    return function (input, prop, value) {
        return input.filter(e => e[prop] == value);
    };
});

app.directive('fileModel', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        link: function ($scope, $elem, $attrs) {
            const model = $parse($attrs.fileModel);
            const modelSetter = model.assign;

            $elem.bind('change', () => {
                $scope.$apply(() => {
                    modelSetter($scope, $elem[0].files[0]);
                });
            });
        }
    };
}]);

app.directive('numberDivide', () => ({
    require: 'ngModel',
    link: ($scope, $elem, $attrs, $controller) => {
        $controller.$formatters.push(val => val && val / $attrs.numberDivide);
        $controller.$parsers.push(val => val && val * $attrs.numberDivide);
    }
}));

app.directive('scrollBottom', () => ({
    restrict: 'A',
    link: function ($scope, $elem, $attrs) {
        var raw = $elem[0];
        $elem.bind('scroll', () => {
            if (raw.scrollTop + raw.offsetHeight >= raw.scrollHeight - 10) {
                $scope.$apply($attrs.scrollBottom);
            }
        });
    }
}));

$(document).ready(() => {
    let timer;
    function checkInactivity() {
        console.log('reset activity timout');
        clearTimeout(timer);
        timer = setTimeout(() => window.location.reload(),  3.6e6);
    }
    $(window).click(checkInactivity);
});
