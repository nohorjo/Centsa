var app = angular.module("app", [ "ngRoute" ]);

app.controller("mainCtrl", function($scope, $rootScope, $location) {
	$rootScope.formatDate = function(date) {
		if (date.constructor == String) {
			date = date.substr(0, 19);
		}
		return new Date(date).formatDate("yyyy/MM/dd");
	};

	$rootScope.isActive = function(sel) {
		var active = false;

		$(sel).each(function() {
			if (this == document.activeElement)
				active = true;
		});

		return active;
	}

	$scope.isActive = function(path) {
		return $location.path() == path;
	}
});

app.filter('range', function() {
	return function(input, total) {
		total = parseInt(total);
		for (var i = 0; i < total; i++)
			input.push(i);
		return input;
	};
});
