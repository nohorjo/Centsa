app.controller("typesCtrl", function ($scope, centsa) {
	$scope.types = [];
	centsa.types.getAll().then(resp => {
		$scope.types = resp.data;
		drawPie();
	});

	$scope.newType = {
		name: ""
	};
	var newType = Object.assign({}, $scope.newType);

	$scope.saveType = () => centsa.types.insert($scope.newType).then(resp => {
		$scope.newType.id = resp.data;
		$scope.newType.sum = 0;
		$scope.types.unshift($scope.newType);
		$scope.newType = Object.assign({}, newType);
		drawPie();
	});

	$scope.deleteType = id => centsa.types.remove(id).this(() => {
		$scope.types.splice($scope.types.findIndex(t => t.id == id), 1);
		drawPie();
	});

	const drawPie = () => {
		AmCharts.makeChart("types-chart", {
			type: "pie",
			theme: "light",
			dataProvider: $scope.types.map(t => ({
				name: t.name,
				sum: t.sum / 100
			})),
			valueField: "sum",
			titleField: "name",
			balloon: {
				fixedPosition: true
			}
		});
	}

});