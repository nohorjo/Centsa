app.controller("typesCtrl", function($scope) {
	$scope.types = centsa.types.getAll(0, 0, "SUM DESC");

	$scope.newType = {
		name : ""
	};
	var newType = Object.assign({}, $scope.newType);

	$scope.saveType = function() {
		$scope.newType.id = centsa.types.insert($scope.newType);
		$scope.newType.sum = 0;
		$scope.types.unshift($scope.newType);
		$scope.newType = Object.assign({}, newType);
	};
});