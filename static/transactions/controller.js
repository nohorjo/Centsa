app.controller("transCtrl", function ($scope, $rootScope, centsa) {
	let sort = "DATE DESC, ID DESC";
	$scope.currentPage = 1;

	const loadTransactions = () => centsa.transactions.getAll({
		page: $scope.currentPage,
		pageSize: $scope.pageSize,
		sort: sort,
		filter: $rootScope.filter
	}, data => $scope.transactions = data);

	centsa.settings.get("trans.page.size", data => {
		$scope.pageSize = data;
		loadTransactions();
	});

	const countPages = () => centsa.transactions.countPages({
		pageSize: $scope.pageSize,
		filter: $rootScope.filter
	}, data => $scope.pagesCount = data);

	countPages();

	$scope.goToPage = n => {
		if ($scope.currentPage != ($scope.currentPage = n)) {
			loadTransactions();
		}
	};

	centsa.transactions.getSummary($rootScope.filter, data => $scope.transactionSummary = data);
	centsa.accounts.getAll(data => $scope.accounts = data);
	centsa.types.getAll(data => $scope.types = data);
	centsa.expenses.getAll(true, data => $scope.expenses = data);
	centsa.expenses.getAll(false, data => $scope.allExpenses = data);
	centsa.transactions.getUniqueComments(data => $scope.uniqueComments = data);

	$scope.newTrans = {
		amount: 0.0,
		comment: "",
		account_id: "1",
		type_id: "1",
		expense_id: "1",
		date: new Date().formatDate("yyyy/MM/dd")
	};

	let newTrans = Object.assign({}, $scope.newTrans);

	$scope.saveTrans = updating => {
		$scope.newTrans.date = new Date($scope.newTrans.date).getTime();
		$scope.newTrans.amount = Math.round($scope.newTrans.amount * 100);
		centsa.transactions.insert($scope.newTrans, newId => {
			countPages();
			if (newId > 0) {
				$scope.newTrans.id = newId;
				centsa.transactions.getSummary($rootScope.filter, data => $scope.transactionSummary = data);
			}
			if ($scope.currentPage == 1 && !updating) {
				$scope.transactions.unshift($scope.newTrans);
				if ($scope.transactions.length > $scope.pageSize) {
					$scope.transactions.pop();
				}
			} else if (updating) {
				for (let i = 0; i < $scope.transactions.length; i++) {
					if ($scope.transactions[i].id == $scope.newTrans.id) {
						$scope.transactions[i] = $scope.newTrans;
					}
				}
				$('#transModal').modal('hide');
			}
			$scope.newTrans = Object.assign({}, newTrans);
			$('.datepicker').datepicker("update", new Date().formatDate("yyyy/MM/dd"));
		});
	};

	$scope.editTrans = trans => {
		const t = Object.assign({}, trans);
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
			e => {
				$scope.newTrans = Object.assign({}, newTrans);
				$('.datepicker').datepicker("update",
					new Date().formatDate("yyyy/MM/dd"));
			})
	};

	$scope.initDatePickers = () => {
		$('.datepicker, .daterangepicker').datepicker({
			format: "yyyy/mm/dd",
			endDate: new Date(),
			todayBtn: "linked",
			autoclose: true,
			todayHighlight: true
		});
		$('.datepicker').datepicker("update",
			new Date().formatDate("yyyy/MM/dd"));
	};

	$scope.deleteTrans = id => {
		centsa.transactions.remove(id, () => {
			centsa.transactions.getSummary($rootScope.filter, data => $scope.transactionSummary = data);
			countPages();
			$scope.transactions.splice($scope.transactions.findIndex(t => t.id == id), 1);
			$('#transModal').modal("hide");
		});
	};

	$scope.sort = (() => {
		let lastCol;
		let asc = true;
		return (col, secondary) => {
			if (lastCol != col) {
				lastCol = col;
				asc = false;
			}
			sort = col + " " + ((asc = !asc) ? "ASC" : "DESC") + ", ID DESC"
				+ (secondary ? ", " + secondary : "");
			loadTransactions();
		};
	})();

	$scope.reloadTrans = () => {
		centsa.settings.set("trans.page.size", $scope.pageSize);
		countPages();
		$scope.currentPage = 1;
		loadTransactions();
		centsa.transactions.getSummary($rootScope.filter, data => $scope.transactionSummary = data);
	};

	$scope.clearFilter = () => {
		$rootScope.resetFilter();
		$scope.reloadTrans();
	};

	$scope.getExtraRows = () => $scope.pageSize > 100 ? 0 : $scope.pageSize - $scope.transactions.length;

	$scope.getHighlight = amount => {
		const range = amount < 0 ? $scope.transactionSummary.min : $scope.transactionSummary.max;
		return `hsl(${amount > 0 ? 0 : 100},50%,${100 - Math.abs(amount / range) * 40}%)`;
	}
});
