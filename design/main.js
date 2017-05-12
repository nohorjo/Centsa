/**
 * Prevent text selection
 */
document.onselectstart = function () {
    return false;
}

/**
 * Custom context menu
 */
function contextMenu() { }

/**
 * Prevent default context menu
 */
function init() {
    // Prevent default context menu
    if (document.addEventListener) {
        document.addEventListener('contextmenu', function (e) {
            contextMenu();
            e.preventDefault();
        }, false);
    } else {
        document.attachEvent('oncontextmenu', function () {
            contextMenu();
            window.event.returnValue = false;
        });
    }
	
	$(window).resize(sizeContent);
}

var reziseTimeout;

function sizeContent(){
	clearTimeout(reziseTimeout);
	reziseTimeout = setTimeout(function () {
		$("#MAIN_CONTENT").css({
			width: Math.ceil($("body").width()*0.95),
			height: Math.ceil(($("body").height() - $("#MAIN_MENU").height())*0.95)
		});
	}, 200);
}

/**
 * Load url into the main iframe
 */
function load(url) {
    $("#MAIN_CONTENT")[0].src = url;
	sizeContent();
}

/**
 * Keep the server alive
 */
setInterval(function () { $.get("/ping"); }, 15000);