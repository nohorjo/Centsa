app.controller("accountsCtrl", function($scope) {
	$scope.accounts = centsa.accounts.getAll(0, 0, "NAME ASC");

	$scope.newAccount = {
		name : "",
		balance : 0
	};
	var newAccount = Object.assign({}, $scope.newAccount);

	$scope.transfer = {
		date : new Date().formatDate("yyyy/MM/dd"),
		to : "1",
		from : "1",
		amount : 0,
		comment : ""
	};
	var transfer = Object.assign({}, $scope.transfer);

    $scope.saveAccount = function() {
        $scope.newAccount.balance *= 100;
        $scope.newAccount.id = centsa.accounts.insert($scope.newAccount);
        $scope.accounts.unshift($scope.newAccount);
        if($scope.newAccount.balance) {
            centsa.transactions.insert({
                amount : -$scope.newAccount.balance,
                comment : "Initial value",
                account_id : $scope.newAccount.id,
                type_id : "1",
                expense_id : "1",
                date : new Date().getTime()
            });
        }
        $scope.newAccount = Object.assign({}, newAccount);
    };

	/**
	 * Inserts two transactions to represent money going from one account to
	 * another
	 */
	$scope.transferFunds = function() {
		var from = {
			amount : $scope.transfer.amount * 100,
			comment : $scope.transfer.comment,
			account_id : $scope.transfer.from,
			type_id : "1",
			expense_id : "1",
			date : new Date($scope.transfer.date).getTime()
		};
		var to = {
			amount : -$scope.transfer.amount * 100,
			comment : $scope.transfer.comment,
			account_id : $scope.transfer.to,
			type_id : "1",
			expense_id : "1",
			date : new Date($scope.transfer.date).getTime()
		};
		centsa.transactions.insert(from);
		centsa.transactions.insert(to);
		// Reload accounts
		$scope.accounts = centsa.accounts.getAll(0, 0, "NAME ASC");
		$scope.transfer = Object.assign({}, transfer);
		$('.datepicker').datepicker("update",
				new Date().formatDate("yyyy/MM/dd"));
	};

	$scope.sumAccountBalances = function() {
		var sum = 0;
		$($scope.accounts).each(function() {
			sum += this.balance;
		});
		return sum / 100;
	};

	$('.datepicker').datepicker({
		format : "yyyy/mm/dd",
		endDate : new Date(),
		todayBtn : "linked",
		autoclose : true,
		todayHighlight : true
	});
	$('.datepicker').datepicker("update", new Date().formatDate("yyyy/MM/dd"));

	$scope.adjustAccount = function(acc) {
	    var diff = acc.balanceOld-acc.balance;
	    if(diff) {
            centsa.transactions.insert({
                amount : diff,
                comment : "Adjustment",
                account_id : acc.id,
                type_id : "1",
                expense_id : "1",
                date : new Date().getTime()
            });
            acc.balanceOld = acc.balance;
	    }
	}
});

app.directive("numberDivide", function ($filter, $parse) {
    return {
        require: "ngModel",
        link: function($scope, $elem, $attrs, $controller){
            $controller.$formatters.push(function (val) {
                return val/$attrs.numberDivide;
            });
            $controller.$parsers.push(function(val){
                return val*$attrs.numberDivide;
            });
        }
    };
});