/**
 * Prevent text selection
 */
document.onselectstart = function () { return false; }

/**
 * Custom context menu
 */
function contextMenu() {
}

/**
 * Prevent default context menu
 */
function init() {
    if (document.addEventListener) {
        document.addEventListener('contextmenu', function (e) { contextMenu(); e.preventDefault(); }, false);
    } else {
        document.attachEvent('oncontextmenu', function () { contextMenu(); window.event.returnValue = false; });
    }
}

/**
 * Needed for Trident
 */
setTimeout(init, 1000);
