app.controller("expensesCtrl", function ($scope, $rootScope, $sce, centsa) {
    $scope.trust = $sce.trustAsHtml;
    $scope.expenses = $scope.types = $scope.accounts = [];
    centsa.expenses.getAll().then(resp => $scope.expenses = resp.data);
    centsa.accounts.getAll({light: true}).then(resp => $scope.accounts = resp.data);
    centsa.types.getAll({light: true}).then(resp => $scope.types = resp.data);

    $scope.frequency = {
        type: "basic",
        last: false,
        date: 0,
        day: "MO",
        month: "0"
    };


    const getActiveTotals = () => {
        console.log('get totals');
        centsa.expenses.totalActive(false).then(resp => $scope.totalActiveExpenses = resp.data);
        centsa.expenses.totalActive(true).then(resp => $scope.totalAutoExpenses = resp.data);
    }

    getActiveTotals();

    $scope.newExpense = {
        name: "",
        cost: 0.0,
        frequency: "",
        started: new Date().formatDate("yyyy/MM/dd"),
        automatic: false,
        account_id: "",
        type_id: "1"
    };
    let newExpense = {...$scope.newExpense};

    $scope.saveExpense = () => {
        $scope.newExpense.started = new Date($scope.newExpense.started);
        $scope.newExpense.started.setHours(12);
        if (!$scope.newExpense.account_id) {
            delete $scope.newExpense.account_id;
        }
        centsa.expenses.insert($scope.newExpense).then(resp => {
            $scope.newExpense.id = resp.data;
            $scope.expenses.unshift($scope.newExpense);
            getActiveTotals();
            $scope.newExpense = {...newExpense};
            $('.datepicker[data-ng-model="newExpense.started"]').datepicker("update", new Date().formatDate("yyyy/MM/dd"));
        });
    };

    $scope.deleteExpense = async id => {
        const result = await swal({
            title: "Are you sure?",
            text: "Once deleted, you will not be able to recover this expense!",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        });
        if(result.value) {
            centsa.expenses.remove(id).then(() => {
                $scope.expenses.splice($scope.expenses.findIndex(e => e.id == id), 1);
                getActiveTotals();
            });
        }
    };


    $scope.getMaxDaysInMonth = () => {
        switch ($scope.frequency.month) {
            case '0': case '1': case '3': case '5': case '7': case '8': case '10': case '12':
                return 31;
            case '4': case '6': case '9': case '11':
                return 30;
            case '2':
                return 29;
        }
    };

    $scope.calculateNumberSuperscript = n => {
        n = Math.abs(n);
        if (n > 10 && n < 20) {
            return "th";
        }
        switch (n % 10) {
            case 1: return "st";
            case 2: return "nd";
            case 3: return "rd";
            default: return "th"
        }
    };

    $scope.getDateMax = (() => {
        let max;
        return (newMax, apply) => apply ? max = newMax : max;
    })();

    $scope.frequencyDisplayText = freq => {
        if (!freq) return;
        let text;
        if (/^\d+$/.test(freq)) {
            text = "Every " + freq + " day" + (freq == 1 ? "" : "s");
        } else {
            text = "On the ";
            if (/^DATE \d+(\/\d+)?$/.test(freq)) {
                var date = freq.split(" ")[1];

                if (date.indexOf("/") != -1) {
                    date = date.split("/");
                    text += date[0] + "<sup>" + $scope.calculateNumberSuperscript(date[0])
                        + "</sup> of the " + date[1] + "<sup>"
                        + $scope.calculateNumberSuperscript(date[1]) + "</sup>";
                } else {
                    text += date + "<sup>" + $scope.calculateNumberSuperscript(date) + "</sup>";
                }
            } else if (/^DAY -?\d+$/.test(freq)) {
                freq = freq.split(" ")[1];
                text += Math.abs(freq) + "<sup>" + $scope.calculateNumberSuperscript(freq) + "</sup>"
                    + (freq < 0 ? " last " : " ") + "day of the month";
            } else if (/^DAY (MO|TU|WE|TH|FR|SA|SU) -?\d+$/.test(freq)) {
                var day = (d => {
                    switch (d) {
                        case "MO": return "Monday";
                        case "TU": return "Tuesday";
                        case "WE": return "Wednesday";
                        case "TH": return "Thursday";
                        case "FR": return "Friday";
                        case "SA": return "Saturday";
                        case "SU": return "Sunday";
                    }
                })(freq.substr(4, 2));
                freq = freq.substr(7);
                text += Math.abs(freq) + "<sup>" + $scope.calculateNumberSuperscript(freq) + "</sup>"
                    + (freq < 0 ? " last " : " ") + day + " of the month";
            } else if (/^[RW]DAY -?\d+$/.test(freq)) {
                const type = freq.charAt(0) == "R" ? "rest" : "working";
                freq = freq.substr(5);
                text += Math.abs(freq) + "<sup>" + $scope.calculateNumberSuperscript(freq) + "</sup>"
                    + (freq < 0 ? " last " : " ") + type + "-day of the month";
            } else { text = "ERROR: " + freq; }
        }
        return text;
    };


    $('.datepicker').datepicker({
        format: "yyyy/mm/dd",
        todayBtn: "linked",
        autoclose: true,
        todayHighlight: true
    });
    $('.datepicker[data-ng-model="newExpense.started"]').datepicker("update", new Date().formatDate("yyyy/MM/dd"));

    $('.dropdown-menu').click(e => e.stopPropagation());

    $('.dropdown-menu').mouseout(() => $scope.$apply(() => {
        try {
            if ($scope.frequency.date == 0) {
                throw "Invalid date";
            }
            switch ($scope.frequency.type) {
                case "basic":
                    $scope.newExpense.frequency = $scope.frequency.date;
                    break;
                case "date":
                    $scope.newExpense.frequency = "DATE " + $scope.frequency.date
                        + (parseInt($scope.frequency.month) ? "/" + $scope.frequency.month : "");
                    break;
                case "day":
                    $scope.newExpense.frequency = "DAY " + $scope.frequency.day + " ";
                    if ($scope.frequency.last) {
                        $scope.newExpense.frequency += "-";
                    } else if ($scope.frequency.date == $scope.getDateMax()) {
                        throw "Invalid date";
                    }
                    $scope.newExpense.frequency += $scope.frequency.date;
                    break;
                case "monthday":
                    $scope.newExpense.frequency = "DAY ";
                    if ($scope.frequency.last) {
                        $scope.newExpense.frequency += "-";
                    } else if ($scope.frequency.date == $scope.getDateMax()) {
                        throw "Invalid date";
                    }
                    $scope.newExpense.frequency += $scope.frequency.date;
                    break;
                case "workday":
                    $scope.newExpense.frequency = "WDAY ";
                    if ($scope.frequency.last) {
                        $scope.newExpense.frequency += "-";
                    } else if ($scope.frequency.date == $scope.getDateMax()) {
                        throw "Invalid date";
                    }
                    $scope.newExpense.frequency += $scope.frequency.date;
                    break;
                case "restday":
                    $scope.newExpense.frequency = "RDAY ";
                    if ($scope.frequency.last) {
                        $scope.newExpense.frequency += "-";
                    } else if ($scope.frequency.date == $scope.getDateMax()) {
                        throw "Invalid date";
                    }
                    $scope.newExpense.frequency += $scope.frequency.date;
                    break;
            }
        } catch (e) {
            console.error(e);
            $scope.newExpense.frequency = "";
        }
    }));
    
    $scope.changeFrequencyType = $event => $scope.frequency.type = $event.target.querySelectorAll('input[type="radio"]')[0].value;

    $scope.saveGoal = async () => {
        const cost = Math.ceil($scope.goal.amount / ((new Date($scope.goal.by) - Date.now()) / 8.64e7));
        if (cost <= 0) {
            await swal({
                title: "Invalid date or amount",
                text: "Amount must be greater than zero and date must be in the future",
                type: 'error'
            });
            return;
        }
        if (cost > -$scope.totalActiveExpenses) {
           const { value } = await swal({
                title: "Insufficient income",
                text: `Your total daily income is ${-Math.round($scope.totalActiveExpenses) / 100}
                        but this will cost you ${cost / 100} daily.
                        Do you still want to add it?`,
                type: "warning", 
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Yes'
            });
            if (!value) return;
        }
        const expense = {
            automatic: false,
            cost,
            frequency: 1,
            name: `Saving ${$scope.goal.by}: ${$scope.goal.name}`,
            started: new Date(),
            type_id: $scope.types.find(t => t.name == "Other").id
        };
        centsa.expenses.insert(expense).then(({data}) => {
            expense.id = data;
            $scope.expenses.push(expense);
            getActiveTotals();
            $scope.goal = {};
            $('form[name="GoalForm"] .datepicker').datepicker('clearDates');
        });
    };
});
