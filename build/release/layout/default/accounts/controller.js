app.controller("accountsCtrl", function($scope) {
	$scope.accounts = centsa.accounts.getAll(0, 0, "NAME ASC");

	$scope.newAccount = {
		name : ""
	};
	var newAccount = Object.assign({}, $scope.newAccount);

	$scope.transfer = {
		date : new Date().formatDate("yyyy/MM/dd"),
		to : "1",
		from : "1",
		ammount : 0,
		comment : ""
	};
	var transfer = Object.assign({}, $scope.transfer);

	$scope.saveAccount = function() {
		$scope.newAccount.id = centsa.accounts.insert($scope.newAccount);
		$scope.newAccount.balance = 0;
		$scope.accounts.unshift($scope.newAccount);
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

	$('.datepicker').datepicker({
		format : "yyyy/mm/dd",
		endDate : new Date(),
		todayBtn : "linked",
		autoclose : true,
		todayHighlight : true
	});
	$('.datepicker').datepicker("update", new Date().formatDate("yyyy/MM/dd"));
});