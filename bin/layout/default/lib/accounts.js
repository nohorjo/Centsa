function addAccount() {
    var newAccount = $("#newAccountName").val();
    $.ajax({
        url: "/addAccount",
        type: "POST",
        data: newAccount,
        success: function (newId) {
            printAccount(newAccount, newId);
        },
        error: function (data) {
            if (data.responseText)
                alert(data.responseText);
        }
    });
}

function deleteAccount(id) {
    alert("unimplemented!");
}

function printAccount(name, id) {
    var row = "<tr><td>" + name +
        '</td><td><input type="button" value="&times;" onclick="deleteAccount(\'' +
        id + '\')"></td>';
    $("#newAccountDetails").before(row);
    $("#newAccountName").val("");
}