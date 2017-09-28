app.config(function($routeProvider) {
	$routeProvider.when("/transaction", {
		templateUrl : "transaction/view.html",
		controller : "transCtrl"
	}).otherwise({
		redirectTo : '/transaction'
	});
});