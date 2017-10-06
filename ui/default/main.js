$(function() {
	// Prevent text selection
	window.document.onselectstart = function() {
		return false;
	}
});

// set up angular
var app = angular.module("app", [ "ngRoute" ]);

app.controller("mainCtrl", function($scope, $rootScope, $location) {
	$rootScope.formatDate = function(date) {
		return new Date(date).formatDate("yyyy/MM/dd");
	};

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
