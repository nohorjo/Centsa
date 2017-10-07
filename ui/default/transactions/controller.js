app.controller("transCtrl", function($scope, $rootScope) {
	$scope.currentPage = 1;
	var pageSize = 15;

	$scope.pagesCount = 0;

	$scope.countPages = function() {
		return $scope.pagesCount
				|| ($scope.pagesCount = centsa.transactions
						.countPages(pageSize));
	};
	
	$scope.goToPage = function(n) {
		if ($scope.currentPage != ($scope.currentPage = n)) {
			$scope.transactions = centsa.transactions.getAll(
					$scope.currentPage, pageSize);
		}
	};

	$scope.transactions = centsa.transactions.getAll($scope.currentPage,
			pageSize, "ID DESC");
	$scope.accounts = centsa.accounts.getAll(0, 0);
	$scope.types = centsa.types.getAll(0, 0);
	$scope.expenses = centsa.expenses.getAll(0, 0);

	$scope.newTrans = {
		amount : 0.0,
		comment : "",
		account_id : "1",
		type_id : "1",
		expense_id : "1",
		date : new Date().formatDate("yyyy/MM/dd")
	};

	var newTrans = Object.assign({}, $scope.newTrans);

	$scope.saveTrans = function() {
		$scope.pagesCount = 0;
		$scope.newTrans.date = new Date($scope.newTrans.date);
		$scope.newTrans.amount = $scope.newTrans.amount * 100;
		$scope.newTrans.id = centsa.transactions.insert($scope.newTrans);
		if ($scope.currentPage == 1) {
			$scope.transactions.unshift($scope.newTrans);
		}
		$scope.newTrans = Object.assign({}, newTrans);
		$('.datepicker').datepicker("update", new Date());
	};

	$scope.getFromArray = function(arr, id) {
		return arr.filter(function(item) {
			return item.id == id;
		})[0];
	};

	$('.datepicker').datepicker({
		format : "yyyy/mm/dd",
		endDate : "+1s",
		todayBtn : "linked",
		autoclose : true,
		todayHighlight : true
	});

});
