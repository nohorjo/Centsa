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
		drawPie();
	};

	$scope.deleteType = function(id) {
		if (centsa.types.remove(id)) {
			$scope.types = centsa.types.getAll(0, 0, "SUM DESC");
			drawPie();
		}
	};

	function drawPie() {
		var data = [];
		$($scope.types).each(function() {
			if (this.sum >= 0) {
				data.push({
					name : this.name,
					sum : this.sum / 100
				});
			}
		});
		AmCharts.makeChart("types-chart", {
			"type" : "pie",
			"theme" : "light",
			"dataProvider" : data,
			"valueField" : "sum",
			"titleField" : "name",
			"balloon" : {
				"fixedPosition" : true
			}
		});
	}

	drawPie();
});