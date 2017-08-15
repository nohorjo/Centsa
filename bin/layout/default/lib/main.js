/**
 * Custom context menu
 */
function contextMenu() {}

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
            width: Math.ceil(($("body").width() - $("div.sidebar").width()) * 0.95),
            height: Math.ceil($("body").height() * 0.9)
        });
    }, 200);
}

/**
 * Load url into the main iframe
 */
function load(url, li) {
    $("#MAIN_CONTENT")[0].src = url;
    sizeContent();
    setTimeout(function () {
        applyMouseRestrictions($("#MAIN_CONTENT")[0].contentWindow);
    }, 200);
    $("ul.nav > li").removeClass("active");
    $(li).addClass("active");
}