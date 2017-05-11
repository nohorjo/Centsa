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