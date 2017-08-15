function init() {
    var app = angular.module("trans", []);
    app.controller("ctrl", function ($scope, $http) {
        var transactions;
        var accounts=["ds"];
        var types;
        var expenses;

        function getExpenses() {
            $http({
                url: "/getExpenses.json",
                method: "GET"
            }).then(function (resp) {
                expenses = resp.data;

                $scope.transactions = transactions;
                $scope.accounts = accounts;
                $scope.types = types;
                $scope.expenses = expenses;
            });
        }

        function getTypes() {
            $http({
                url: "/getTypes.json",
                method: "GET"
            }).then(function (resp) {
                types = resp.data;
                getExpenses();
            });
        }

        function getAccounts() {
            $http({
                url: "/getAccounts.json",
                method: "GET"
            }).then(function (resp) {
                accounts = resp.data;
                getTypes();
            });
        }

        function getTrans() {
            $http({
                url: "/getTrans.json",
                method: "POST",
                data: JSON.stringify({
                    limit: 999,
                    offset: 0
                })
            }).then(function (resp) {
                transactions = resp.data;
                // add empty one for new transaction
                transactions.unshift({
                    date:new Date()
                });
                $(transactions).each(function () {
                    this.dateFormatted = new Date(this.date).formatDate("yyyy-MM-dd");
                });
                getAccounts();
            });
        }

        getTrans();
    });

}

function saveTransaction(row) {
    var trans = row.item;
    trans.date = Date.parse(row.item.dateFormatted.split("/").reverse());
    trans.id = top.centsa.transaction.save(trans);
    if (trans.id == -1) row.cancel = true;
}