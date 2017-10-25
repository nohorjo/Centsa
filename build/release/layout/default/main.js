var app = angular.module("app", [ "ngRoute" ]);

app.controller("mainCtrl", function($scope, $rootScope, $location) {
	$rootScope.formatDate = function(date) {
		if (date.constructor == String) {
			date = date.substr(0, 19);
		}
		return new Date(date).formatDate("yyyy/MM/dd");
	};

	/**
	 * Checks if the selector matches the active element
	 */
	$rootScope.isActive = function(sel) {
		var active = false;

		$(sel).each(function() {
			if (this == document.activeElement)
				active = true;
		});

		return active;
	}

	$rootScope.sort = (function() {
		var lastProp;
		var asc = true;
		return function(prop, arr) {
			if (lastProp != prop) {
				lastProp = prop;
				asc = false;
			}
			asc = !asc
			arr.sort(function(a, b) {
				p1 = a[prop];
				p2 = b[prop];
				var comp;
				if (p1.constructor == String) {
					comp = p1.localeCompare(p2);
				} else {
					comp = p1 - p2;
				}
				return comp * (asc ? 1 : -1);
			});
		};
	})();

	$scope.isActive = function(path) {
		return $location.path() == path;
	};

	/**
	 * Used to filter transactions. Available in the rootscope so that other
	 * pages can set it if needed
	 */
	$rootScope.filter = {
		account_id : '0',
		type_id : '0',
		expense_id : '0'
	};
});

app.filter('range', function() {
	return function(input, total) {
		total = parseInt(total);
		for (var i = 0; i < total; i++)
			input.push(i);
		return input;
	};
});
