/**
 * Custom context menu
 */
function contextMenu() { }

function applyMouseRestrictions(win) {
    // Prevent text selection
    win.document.onselectstart = function () {
        return false;
    }
    // Prevent default context menu
    if (win.document.addEventListener) {
        win.document.addEventListener('contextmenu', function (e) {
            contextMenu();
            e.preventDefault();
        }, false);
    } else {
        win.document.attachEvent('oncontextmenu', function () {
            contextMenu();
            win.event.returnValue = false;
        });
    }
}

/**
 * Prevent default context menu
 */
function init() {
    applyMouseRestrictions(window);
    $(window).resize(sizeContent);
}

var reziseTimeout;

function sizeContent() {
    clearTimeout(reziseTimeout);
    reziseTimeout = setTimeout(function () {
        $("#MAIN_CONTENT").css({
            width: Math.ceil($("body").width() * 0.99),
            height: Math.ceil(($("body").height() - $("#MAIN_MENU").height()) * 0.95)
        });
    }, 200);
}

/**
 * Load url into the main iframe
 */
function load(url) {
    $("#MAIN_CONTENT")[0].src = url;
    sizeContent();
    setTimeout(function () {
        applyMouseRestrictions($("#MAIN_CONTENT")[0].contentWindow);
    }, 200);
}



/**
 * Keep the server alive
 */
setInterval(function () { $.get("/ping"); }, 15000);