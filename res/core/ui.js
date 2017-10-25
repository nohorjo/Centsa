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
	iframe.contentWindow.centsa = centsa;

	resizeIframe();
	applyMouseRestrictions(window);
	
	var layoutsSelect = document.getElementById("layout");
	var layouts = centsa.general.layouts();
	for (var i = 0; i < layouts.length; i++) {
		var option = document.createElement("option");
		option.value = layouts[i];
		option.text = layouts[i];
		layoutsSelect.appendChild(option);
	}
}
