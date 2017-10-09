app.controller("expensesCtrl", function($scope, $rootScope) {
	$scope.expenses = centsa.expenses.getAll(0, 0, "NAME ASC");

	$scope.newExpense = {
		name : "",
		cost : 0.0,
		frequency_days : 1,
		started : new Date().formatDate("yyyy/MM/dd"),
		ended : "",
		automatic : false
	};
	var newExpense = Object.assign({}, $scope.newExpense);

	$scope.saveExpense = function() {
		$scope.newExpense.cost = $scope.newExpense.cost * 100;
		$scope.newExpense.started = new Date($scope.newExpense.started)
				.getTime();
		$scope.newExpense.ended = $scope.newExpense.ended ? new Date(
				$scope.newExpense.ended).getTime() : null;
		$scope.newExpense.id = centsa.expenses.insert($scope.newExpense);
		$scope.expenses.unshift($scope.newExpense);
		$scope.newExpense = Object.assign({}, newExpense);
		$('.datepicker[data-ng-model="newExpense.started"]').datepicker(
				"update", new Date().formatDate("yyyy/MM/dd"));
	};

	$('.datepicker').datepicker({
		format : "yyyy/mm/dd",
		todayBtn : "linked",
		autoclose : true,
		todayHighlight : true
	});

});