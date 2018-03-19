app.controller("accountsCtrl", function ($scope, centsa) {
	$scope.accounts = [];
	let otherType = null;
	centsa.accounts.getAll().then(resp => $scope.accounts = resp.data);
	centsa.types.getAll().then(resp => otherType = resp.data.find(t => t.name == 'Other').id);
	$scope.defaultAccountId = "";

	centsa.settings.get("default.account").then(data => $scope.defaultAccountId = data.toString());

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
		centsa.accounts.insert($scope.newAccount).then(resp => {
			$scope.newAccount.id = resp.data;
			$scope.accounts.unshift($scope.newAccount);
			if ($scope.newAccount.balance) {
				centsa.transactions.insert({
					amount: -$scope.newAccount.balance,
					comment: "Initial value",
					account_id: $scope.newAccount.id,
					type_id: "1",
					expense_id: null,
					date: new Date()
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
		const amount = $scope.transfer.amount;
		const from = {
			amount: amount,
			comment: $scope.transfer.comment,
			account_id: $scope.transfer.from,
			type_id: otherType,
			expense_id: null,
			date: new Date($scope.transfer.date)
		};
		const to = {
			amount: -amount,
			comment: $scope.transfer.comment,
			account_id: $scope.transfer.to,
			type_id: otherType,
			expense_id: null,
			date: new Date($scope.transfer.date)
		};
		centsa.transactions.insert(from);
		centsa.transactions.insert(to);
		$scope.accounts.find(a => a.id == $scope.transfer.from).balance -= amount;
		$scope.accounts.find(a => a.id == $scope.transfer.to).balance += amount;
		$scope.transfer = Object.assign({}, transfer);
		$('.datepicker').datepicker("update", new Date().formatDate("yyyy/MM/dd"));
	};

	$scope.sumAccountBalances = () => $scope.accounts.reduce((a, b) => ({
		balance: a.balance + b.balance
	}), {
			balance: 0
		}).balance / 100;

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
				type_id: otherType,
				expense_id: null,
				date: new Date()
			}).then(() => acc.balanceOld = acc.balance);
		}
	}

	$scope.setDefaultAccount = id => centsa.settings.set("default.account", id);

});
