app.controller("transCtrl", function($scope, $rootScope) {
	function getFilter() {
		var filter = Object.assign({}, $rootScope.filter);

		if ($rootScope.filter.fromDate) {
			filter.fromDate = new Date($rootScope.filter.fromDate).getTime();
		} else {
			delete filter.fromDate;
		}
		if ($rootScope.filter.toDate) {
			filter.toDate = new Date($rootScope.filter.toDate).getTime();
		} else {
			delete filter.toDate;
		}
		if ($rootScope.filter.fromAmount) {
			filter.fromAmount = $rootScope.filter.fromAmount * 100;
		} else if($rootScope.filter.fromAmount == null) {
		    delete filter.fromAmount;
		}
		if ($rootScope.filter.toAmount) {
			filter.toAmount = $rootScope.filter.toAmount * 100;
		} else if($rootScope.filter.toAmount == null) {
            delete filter.toAmount;
        }

		return filter;
	}

	$scope.currentPage = 1;
	var pageSize = 15;

	$scope.pagesCount = 0;

	$scope.countPages = function() {
		return $scope.pagesCount
				|| ($scope.pagesCount = centsa.transactions.countPages(
						pageSize, null, getFilter()));
	};

	var sort = "DATE DESC, ID DESC";

	$scope.goToPage = function(n) {
		if ($scope.currentPage != ($scope.currentPage = n)) {
			$scope.transactions = centsa.transactions.getAll(
					$scope.currentPage, pageSize, sort, null, getFilter());
		}
	};

	$scope.transactions = centsa.transactions.getAll($scope.currentPage,
			pageSize, sort, null, getFilter());
	$scope.transactionSummary = centsa.transactions.getSummary(getFilter());
	$scope.accounts = centsa.accounts.getAll(0, 0, "NAME ASC");
	$scope.types = centsa.types.getAll(0, 0, "NAME ASC");
	$scope.expenses = centsa.expenses.getActive(0, 0, "NAME ASC");
	$scope.allExpenses = centsa.expenses.getAll(0, 0, "NAME ASC");
	$scope.uniqueComments = centsa.transactions.getUniqueComments();

	$scope.showDataList = false;

	$scope.setComment = function(c) {
		$scope.showDataList = false;
		$scope.newTrans.comment = c;
	};

	$scope.navigateDataList = (function() {

		var index = -1;
		var dataListItems;

		return function($event) {

			var temp = $(".datalist:first span");
			dataListItems = temp.length > 0 ? temp : (dataListItems || temp);

			switch ($event.keyCode) {
			case 38:
				if (index > 0) {
					index--;
				}
				break;
			case 40:
				if (index < dataListItems.length - 1) {
					index++;
				}
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
			$(".datalist").each(function() {
				var dataListItems = $(this).find("span");
				dataListItems.removeClass("hover");
				$(dataListItems[index]).addClass("hover");
				$(dataListItems[index]).focus();
			});
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

	$scope.saveTrans = function(updating) {
		$scope.pagesCount = 0;
		$scope.newTrans.date = new Date($scope.newTrans.date).getTime();
		$scope.newTrans.amount = Math.round($scope.newTrans.amount * 100);
		var newId = centsa.transactions.insert($scope.newTrans);
		if (newId > 0) {
			$scope.newTrans.id = newId;
			$scope.transactionSummary = centsa.transactions.getSummary(getFilter());
		}
		if ($scope.currentPage == 1 && !updating) {
			$scope.transactions.unshift($scope.newTrans);
			if ($scope.transactions.length > pageSize) {
				$scope.transactions.pop();
			}
		} else if (updating) {
			for (var i = 0; i < $scope.transactions.length; i++) {
				if ($scope.transactions[i].id == $scope.newTrans.id) {
					$scope.transactions[i] = $scope.newTrans;
				}
			}
			$('#transModal').modal('hide');
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

	$scope.editTrans = function(trans) {
		var t = Object.assign({}, trans);
		t.date = $rootScope.formatDate(t.date);
		$('.datepicker').datepicker("update", t.date);
		t.amount = t.amount / 100;
		t.account_id = t.account_id.toString();
		t.type_id = t.type_id.toString();
		t.expense_id = t.expense_id.toString();
		$scope.newTrans = t;
		$('#transModal').modal("show");
		$('#transModal').on(
				'hidden.bs.modal',
				function(e) {
					$scope.newTrans = Object.assign({}, newTrans);
					$('.datepicker').datepicker("update",
							new Date().formatDate("yyyy/MM/dd"));
				})
	};

	$scope.initDatePickers = function() {
		$('.datepicker, .daterangepicker').datepicker({
			format : "yyyy/mm/dd",
			endDate : new Date(),
			todayBtn : "linked",
			autoclose : true,
			todayHighlight : true
		});
		$('.datepicker').datepicker("update",
				new Date().formatDate("yyyy/MM/dd"));
	};

	$scope.deleteTrans = function(id) {
		$scope.pagesCount = 0;
		if (centsa.transactions.remove(id)) {
			$scope.transactions = centsa.transactions.getAll(
					$scope.currentPage, pageSize, sort, null, getFilter());
			$scope.transactionSummary = centsa.transactions.getSummary(getFilter());
		}
		$('#transModal').modal("hide");
	};

	$scope.sort = (function() {
		var lastCol;
		var asc = true;
		return function(col, secondary) {
			if (lastCol != col) {
				lastCol = col;
				asc = false;
			}
			sort = col + " " + ((asc = !asc) ? "ASC" : "DESC") + ", ID DESC"
					+ (secondary ? ", " + secondary : "");
			$scope.transactions = centsa.transactions.getAll(
					$scope.currentPage, pageSize, sort, null, getFilter());
		};
	})();

	$scope.filterTrans = function() {
		$scope.transactions = centsa.transactions.getAll($scope.currentPage,
				pageSize, sort, null, getFilter());
		$scope.currentPage = 1;
		$scope.pagesCount = centsa.transactions.countPages(pageSize, null,
				getFilter());
		$scope.transactionSummary = centsa.transactions.getSummary(getFilter());
	};

	$scope.clearFilter = function() {
		$rootScope.resetFilter();
		$scope.filterTrans();
	};

	$scope.getExtraRows = function() {
		return pageSize - $scope.transactions.length;
	};

	$scope.getHighlight = function(amount){
	    var range = amount < 0 ? $scope.transactionSummary.min : $scope.transactionSummary.max;

        var hl = "hsl(";
        hl += amount > 0 ? 0 : 100;
        hl += ",50%,";
        hl += 100 - Math.abs(amount / range) * 40;
        hl += "%)";

        return hl;
    }
});
