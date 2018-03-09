app.controller("importCtrl", function ($scope, $rootScope, $interval, centsa) {
	$scope.rules = [];
	centsa.general.rules().then(resp => {
		$scope.rules = resp.data;
		$scope.rule = resp.data[0].id.toString();
	});

	$scope.importProgress = {
		processed: 0,
		total: 1
	};

	$scope.importFile = () => {
		$scope.importError = "";
		$('#progressModal').modal({
			backdrop: 'static',
			keyboard: false
		}).appendTo("body");

		const importWorker = new Worker("/workers/importWorker.js");

		importWorker.addEventListener('message', e => {
			if (e.data) {
				$scope.$apply(() => {
					$scope.importProgress = e.data;
				});
			} else {
				$('#progressModal').modal("hide");
			}
		});
		importWorker.addEventListener('error', e => {
			$scope.$apply(() => {
				$scope.importError = `Error: ${e.message}`;
			});
		});
		importWorker.postMessage({
			rule: $scope.rule,
			csv: $scope.uploadFile
		});
	};

});