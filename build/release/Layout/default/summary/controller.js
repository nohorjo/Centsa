app.controller("summaryCtrl", function($scope) {
	$scope.budget = centsa.general.budget();

	$scope.importFile = function(input) {
		var r = new FileReader();
		r.onload = function() {
			centsa.general.importFile(r.result, "csv");
		}
		r.readAsText(input.files[0]);
	}
});