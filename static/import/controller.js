app.controller("importCtrl", function ($scope, $rootScope, $interval, centsa) {
	$scope.rules = [];
	centsa.general.rules(data => $scope.rules = data);
	$scope.rule = "default";

	$scope.importProgress = {
		processed: 0,
		total: 1
	};

	$scope.importFile = () => centsa.general.importFile($scope.rule, $scope.uploadFile, id => {
		$('#progressModal').modal({
			backdrop: 'static',
			keyboard: false
		}).appendTo("body");

		const importWorker = new Worker("/importWorker.js");

		importWorker.addEventListener('message', e => {
			$scope.$apply(() => {
				$scope.importProgress = e.data;
			});
		});
		importWorker.addEventListener('error', e => {
			$('#progressModal').modal("hide");
			importWorker.terminate();
		});
		importWorker.postMessage({
			rule: rule,
			csv: ""
		});
	});

	$scope.getProgressPercentage = extra => $rootScope.roundTo(($scope.importProgress.processed * 100) / $scope.importProgress.total, extra ? 2 : 0);

});