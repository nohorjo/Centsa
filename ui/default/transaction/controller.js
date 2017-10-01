app.controller("transCtrl", function($scope) {
	$scope.transactions = centsa.transactions.getAll(0, 0);
	$scope.accounts = centsa.accounts.getAll(0, 0);
	$scope.types = centsa.types.getAll(0, 0);
	$scope.expenses = centsa.expenses.getAll(0, 0);

	$scope.newTrans = {
		amount : 0.0,
		comment : "",
		accountId : 1,
		typeId : 1,
		expenseId : 1,
		date : new Date()
	};

	var newTrans = Object.assign({}, $scope.newTrans);

	$scope.saveTrans = function() {
		centsa.transactions.insert($scope.newTrans);
		$scope.newTrans = Object.assign({}, newTrans);
	}

});