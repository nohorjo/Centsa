app.controller("typesCtrl", function($scope) {
	$scope.types = centsa.types.getAll(0, 0, "NAME ASC");

	$scope.newType = {
		name : ""
	};
	var newType = Object.assign({}, $scope.newType);

	$scope.saveType = function() {
		$scope.newType.id = centsa.types.insert($scope.newType);
		$scope.types.unshift($scope.newType);
		$scope.newType = Object.assign({}, newType);
	};
});