app.controller("expensesCtrl", function($scope, $rootScope) {
	$scope.expenses = centsa.expenses.getAll(0, 0, "NAME ASC");
	$scope.totalActiveExpenses = centsa.expenses.totalActive();
	$scope.totalAutoExpenses = centsa.expenses.totalActive(true);

	$scope.newExpense = {
		name : "",
		cost : 0.0,
		frequency_days : 1,
		started : new Date().formatDate("yyyy/MM/dd"),
		ended : "",
		automatic : false
	};
	var newExpense = Object.assign({}, $scope.newExpense);

	$scope.saveExpense = function(updating) {
		$scope.newExpense.cost = Math.round($scope.newExpense.cost * 100);
		$scope.newExpense.started = new Date($scope.newExpense.started)
				.getTime();
		$scope.newExpense.ended = $scope.newExpense.ended ? new Date(
				$scope.newExpense.ended).getTime() : null;
		var newId = centsa.expenses.insert($scope.newExpense);
		if (updating) {
			for (var i = 0; i < $scope.expenses.length; i++) {
				if ($scope.expenses[i].id == $scope.newExpense.id) {
					$scope.expenses[i] = $scope.newExpense;
				}
			}
			$('#expenseModal').modal('hide');
		} else {
			$scope.newExpense.id = newId;
			$scope.expenses.unshift($scope.newExpense);
		}
		$scope.totalActiveExpenses = centsa.expenses.totalActive();
		$scope.totalAutoExpenses = centsa.expenses.totalActive(true);
		$scope.newExpense = Object.assign({}, newExpense);
		$('.datepicker[data-ng-model="newExpense.started"]').datepicker(
				"update", new Date().formatDate("yyyy/MM/dd"));
	};

	$scope.editExpense = function(e) {
		var e = Object.assign({}, e);
		e.started = $rootScope.formatDate(e.started);
		$('.datepicker[data-ng-model="newExpense.started"]').datepicker(
				"update", e.started);
		if (e.ended) {
			e.ended = $rootScope.formatDate(e.ended);
			$('.datepicker[data-ng-model="newExpense.ended"]').datepicker(
					"update", e.ended);
		} else {
			e.ended = "";
		}
		e.cost = e.cost / 100;
		$scope.newExpense = e;
		$('#expenseModal').modal("show");
		$('#expenseModal').on(
				'hidden.bs.modal',
				function(e) {
					$scope.newExpense = Object.assign({}, newExpense);
					$('.datepicker[data-ng-model="newExpense.started"]')
							.datepicker("update",
									new Date().formatDate("yyyy/MM/dd"));
				});
	};

	$scope.initDatePickers = function() {
		$('.datepicker').datepicker({
			format : "yyyy/mm/dd",
			todayBtn : "linked",
			autoclose : true,
			todayHighlight : true
		});
		$('.datepicker[data-ng-model="newExpense.started"]').datepicker(
				"update", new Date().formatDate("yyyy/MM/dd"));
	}

});