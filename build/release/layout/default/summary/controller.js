app.controller("summaryCtrl", function($scope) {
	$scope.budget = centsa.general.budget();
	$scope.rules = centsa.general.rules();
	$scope.rule = "default";

	$scope.importProgress = {
		processed : 0,
		total : 1
	};

	$scope.importFile = (function(){
		var i = null;
		return function() {
			if(i){
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

	$scope.getProgressPercentage = function() {
		return parseInt(($scope.importProgress.processed * 100) / $scope.importProgress.total);
	};
});