app.controller("summaryCtrl", function($scope) {
	$scope.budget = centsa.general.budget();
	$scope.rules = centsa.general.rules();
	$scope.rule = "default";

	$scope.importProgress = "";

	$scope.importFile = function() {
		centsa.general.importFile($scope.rule);

		var i = setInterval((function() {
			var started = false;
			return function() {
				var p = centsa.general.importProgress();
				if (p) {
					started = true;
					$scope.$apply(function() {
						$scope.importProgress = p.processed + "/" + p.total;
					});
				} else if (started) {
					clearInterval(i);
					$scope.$apply(function() {
						$scope.importProgress = "";
					});
				}
			}
		})(), 1000);
	}
});