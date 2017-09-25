/**
 * 
 */
var iframe;
var settingsToggleCSS;

// keep iframe the same size as the body
function resizeIframe() {
	iframe.height = document.body.scrollHeight;
}

function hideSettings() {
	settingsToggleCSS.transition = "0.4s";
	settingsToggleCSS.right = "-300px";
	iframe.focus();
}

function showSettings() {
	settingsToggleCSS.transition = "0.4s";
	settingsToggleCSS.right = "0px";
}

function applyMouseRestrictions(win) {
	// Prevent text selection
	win.document.onselectstart = function() {
		return false;
	}
	// Prevent default context menu
	if (win.document.addEventListener) {
		win.document.addEventListener('contextmenu', function(e) {
			e.preventDefault();
		}, false);
	} else {
		win.document.attachEvent('oncontextmenu', function() {
			win.event.returnValue = false;
		});
	}
}

function init() {
	iframe = document.querySelector("iframe");
	settingsToggleCSS = document.getElementById("settingsToggle").style;
	showSettings();
	setTimeout(hideSettings, 400);

	resizeIframe();
	applyMouseRestrictions(window);
	centsa.setUniqueKey(location.search.substr(1));
	iframe.contentWindow.centsa = censta;
}

function glow(e, colour) {
	var style = e.style;
	style.transition = "0.2s";
	style["box-shadow"] = "0 0 7px 3px " + colour;
	setTimeout(function() {
		style.transition = "0.2s";
		style["box-shadow"] = "";
	}, 200);
}

function setSetting(key, e) {
	var error = function() {
		glow(e, '#99ff00');
	}
	centsa.settings.set(key, e.value, error, alert);
}