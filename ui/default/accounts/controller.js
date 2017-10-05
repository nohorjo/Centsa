app.controller("accountsCtrl", function($scope) {
	$scope.accounts = centsa.accounts.getAll(0, 0, "NAME ASC");

	$scope.newAccount = {
		name : ""
	};
	var newAccount = Object.assign({}, $scope.newAccount);

	$scope.saveAccount = function() {
		$scope.newAccount.id = centsa.accounts.insert($scope.newAccount);
		$scope.accounts.unshift($scope.newAccount);
		$scope.newAccount = Object.assign({}, newAccount);
	};
});