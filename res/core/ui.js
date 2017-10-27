/**
 * 
 */
var iframe;

// keep iframe the same size as the body
function resizeIframe() {
	iframe.height = document.body.scrollHeight - 10;
}

function applyMouseRestrictions(win) {
	// Prevent text selection
	win.document.onselectstart = function() {
		return false;
	}
	// Prevent default context menu
	$(function() {
		$(document).bind("contextmenu", function(e) {
			return false;
		});
	});
}

function init() {
	iframe = $("iframe")[0];
	iframe.contentWindow.centsa = centsa;

	resizeIframe();
	applyMouseRestrictions(window);

	$(centsa.general.layouts()).each(function() {
		$('#layout').append($('<option>', {
			value : this,
			text : this
		}));
	});

	$("#version").text(centsa.general.version());
}

function checkForUpdates() {
	centsa.general.update();
}