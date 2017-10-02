app.controller("transCtrl", function($scope) {
	$scope.transactions = centsa.transactions.getAll(0, 0, "ID DESC");
	$scope.accounts = centsa.accounts.getAll(0, 0);
	$scope.types = centsa.types.getAll(0, 0);
	$scope.expenses = centsa.expenses.getAll(0, 0);

	$scope.formatDate = function(date) {
		date = new Date(date);
		return (date.getYear() + 1900) + "/" + (date.getMonth() + 1) + "/"
				+ date.getDate();
	}

	$scope.newTrans = {
		amount : 0.0,
		comment : "",
		accountId : 1,
		typeId : 1,
		expenseId : 1,
		date : $scope.formatDate(new Date().getTime())
	};

	var newTrans = Object.assign({}, $scope.newTrans);

	$scope.saveTrans = function() {
		$scope.newTrans.date = new Date($scope.newTrans.date);
		$scope.newTrans.id = centsa.transactions.insert($scope.newTrans);
		$scope.transactions.unshift($scope.newTrans);
		$scope.newTrans = Object.assign({}, newTrans);
	}

});
