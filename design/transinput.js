function init() {
    // Set date picker
    $("#transDate").datepicker({
        dateFormat: 'dd/mm/yy'
    }).datepicker("setDate", new Date());
}

function saveTransaction() {
    var trans = serializeElement("transactionDetails");
    trans["DATE"] = $("#transDate").datepicker("getDate").getTime() / 1000;
    $.ajax({
        url: "/saveTrans",
        type: "POST",
        data: JSON.stringify(trans),
        success: function () {
            clearInputs("transactionDetails");
            $("#transDate").datepicker({
                dateFormat: 'dd/mm/yy'
            }).datepicker("setDate", new Date(trans["DATE"]));
        },
        error: function (data) {
            if (data.responseText)
                alert(data.responseText);
        }
    });
}