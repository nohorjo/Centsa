app.controller("transCtrl", function ($scope, $rootScope, centsa) {
	let sort = "date DESC, id DESC";
	$scope.currentPage = 1;
	$scope.pageSize = "15";

	let currentFilter = Object.assign({}, $rootScope.filter);

	const loadTransactions = () => centsa.transactions.getAll({
		page: $scope.currentPage,
		pageSize: $scope.pageSize,
		sort: sort,
		filter: $rootScope.filter
	}).then(resp => $scope.transactions = resp.data);

	centsa.settings.get("trans.page.size").then(data => {
		$scope.pageSize = data;
		loadTransactions();
	});

	const countPages = () => centsa.transactions.countPages({
		pageSize: $scope.pageSize,
		filter: $rootScope.filter
	}).then(resp => $scope.pagesCount = resp.data);

	countPages();

	$scope.goToPage = n => {
		if ($scope.currentPage != ($scope.currentPage = n)) {
			loadTransactions();
		}
	};

	$scope.newTrans = {
		amount: 0.0,
		comment: "",
		expense_id: null,
		date: new Date().formatDate("yyyy/MM/dd")
	};
	let newTrans = Object.assign({}, $scope.newTrans);
	centsa.settings.get("default.account").then(data => $scope.newTrans.account_id = newTrans.account_id = data.toString());

	$scope.transactionSummary = {
		min: 0,
		max: 0
	};
	$scope.accounts = $scope.types = $scope.expenses = $scope.allExpenses = $scope.uniqueComments = $scope.transactions = [];
	centsa.transactions.getSummary($rootScope.filter).then(resp => $scope.transactionSummary = resp.data);
	centsa.accounts.getAll().then(resp => $scope.accounts = resp.data);
	centsa.types.getAll().then(resp => {
		$scope.types = resp.data;
		$scope.newTrans.type_id = newTrans.type_id = resp.data.find(a => a.name == "Other").id.toString();
	});
	centsa.expenses.getAll(true).then(resp => $scope.expenses = resp.data);
	centsa.expenses.getAll(false).then(resp => $scope.allExpenses = resp.data);
	centsa.transactions.getUniqueComments().then(resp => $scope.uniqueComments = resp.data);

	$scope.saveTrans = updating => {
		$scope.newTrans.date = new Date($scope.newTrans.date);
		centsa.transactions.insert($scope.newTrans).then(resp => {
			countPages();
			if (resp.data > 0) {
				$scope.newTrans.id = resp.data;
				centsa.transactions.getSummary($rootScope.filter).then(resp => $scope.transactionSummary = resp.data);
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
				$('#transModal').appendTo(".content").modal('hide');
			}
			$scope.newTrans = Object.assign({}, newTrans);
			$('.datepicker').datepicker("update", new Date().formatDate("yyyy/MM/dd"));
		});
	};

	$scope.editTrans = trans => {
		const t = Object.assign({}, trans);
		t.date = $rootScope.formatDate(t.date);
		$('.datepicker').datepicker("update", t.date);
		t.account_id = t.account_id.toString();
		t.type_id = t.type_id.toString();
		t.expense_id = t.expense_id && t.expense_id.toString();
		$scope.newTrans = t;
		$('#transModal').appendTo("body").modal("show");
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

	$scope.deleteTrans = async id => {
		const result = await swal({
			title: "Are you sure?",
			text: "Once deleted, you will not be able to recover this transaction!",
			type: "warning",
			showCancelButton: true,
			confirmButtonColor: '#d33',
			cancelButtonColor: '#3085d6',
			confirmButtonText: 'Yes, delete it!'
		});
		if (result.value) {
			centsa.transactions.remove(id).then(() => {
				centsa.transactions.getSummary($rootScope.filter).then(resp => $scope.transactionSummary = resp.data);
				countPages();
				$scope.transactions.splice($scope.transactions.findIndex(t => t.id == id), 1);
				$('#transModal').appendTo(".content").modal("hide");
			});
		}
	};

	$scope.sort = (() => {
		let lastCol;
		let asc = true;
		return (col, secondary) => {
			if (lastCol != col) {
				lastCol = col;
				asc = false;
			}
			sort = col + " " + ((asc = !asc) ? "ASC" : "DESC") + ", id DESC" +
				(secondary ? ", " + secondary : "");
			loadTransactions();
		};
	})();

	$scope.reloadTrans = () => {
		currentFilter = Object.assign({}, $rootScope.filter);
		centsa.settings.set("trans.page.size", $scope.pageSize);
		countPages();
		$scope.currentPage = 1;
		loadTransactions();
		centsa.transactions.getSummary($rootScope.filter).then(resp => $scope.transactionSummary = resp.data);
	};

	$scope.clearFilter = () => {
		$rootScope.resetFilter();
		$scope.reloadTrans();
	};

	$scope.getExtraRows = () => $scope.pageSize > 100 ? 0 : $scope.pageSize - $scope.transactions.length;

	$scope.getHighlight = amount => {
		const range = amount < 0 ? $scope.transactionSummary.min : $scope.transactionSummary.max;
		return `hsl(${amount > 0 ? 0 : 100},50%,${100 - Math.abs(amount / range) * 40}%)`;
	};

	$scope.exportFilteredTransactions = () => {
		const exportWorker = new Worker("/workers/exportWorker.js");
		exportWorker.addEventListener('message', e => {
			var element = document.createElement('a');
			element.setAttribute('href', `data:text/csv;charset=utf-8,${encodeURIComponent(e.data)}`);
			element.setAttribute('download', `export_${new Date().formatDate('yyyy-MM-dd@HH-mm-ss')}.csv`);
			element.style.display = 'none';
			document.body.appendChild(element);
			element.click();
			document.body.removeChild(element);
		});
		exportWorker.postMessage(currentFilter);
	};

	$scope.loadMoreTransactions = () => alert("Unimplemented");

});