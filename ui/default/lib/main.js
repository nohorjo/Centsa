$(function() {

	// Prevent text selection
	window.document.onselectstart = function() {
		return false;
	}

	// resize sidebar
	$(window).resize((function() {
		var reziseTimeout;

		return function sizeContent() {
			clearTimeout(reziseTimeout);
			reziseTimeout = setTimeout(function() {
				$(".sidebar").height(centsa.settings.get("height"));
			}, 50);
		}
	})());
});
