app
		.controller(
				"summaryCtrl",
				function($scope) {
					$scope.budget = centsa.general.budget();
					$scope.rules = centsa.general.rules();
					$scope.rule = "default";

					$scope.importProgress = {
						processed : 0,
						total : 1
					};

					$scope.importFile = (function() {
						var i = null;
						return function() {
							if (i) {
								clearInterval(i);
							}
							centsa.general.importFile($scope.rule);

							i = setInterval(
									(function() {
										var started = false;
										return function() {
											var p = centsa.general
													.importProgress();
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
												$('#progressModal').modal(
														"hide");
												drawGraph();
												$scope.budget = centsa.general
														.budget();
											}
										};
									})(), 200);
						};
					})();

					$scope.getProgressPercentage = function(extra) {
						var per = $scope.importProgress.processed * 100;
						if (extra) {
							per *= 100;
						}
						per = parseInt(per / $scope.importProgress.total);
						if (extra) {
							per /= 100;
						}
						return per;
					};

					!function drawGraph() {
						var sums = []
						var data = centsa.transactions.getCumulativeSums();
						$(data).each(
								function() {
									sums.push({
										date : new Date(this.date)
												.formatDate("yyyy/MM/dd"),
										sum : this.sum / 100
									});
								});
						AmCharts
								.makeChart(
										"trans-chart",
										{
											"type" : "serial",
											"theme" : "light",
											"marginRight" : 60,
											"marginLeft" : 60,
											"dataDateFormat" : "YYYY/MM/DD",
											"valueAxes" : [ {
												"id" : "v1",
												"axisAlpha" : 0,
												"position" : "left",
												"ignoreAxisWidth" : true
											} ],
											"balloon" : {
												"borderThickness" : 1,
												"shadowAlpha" : 0
											},
											"graphs" : [ {
												"id" : "g1",
												"balloon" : {
													"drop" : true,
													"adjustBorderColor" : false,
													"color" : "#ffffff"
												},
												"lineThickness" : 2,
												"useLineColorForBulletBorder" : true,
												"valueField" : "sum",
												"balloonText" : "<span style='font-size:18px;'>[[value]]</span>"
											} ],
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
										});
					}();
				});