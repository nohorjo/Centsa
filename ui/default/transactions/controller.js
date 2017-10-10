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
					$scope.currentPage, pageSize, "DATE DESC, ID DESC");
		}
	};

	$scope.transactions = centsa.transactions.getAll($scope.currentPage,
			pageSize, "DATE DESC, ID DESC");
	$scope.accounts = centsa.accounts.getAll(0, 0);
	$scope.types = centsa.types.getAll(0, 0);
	$scope.expenses = centsa.expenses.getAll(0, 0);
	$scope.uniqueComments = centsa.transactions.getUniqueComments();

	$scope.showDataList = false;

	$scope.setComment = function(c) {
		$scope.showDataList = false;
		$scope.newTrans.comment = c;
	};

	$scope.closeDataList = function() {
		setTimeout(function() {
			if (!$rootScope.isActive('.datalist *')) {
				$scope.showDataList = false;
				$scope.$apply();
			}
		}, 200);
	};

	$scope.navigateDataList = (function() {

		var index = -1;
		var dataListItems;

		return function($event) {

			var temp = $(".datalist span");
			dataListItems = temp.length > 0 ? temp : (dataListItems || temp);
			dataListItems.removeClass("hover");

			switch ($event.keyCode) {
			case 38:
				if (index > 0) {
					index--;
				}
				$(dataListItems[index]).addClass("hover");
				$(dataListItems[index]).focus();
				break;
			case 40:
				if (index < dataListItems.length - 1) {
					index++;
				}
				$(dataListItems[index]).addClass("hover");
				$(dataListItems[index]).focus();
				break;
			case 9:
			case 13:
				if (index != -1) {
					$scope.setComment(dataListItems[index].innerText.trim());
				}
			default:
				index = -1;
				break;
			}
		}
	})();

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
		$scope.newTrans.date = new Date($scope.newTrans.date).getTime();
		$scope.newTrans.amount = $scope.newTrans.amount * 100;
		$scope.newTrans.id = centsa.transactions.insert($scope.newTrans);
		if ($scope.currentPage == 1) {
			$scope.transactions.unshift($scope.newTrans);
			if ($scope.transactions.length > pageSize) {
				$scope.transactions.pop();
			}
		}
		$scope.newTrans = Object.assign({}, newTrans);
		$('.datepicker').datepicker("update",
				new Date().formatDate("yyyy/MM/dd"));
	};

	$scope.getFromArray = function(arr, id) {
		return arr.filter(function(item) {
			return item.id == id;
		})[0];
	};

	$('.datepicker').datepicker({
		format : "yyyy/mm/dd",
		endDate : new Date(),
		todayBtn : "linked",
		autoclose : true,
		todayHighlight : true
	});

});
