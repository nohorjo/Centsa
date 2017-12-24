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

	$("#version").text(centsa.general.version());
	$("#update" + centsa.settings.get("auto.update.check")).prop("checked", "true");

}

function initLayouts() {
    $('#layout').children().remove();
	$(centsa.general.layouts()).each(function() {
        $('#layout').append($('<option>', {
            value : this,
            text : this
        }));
    });
}