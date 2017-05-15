/**
 * Coverts all child user-changeables to JSON
 * @param {*} id id of the element
 */
function serializeElement(id) {
    var form0 = {};
    $("#" + id).find("input:not([type='button']), select, textarea").each(function () {
        form0[this.name] = this.value;
    });
    return form0;
}

/**
 * Clears inputs
 */
function clearInputs(id) {
    $("#" + id).find("input:not([type='button']), textarea").each(function () {
        this.value = "";
    });
}