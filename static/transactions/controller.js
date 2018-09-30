app.controller("transCtrl", function($scope, $rootScope, centsa) {
    const DEFAULT_SORT = "date DESC, id DESC";
    $scope.tabs = [{
        index: 0,
        filter: $rootScope.filter,
        sort: $rootScope.filter.sort || DEFAULT_SORT
    }];
    $scope.currentTab = 0;

    $scope.newTrans = {
        amount: 0.0,
        comment: "",
        expense_id: null,
        date: new Date().formatDate("yyyy/MM/dd")
    };
    let newTrans = {...$scope.newTrans};
    centsa.settings.get("default.account").then(data => $scope.$apply(() => {
        $scope.newTrans.account_id = newTrans.account_id = data.toString();
    }));

    $scope.transactionSummary = {
        min: 0,
        max: 0
    };
    
    $scope.accounts = $scope.types 
        = $scope.expenses 
        = $scope.uniqueComments 
        = $scope.transactions 
        = [];

    centsa.transactions.getSummary($rootScope.filter).then(resp => $scope.transactionSummary = resp.data);
    centsa.accounts.getAll({light: true}).then(resp => $scope.accounts = resp.data);
    centsa.types.getAll({light: true}).then(resp => {
        $scope.types = resp.data;
        $scope.newTrans.type_id = newTrans.type_id = resp.data.find(a => a.name == "Other").id.toString();
    });
    centsa.expenses.getAll({light: true}).then(resp => $scope.expenses = resp.data);
    centsa.transactions.getUniqueComments().then(resp => $scope.uniqueComments = resp.data);

    $scope.saveTrans = updating => {
        console.log('saving', {updating});
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
            $scope.newTrans = {...newTrans};
            $('.datepicker').datepicker("update", new Date().formatDate("yyyy/MM/dd"));
        }).catch(() => {
            $('.datepicker').datepicker("update", $scope.newTrans.date);
        });
    };

    $scope.editTrans = trans => {
        const t = {...trans};
        delete t.firstOfWeek;
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
                $scope.newTrans = {...newTrans};
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
           $scope.tabs[$scope.currentTab].sort = col + " " + ((asc = !asc) ? "ASC" : "DESC") + ", id DESC" +
                (secondary ? ", " + secondary : "");
            $scope.reloadTrans();
        };
    })();

    $scope.reloadTrans = () => {
        console.log('reload transactions');
        $scope.tabs[$scope.currentTab].currentFilter = {...$rootScope.filter};
        $scope.currentPage = 1;
        $scope.moreToLoad = true;
        centsa.transactions.getAll({
            page: $scope.currentPage,
            pageSize: 40,
            sort: $scope.tabs[$scope.currentTab].sort,
            filter: $rootScope.filter
        }).then(resp => {
            $scope.currentPage = 2;
            $scope.transScrollTop();
            $scope.transactions = resp.data;
            $scope.moreToLoad = $scope.transactions.length == 40;
            setFirstOfWeeks();
        });
        centsa.transactions.getSummary($rootScope.filter).then(resp => $scope.transactionSummary = resp.data);
    };
    $scope.reloadTrans();

    $scope.clearFilter = () => {
        $rootScope.resetFilter();
        $scope.tabs[$scope.currentTab].filter = $rootScope.filter;
        $scope.reloadTrans();
    };

    $scope.getHighlight = amount => {
        const range = Math.abs(amount < 0 ? $scope.transactionSummary.min : $scope.transactionSummary.max);
        const lightness = 100 - Math.sqrt(range * range - Math.pow(Math.abs(amount) - range, 2)) / range * 40;
        return `hsl(${amount > 0 ? 0 : 100},50%,${lightness}%)`;
    };

    $scope.exportFilteredTransactions = () => {
        console.log('export');
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
        exportWorker.postMessage($scope.tabs[$scope.currentTab].currentFilter);
    };

    $scope.loadMoreTransactions = () => {
        console.log('load more');
        if ($scope.moreToLoad) {
            centsa.transactions.getAll({
                page: ++$scope.currentPage,
                pageSize: 20,
                sort: $scope.tabs[$scope.currentTab].sort,
                filter: $rootScope.filter
            }).then(resp => {
                $scope.transactions = $scope.transactions.concat(resp.data);
                $scope.moreToLoad = resp.data.length;
                setFirstOfWeeks();
            });
        }
    };

    $scope.transScrollTop = () => {
        console.log('scroll to top');
        $("#transDiv").animate({
            scrollTop: 0
        }, "fast");
    };

    $scope.autoFillFromExpense = expenseId => {
        if (expenseId) {
            console.log('auto fill');
            const expense = $scope.expenses.find(e => e.id == expenseId);
            const { newTrans } =  $scope;
            newTrans.type_id = expense.type_id.toString()
            newTrans.comment = expense.name;
        }
    };

    $scope.goToTab = index => {
        console.log('change tab', index);
        $scope.currentTab = index;
        $rootScope.filter = $scope.tabs[$scope.currentTab].filter;
        $scope.reloadTrans();
    };

    $scope.deleteTab = index => {
        if ($scope.tabs.length - 1) {
            console.log('delete tab');
            if ($scope.currentTab) $scope.currentTab--;
            $scope.tabs.splice(index, 1);
            $scope.goToTab($scope.currentTab);
        }
    };

    $scope.newTab = () => {
        console.log('new tab');
        const { tabs } = $scope;
        const last = tabs.slice(-1).pop();
        $rootScope.resetFilter();
        tabs.push({
            index: (last ? last.index : 0) + 1,
            filter: $rootScope.filter,
            sort: DEFAULT_SORT
        });
        $scope.currentTab = $scope.tabs.length - 1;
        $scope.reloadTrans();
    };

    $scope.hasFilterComments = () => $rootScope.filter.comments.some(c => c.comment);

    $scope.removeCommentFilter = index => $rootScope.filter.comments.splice(index, 1);

    $scope.addCommentFilter = () => $rootScope.filter.comments.push({comment: ""});

    function setFirstOfWeeks() {
        if (/^date/.test($scope.tabs[$scope.currentTab].sort)) {
            let nextMonday;
            $scope.transactions.concat()
                .sort((a, b) => new Date(a.date) - new Date(b.date))
                .forEach(t => {
                    const tDate = new Date(t.date);
                    if (!nextMonday || (tDate - nextMonday) >= 0) {
                        nextMonday = tDate;
                        nextMonday.setDate(nextMonday.getDate() + ((1 + 7 - nextMonday.getDay()) % 7 || 7));
                        t.firstOfWeek = true;
                    } else {
                        t.firstOfWeek = false;
                    }
            });
        }
    }
});
