function addAccount() {
    var newAccount = serializeElement("newAccountDetails");
    $.ajax({
        url: "/addAccount",
        type: "POST",
        data: JSON.stringify(newAccount),
        success: function (data) {
            var row = "<tr><td>" + newAccount["NAME"]
                + '</td><td><input type="button" value="&times;" onclick="deleteAccount(\''
                + data.responseText + '\')"></td>';
            $("#accountsTable tbody").prepend(row);
            $("#newAccountName").val("");
        },
        error: function (data) {
            alert(data.responseText);
        }
    });
}

function deleteAccount(id) {
    alert("unimplemented!");
}