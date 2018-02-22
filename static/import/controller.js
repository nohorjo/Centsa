app.controller("importCtrl", function ($scope, $rootScope, $interval, centsa) {
	$scope.rules = [];
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
				$('#progressModal').modal({
					backdrop: 'static',
					keyboard: false
				}).appendTo("body");
				i = $interval(() => centsa.general.importProgress(id, p => {
					if (p) {
						$scope.importProgress = p;
					} else {
						$interval.cancel(i);
						delete i;
						$('#progressModal').modal("hide");
						$scope.importProgress = {
							processed: 0,
							total: 1
						};
					}
				}), 1500);
			});
		};
	})();

	$scope.getProgressPercentage = extra => $rootScope.roundTo(($scope.importProgress.processed * 100) / $scope.importProgress.total, extra ? 2 : 0);

});