app.controller("summaryCtrl", function($scope) {
	$scope.budget = centsa.general.budget();
	$scope.rules = centsa.general.rules();
	$scope.rule = "default";

	$scope.importProgress = {
		processed : 0,
		total : 1
	};

	$scope.importFile = function() {
		$('#progressModal').modal({
			backdrop : 'static',
			keyboard : false
		});
		centsa.general.importFile($scope.rule);

		var i = setInterval((function() {
			var started = false;
			return function() {
				var p = centsa.general.importProgress();
				if (p) {
					started = true;
					$scope.$apply(function() {
						$scope.importProgress = p;
					});
				} else if (started) {
					clearInterval(i);
					$('#progressModal').modal("hide");
				}
			}
		})(), 1000);
	};

	$scope.getProgressPercentage = function() {
		return parseInt($scope.importProgress.processed * 10000
				/ $scope.importProgress.total)/100;
	}
});