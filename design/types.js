function addType() {
    var newType = $("#newTypeName").val();
    $.ajax({
        url: "/addType",
        type: "POST",
        data: newType,
        success: function (newId) {
            printType(newType, newId);
        },
        error: function (data) {
            if (data.responseText)
                alert(data.responseText);
        }
    });
}

function deleteType(id) {
    alert("unimplemented!");
}

function printType(name, id) {
    var row = "<tr><td>" + name +
        '</td><td><input type="button" value="&times;" onclick="deleteType(\'' +
        id + '\')"></td>';
    $("#newTypeDetails").before(row);
    $("#newTypeName").val("");
}