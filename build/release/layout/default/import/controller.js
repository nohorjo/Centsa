app.controller("importCtrl", function($scope) {
	$scope.rules = centsa.general.rules();
	$scope.rule = "default";

	$scope.importProgress = {
		processed : 0,
		total : 1
	};

	/**
	 * Opens file chooser to start importing a CSV. Then displays a progress bar
	 * modal blocking the use of the UI so as to not overwhelm the database.
	 */
	$scope.importFile = (function() {
		var i = null;
		return function() {
			if (i) {
				clearInterval(i);
			}
			centsa.general.importFile($scope.rule);

			i = setInterval((function() {
				var started = false;
				return function() {
					var p = centsa.general.importProgress();
					if (p) {
						$('#progressModal').modal({
							backdrop : 'static',
							keyboard : false
						});
						started = true;
						$scope.$apply(function() {
							$scope.importProgress = p;
						});
					} else if (started) {
						clearInterval(i);
						$('#progressModal').modal("hide");
					}
				};
			})(), 200);
		};
	})();

	$scope.getProgressPercentage = function(extra) {
		return $rootScope.roundTo($scope.importProgress.processed
				/ $scope.importProgress.total, extra ? 2 : 0);
	};
});