const app = angular.module("app", ["ngRoute", "ngCookies"]);

app.controller("mainCtrl", function ($scope, $rootScope, $location, $cookies) {
	$scope.name = $cookies.get('name');
	$rootScope.formatDate = date => {
		if (date.constructor == String) {
			date = date.substr(0, 19);
		}
		return new Date(date).formatDate("yyyy/MM/dd");
	};

	$rootScope.sort = (() => {
		let lastProp;
		let asc = true;
		return (prop, arr) => {
			if (lastProp != prop) {
				lastProp = prop;
				asc = false;
			}
			asc = !asc
			arr.sort((a, b) => {
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

	/**
	 * Used to filter transactions. Available in the rootscope so that other
	 * pages can set it if needed
	 */
	$rootScope.resetFilter = () => $rootScope.filter = {
		account_id: '0',
		type_id: '0',
		expense_id: '0',
		comment: "",
		regex: false
	};
	$rootScope.resetFilter();

	$rootScope.setFilter = f => {
		$rootScope.filter = f;
		$location.path("transactions");
	};

	$scope.isActive = path => $location.path() == path;

});

app.filter('range', () => {
	return function (input, total) {
		total = parseInt(total);
		for (let i = 0; i < total; i++)
			input.push(i);
		return input;
	};
});

app.filter('prop', () => {
	return function (input, prop, value) {
		return input.filter(e => e[prop] == value);
	};
});

app.directive('fileModel', ['$parse', function ($parse) {
	return {
		restrict: 'A',
		link: function ($scope, $elem, $attrs) {
			const model = $parse($attrs.fileModel);
			const modelSetter = model.assign;

			$elem.bind('change', () => {
				$scope.$apply(() => {
					modelSetter($scope, $elem[0].files[0]);
				});
			});
		}
	};
}]);

app.directive("numberDivide", () => ({
	require: "ngModel",
	link: ($scope, $elem, $attrs, $controller) => {
		$controller.$formatters.push(val => val && val / $attrs.numberDivide);
		$controller.$parsers.push(val => val && val * $attrs.numberDivide);
	}
}));

app.directive('scrollBottom', () => ({
	restrict: 'A',
	link: function ($scope, $elem, $attrs) {
		var raw = $elem[0];
		$elem.bind('scroll', () => {
			if (raw.scrollTop + raw.offsetHeight >= raw.scrollHeight) {
				$scope.$apply($attrs.scrollBottom);
			}
		})
	}
}));