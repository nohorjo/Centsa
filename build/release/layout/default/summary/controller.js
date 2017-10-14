app.controller("summaryCtrl", function($scope) {
	$scope.budget = centsa.general.budget();
	$scope.rules = centsa.general.rules();
	$scope.rule = $scope.rules[0];

	$scope.importFile = function() {
		centsa.general.importFile($scope.rule);
	}
});