$(function() {
	// Prevent text selection
	window.document.onselectstart = function() {
		return false;
	}
});

// set up angular
var app = angular.module("app", [ "ngRoute" ]);
