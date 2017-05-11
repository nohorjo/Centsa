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
}

/**
 * Load url into the main iframe
 */
function load(url) {
    $("#MAIN_CONTENT")[0].src = url;
    setTimeout(function () {
        var mainContentBody = $("#MAIN_CONTENT")[0].contentWindow.document.body;
        $("#MAIN_CONTENT").css({ width: mainContentBody.scrollWidth, height: Math.ceil(mainContentBody.scrollHeight * 1.1) })
    }, 200);
}

/**
 * Keep the server alive
 */
setInterval(function () { $.get("/ping"); }, 15000);