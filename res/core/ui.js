/**
 * 
 */
var iframe;
var settingsToggleCSS;
var currentSettingsVal;

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
	iframe.contentWindow.centsa = centsa;
	document.getElementById("serverIP").value = centsa.settings
			.get("server.ip");
	document.getElementById("serverPort").value = centsa.settings
			.get("server.port");

	var layoutsSelect = document.getElementById("layout");
	var layouts = JSON.parse(centsa.settings.get("layouts"));
	for (var i = 0; i < layouts.length; i++) {
		var option = document.createElement("option");
		option.value = layouts[i];
		option.text = layouts[i];
		layoutsSelect.appendChild(option);
	}
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

function prepareSetting(val) {
	currentSettingsVal = val;
}

function setSetting(key, e) {
	var success = function() {
		glow(e, '#99ff00');
	}
	if (e.value != currentSettingsVal) {
		centsa.settings.set(key, e.value, success, function(x) {
			alert(x);
		});
	}
}