app.config(function($routeProvider) {
	$routeProvider.when("/summary", {
		templateUrl : "summary/view.html",
		controller : "summaryCtrl"
	}).when("/transactions", {
		templateUrl : "transactions/view.html",
		controller : "transCtrl"
	}).when("/accounts", {
		templateUrl : "accounts/view.html",
		controller : "accountsCtrl"
	}).when("/types", {
		templateUrl : "types/view.html",
		controller : "typesCtrl"
	}).when("/expenses", {
		templateUrl : "expenses/view.html",
		controller : "expensesCtrl"
	}).otherwise({
		redirectTo : '/summary'
	});
});