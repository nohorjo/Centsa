/**
 * 
 */
var iframe;
var settingsToggle;
var currentSettingsVal;

// keep iframe the same size as the body
function resizeIframe() {
	iframe.height = document.body.scrollHeight - 10;
}

function hideSettings() {
	function shouldHide() {
		var activeEl = document.activeElement;
		do {
			if (activeEl == settingsToggle) {
				return false
			}
		} while (activeEl = activeEl.parentElement);
		return true;
	}

	if (shouldHide()) {
		settingsToggle.style.transition = "0.4s";
		settingsToggle.style.right = "-250px";
		iframe.focus();
	} else {
		setTimeout(hideSettings, 200);
	}
}

function showSettings() {
	settingsToggle.style.transition = "0.4s";
	settingsToggle.style.right = "0px";
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
	centsa.setUniqueKey(location.search.substr(1));
	iframe.contentWindow.centsa = centsa;
	settingsToggle = document.getElementById("settingsToggle");

	showSettings();
	setTimeout(hideSettings, 400);

	resizeIframe();
	applyMouseRestrictions(window);
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

function prepareSetting(val) {
	currentSettingsVal = val;
}

function setSetting(key, e) {
	var loader = document.getElementById("loader");
	var success = function() {
		setTimeout(function() {
			loader.style.display = "none";
		}, 200);
	}
	if (e.value != currentSettingsVal) {
		loader.style.display = "block";
		centsa.settings.set(key, e.value, success, function(x) {
			alert(x);
		});
	}
}