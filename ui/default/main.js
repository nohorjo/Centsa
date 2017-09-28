$(function() {
	// Prevent text selection
	window.document.onselectstart = function() {
		return false;
	}
	// resize body
	$(window).resize((function() {
		var reziseTimeout;

		return function() {
			clearTimeout(reziseTimeout);
			reziseTimeout = setTimeout(function() {
				$("body").height(centsa.settings.get("height"));
			}, 50);
		}
	})());
});

// set up angular
var app = angular.module("app", [ "ngRoute" ]);
