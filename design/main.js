/**
 * Custom context menu
 */
function contextMenu() { }

function applyMouseRestrictions(doc) {
    // Prevent text selection
    doc.onselectstart = function () {
        return false;
    }
    // Prevent default context menu
    if (doc.addEventListener) {
        doc.addEventListener('contextmenu', function (e) {
            contextMenu();
            e.preventDefault();
        }, false);
    } else {
        doc.attachEvent('oncontextmenu', function () {
            contextMenu();
            window.event.returnValue = false;
        });
    }
}

/**
 * Prevent default context menu
 */
function init() {
    applyMouseRestrictions(document);
    $(window).resize(sizeContent);
}

var reziseTimeout;

function sizeContent() {
    clearTimeout(reziseTimeout);
    reziseTimeout = setTimeout(function () {
        $("#MAIN_CONTENT").css({
            width: Math.ceil($("body").width() * 0.95),
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
    applyMouseRestrictions($("#MAIN_CONTENT")[0].contentDocument);
}



/**
 * Keep the server alive
 */
setInterval(function () { $.get("/ping"); }, 15000);