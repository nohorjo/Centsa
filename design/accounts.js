function addAccount() {
    var newAccount = $("#newAccountName").val();
    $.ajax({
        url: "/addAccount",
        type: "POST",
        data: newAccount,
        success: function (newId) {
            var row = "<tr><td>" + newAccount +
                '</td><td><input type="button" value="&times;" onclick="deleteAccount(\'' +
                newId + '\')"></td>';
            $("#newAccountDetails").before(row);
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