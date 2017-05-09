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

    // Set date picker
    $("#transDate").datepicker({
        dateFormat: 'dd/mm/yy'
    }).datepicker("setDate", new Date());
}

/**
 * Coverts all child user-changeables to JSON string
 * @param {*} id id of the element
 */
function serializeElement(id) {
    var form0 = {};
    $("#" + id).find("input:not([type='button']), select, textarea").each(function () {
        form0[this.name] = this.value;
    });
    return JSON.stringify(form0);
}

function alertHi() {
    alert(serializeElement("transactionDetails"));
}

/**
 * Keep the server alive
 */
setInterval(function () { $.get("/ping"); }, 15000);