/**
 * Coverts all child user-changeables to JSON
 * @param {*} id id of the element
 */
function serializeElement(id) {
    var form0 = {};
    $("#" + id).find("input:not([type='button'],[type='checkbox']), select, textarea").each(function () {
        form0[this.name] = this.value;
    });
    $("#" + id).find("input[type='checkbox']").each(function () {
        form0[this.name] = this.checked;
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