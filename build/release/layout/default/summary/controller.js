app.controller("summaryCtrl", function($scope) {
	$scope.budget = centsa.general.budget();
	$scope.rules = centsa.general.rules();
	$scope.rule = "default";

	$scope.importFile = function() {
		alert("Importing may take a while");
		centsa.general.importFile($scope.rule);
	}
});