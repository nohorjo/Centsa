app.controller("expensesCtrl", function($scope, $rootScope) {
	$scope.expenses = centsa.expenses.getAll(0, 0, "NAME ASC");

	function getActiveTotals() {
		$scope.totalActiveExpenses = centsa.expenses.totalActive();
		$scope.totalAutoExpenses = centsa.expenses.totalActive(true);
	}
	
	getActiveTotals();

	$scope.newExpense = {
		name : "",
		cost : 0.0,
		frequency : 1,
		started : new Date().formatDate("yyyy/MM/dd"),
		automatic : false
	};
	var newExpense = Object.assign({}, $scope.newExpense);

	$scope.saveExpense = function(updating) {
		$scope.newExpense.cost = Math.round($scope.newExpense.cost * 100);
		$scope.newExpense.started = new Date($scope.newExpense.started)
				.getTime();
		var newId = centsa.expenses.insert($scope.newExpense);
		if (updating) {
			for (var i = 0; i < $scope.expenses.length; i++) {
				if ($scope.expenses[i].id == $scope.newExpense.id) {
					$scope.expenses[i] = $scope.newExpense;
				}
			}
		} else {
			$scope.newExpense.id = newId;
			$scope.expenses.unshift($scope.newExpense);
		}
		getActiveTotals();
		$scope.newExpense = Object.assign({}, newExpense);
		$('.datepicker[data-ng-model="newExpense.started"]').datepicker(
				"update", new Date().formatDate("yyyy/MM/dd"));
	};

	$scope.getNow = function() {
		return Date.now();
	};

	$scope.deleteExpense = function(id) {
		if (centsa.expenses.remove(id)) {
			$scope.expenses = centsa.expenses.getAll(0, 0, "NAME ASC");
			getActiveTotals();
		}
	};

	(function() {
		$('.datepicker').datepicker({
			format : "yyyy/mm/dd",
			todayBtn : "linked",
			autoclose : true,
			todayHighlight : true
		});
		$('.datepicker[data-ng-model="newExpense.started"]').datepicker(
				"update", new Date().formatDate("yyyy/MM/dd"));
	})();

});