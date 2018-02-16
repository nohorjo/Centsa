app.controller("accountsCtrl", ($scope, centsa) => {
	loadAccounts();

	$scope.newAccount = {
		name: "",
		balance: 0
	};
	let newAccount = Object.assign({}, $scope.newAccount);

	$scope.transfer = {
		date: new Date().formatDate("yyyy/MM/dd"),
		to: "1",
		from: "1",
		amount: 0,
		comment: ""
	};
	let transfer = Object.assign({}, $scope.transfer);

	$scope.saveAccount = () => {
		$scope.newAccount.balance *= 100;
		centsa.accounts.insert($scope.newAccount, id => {
			$scope.newAccount.id = id;
			$scope.accounts.unshift($scope.newAccount);
			if ($scope.newAccount.balance) {
				centsa.transactions.insert({
					amount: -$scope.newAccount.balance,
					comment: "Initial value",
					account_id: $scope.newAccount.id,
					type_id: "1",
					expense_id: "1",
					date: new Date().getTime()
				});
			}
			$scope.newAccount = Object.assign({}, newAccount);
		});
	};

	/**
	 * Inserts two transactions to represent money going from one account to
	 * another
	 */
	$scope.transferFunds = () => {
		const amount = $scope.transfer.amount * 100;
		const from = {
			amount: amount,
			comment: $scope.transfer.comment,
			account_id: $scope.transfer.from,
			type_id: "1",
			expense_id: "1",
			date: new Date($scope.transfer.date).getTime()
		};
		const to = {
			amount: -amount,
			comment: $scope.transfer.comment,
			account_id: $scope.transfer.to,
			type_id: "1",
			expense_id: "1",
			date: new Date($scope.transfer.date).getTime()
		};
		centsa.transactions.insert(from);
		centsa.transactions.insert(to);
		$scope.accounts.find(a => a.id == $scope.transfer.from).balance -= amount;
		$scope.accounts.find(a => a.id == $scope.transfer.to).balance += amount;
		$scope.transfer = Object.assign({}, transfer);
		$('.datepicker').datepicker("update", new Date().formatDate("yyyy/MM/dd"));
	};

	$scope.sumAccountBalances = () => $scope.accounts.reduce((a, b) => a + b, 0) / 100;

	$('.datepicker').datepicker({
		format: "yyyy/mm/dd",
		endDate: new Date(),
		todayBtn: "linked",
		autoclose: true,
		todayHighlight: true
	});
	$('.datepicker').datepicker("update", new Date().formatDate("yyyy/MM/dd"));

	$scope.adjustAccount = acc => {
		const diff = acc.balanceOld - acc.balance;
		if (diff) {
			centsa.transactions.insert({
				amount: diff,
				comment: "Adjustment",
				account_id: acc.id,
				type_id: "1",
				expense_id: "1",
				date: new Date().getTime()
			}, () => acc.balanceOld = acc.balance);
		}
	}

	const loadAccounts = () => centsa.accounts.getAll(data => $scope.accounts = data);
});

app.directive("numberDivide", ($filter, $parse) => ({
	require: "ngModel",
	link: ($scope, $elem, $attrs, $controller) => {
		$controller.$formatters.push(val => val / $attrs.numberDivide);
		$controller.$parsers.push(val => val * $attrs.numberDivide);
	}
}));