app.controller("summaryCtrl", function($scope) {
	$scope.strictMode = centsa.settings.get("strict.mode") == "true";

	$scope.getBudget = function() {
		centsa.settings.set("strict.mode", $scope.strictMode);
		$scope.budget = centsa.general.budget($scope.strictMode);
	};

	$scope.getBudget();

	(function() {
		var sums = []
		var data = centsa.transactions.getCumulativeSums();
		$(data).each(function() {
			sums.push({
				date : new Date(this.date).formatDate("yyyy/MM/dd"),
				sum : this.sum / 100
			});
		});
		var valueAxes = [ {
			"id" : "v1",
			"axisAlpha" : 0,
			"position" : "left",
			"ignoreAxisWidth" : true
		} ];
		var graphs = [ {
			"id" : "g1",
			"balloon" : {
				"drop" : true,
				"adjustBorderColor" : false,
				"color" : "#ffffff"
			},
			"lineThickness" : 2,
			"useLineColorForBulletBorder" : true,
			"valueField" : "sum",
			"balloonText" : "<span>[[value]]</span>"
		} ];
		var chartOpts = {
			"type" : "serial",
			"theme" : "light",
			"marginRight" : 60,
			"marginLeft" : 60,
			"dataDateFormat" : "YYYY/MM/DD",
			"valueAxes" : valueAxes,
			"balloon" : {
				"borderThickness" : 1,
				"shadowAlpha" : 0
			},
			"graphs" : graphs,
			"chartCursor" : {
				"pan" : true,
				"valueLineEnabled" : true,
				"valueLineBalloonEnabled" : true,
				"cursorAlpha" : 1,
				"cursorColor" : "#258cbb",
				"limitToGraph" : "g1",
				"valueLineAlpha" : 0.2,
				"valueZoomable" : true
			},
			"categoryField" : "date",
			"categoryAxis" : {
				"parseDates" : false,
				"dashLength" : 1,
			},
			"dataProvider" : sums
		};
		AmCharts.makeChart("trans-chart", chartOpts);
	})();
});