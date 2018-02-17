app.controller("importCtrl", function ($scope, $rootScope, $interval, centsa) {
	centsa.general.rules(data => $scope.rules = data);
	$scope.rule = "default";

	$scope.importProgress = {
		processed: 0,
		total: 1
	};

	$scope.importFile = (() => {
		let i = null;
		return () => {
			if (i) {
				$interval.cancel(i);
				delete i;
			}
			centsa.general.importFile($scope.rule, $scope.uploadFile, id => {
				i = $interval((() => {
					let started = false;
					return () => centsa.general.importProgress(id, p => {
						if (p) {
							$('#progressModal').modal({
								backdrop: 'static',
								keyboard: false
							});
							started = true;
							$scope.importProgress = p;
						} else if (started) {
							$interval.cancel(i);
							delete i;
							$('#progressModal').modal("hide");
						}
					});

				})(), 1500);
			});

		};
	})();

	$scope.getProgressPercentage = extra => $rootScope.roundTo(($scope.importProgress.processed * 100) / $scope.importProgress.total, extra ? 2 : 0);

});