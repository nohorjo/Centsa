app.controller("importCtrl", function ($scope, $rootScope, $interval, centsa) {
	$scope.rules = [];
	centsa.general.rules(data => {
		$scope.rules = data;
		$scope.rule = data[0].id.toString();
	});

	$scope.importProgress = {
		processed: 0,
		total: 1
	};

	$scope.importFile = () => {
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
			if (e.message != 'Uncaught Done') {
				throw e;
			}
			$('#progressModal').modal("hide");
		});
		importWorker.postMessage({
			rule: $scope.rule,
			csv: $scope.uploadFile
		});
	};

	$scope.getProgressPercentage = extra => $rootScope.roundTo(($scope.importProgress.processed * 100) / $scope.importProgress.total, extra ? 2 : 0);

});