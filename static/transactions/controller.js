app.controller("transCtrl", function($scope, $rootScope, centsa) {
    let currentFilter = Object.assign({}, $rootScope.filter);

    let sort = currentFilter.sort || "date DESC, id DESC";

    $scope.newTrans = {
        amount: 0.0,
        comment: "",
        expense_id: null,
        date: new Date().formatDate("yyyy/MM/dd")
    };
    let newTrans = Object.assign({}, $scope.newTrans);
    centsa.settings.get("default.account").then(data => $scope.newTrans.account_id = newTrans.account_id = data.toString());

    $scope.transactionSummary = {
        min: 0,
        max: 0
    };
    $scope.accounts = $scope.types = $scope.expenses = $scope.allExpenses = $scope.uniqueComments = $scope.transactions = [];
    centsa.transactions.getSummary($rootScope.filter).then(resp => $scope.transactionSummary = resp.data);
    centsa.accounts.getAll().then(resp => $scope.accounts = resp.data);
    centsa.types.getAll().then(resp => {
        $scope.types = resp.data;
        $scope.newTrans.type_id = newTrans.type_id = resp.data.find(a => a.name == "Other").id.toString();
    });
    centsa.expenses.getAll(true).then(resp => $scope.expenses = resp.data);
    centsa.expenses.getAll(false).then(resp => $scope.allExpenses = resp.data);
    centsa.transactions.getUniqueComments().then(resp => $scope.uniqueComments = resp.data);

    $scope.saveTrans = updating => {
        $scope.newTrans.date = new Date($scope.newTrans.date);
        $scope.newTrans.date.setHours(12);
        centsa.transactions.insert($scope.newTrans).then(resp => {
            if(!$scope.uniqueComments.includes($scope.newTrans.comment)) {
                $scope.uniqueComments.push($scope.newTrans.comment);
            }
            if (resp.data > 0) {
                $scope.newTrans.id = resp.data;
                centsa.transactions.getSummary($rootScope.filter).then(resp => $scope.transactionSummary = resp.data);
            }
            if (!updating) {
                $scope.transactions.unshift($scope.newTrans);
            } else if (updating) {
                for (let i = 0; i < $scope.transactions.length; i++) {
                    if ($scope.transactions[i].id == $scope.newTrans.id) {
                        $scope.transactions[i] = $scope.newTrans;
                    }
                }
                $('#transModal').appendTo(".content").modal('hide');
            }
            $scope.newTrans = Object.assign({}, newTrans);
            $('.datepicker').datepicker("update", new Date().formatDate("yyyy/MM/dd"));
        });
    };

    $scope.editTrans = trans => {
        const t = Object.assign({}, trans);
        t.date = $rootScope.formatDate(t.date);
        $('.datepicker').datepicker("update", t.date);
        t.account_id = t.account_id.toString();
        t.type_id = t.type_id.toString();
        t.expense_id = t.expense_id && t.expense_id.toString();
        $scope.newTrans = t;
        $('#transModal').appendTo("body").modal("show");
        $('#transModal').on(
            'hidden.bs.modal',
            e => {
                $scope.newTrans = Object.assign({}, newTrans);
                $('.datepicker').datepicker("update",
                    new Date().formatDate("yyyy/MM/dd"));
            })
    };

    $scope.initDatePickers = () => {
        $('.datepicker, .daterangepicker').datepicker({
            format: "yyyy/mm/dd",
            endDate: new Date(),
            todayBtn: "linked",
            autoclose: true,
            todayHighlight: true
        });
        $('.datepicker').datepicker("update",
            new Date().formatDate("yyyy/MM/dd"));
    };

    $scope.deleteTrans = async id => {
        const result = await swal({
            title: "Are you sure?",
            text: "Once deleted, you will not be able to recover this transaction!",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        });
        if (result.value) {
            centsa.transactions.remove(id).then(() => {
                centsa.transactions.getSummary($rootScope.filter).then(resp => $scope.transactionSummary = resp.data);
                $scope.transactions.splice($scope.transactions.findIndex(t => t.id == id), 1);
                $('#transModal').appendTo(".content").modal("hide");
            });
        }
    };

    $scope.sort = (() => {
        let lastCol;
        let asc = true;
        return (col, secondary) => {
            if (lastCol != col) {
                lastCol = col;
                asc = false;
            }
            sort = col + " " + ((asc = !asc) ? "ASC" : "DESC") + ", id DESC" +
                (secondary ? ", " + secondary : "");
            $scope.reloadTrans();
        };
    })();

    $scope.reloadTrans = () => {
        currentFilter = Object.assign({}, $rootScope.filter);
        $scope.currentPage = 1;
        $scope.moreToLoad = true;
        centsa.transactions.getAll({
            page: $scope.currentPage,
            pageSize: 40,
            sort: sort,
            filter: $rootScope.filter
        }).then(resp => {
            $scope.currentPage = 2;
            $scope.transScrollTop();
            $scope.transactions = resp.data;
            $scope.moreToLoad = $scope.transactions.length == 40;
        });
        centsa.transactions.getSummary($rootScope.filter).then(resp => $scope.transactionSummary = resp.data);
    };
    $scope.reloadTrans();

    $scope.clearFilter = () => {
        $rootScope.resetFilter();
        $scope.reloadTrans();
    };

    $scope.getHighlight = amount => {
        const range = Math.abs(amount < 0 ? $scope.transactionSummary.min : $scope.transactionSummary.max);
        const lightness = 100 - Math.sqrt(range * range - Math.pow(Math.abs(amount) - range, 2)) / range * 40;
        return `hsl(${amount > 0 ? 0 : 100},50%,${lightness}%)`;
    };

    $scope.exportFilteredTransactions = () => {
        const exportWorker = new Worker("/workers/exportWorker.js");
        exportWorker.addEventListener('message', e => {
            var element = document.createElement('a');
            element.setAttribute('href', `data:text/csv;charset=utf-8,${encodeURIComponent(e.data)}`);
            element.setAttribute('download', `export_${new Date().formatDate('yyyy-MM-dd@HH-mm-ss')}.csv`);
            element.style.display = 'none';
            document.body.appendChild(element);
            element.click();
            document.body.removeChild(element);
        });
        exportWorker.postMessage(currentFilter);
    };

    $scope.loadMoreTransactions = () => {
        if ($scope.moreToLoad) {
            centsa.transactions.getAll({
                page: ++$scope.currentPage,
                pageSize: 20,
                sort: sort,
                filter: $rootScope.filter
            }).then(resp => {
                $scope.transactions = $scope.transactions.concat(resp.data);
                $scope.moreToLoad = resp.data.length;
            });
        }
    };

    $scope.transScrollTop = () => {
        $("#transDiv").animate({
            scrollTop: 0
        }, "fast");
    };

});
