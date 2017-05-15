function init() {
    // Set date picker
    $("#transDate").datepicker({
        dateFormat: 'dd/mm/yy'
    }).datepicker("setDate", new Date());
}

function saveTransaction() {
    $.ajax({
        url: "/saveTrans",
        type: "POST",
        data: JSON.stringify(serializeElement("transactionDetails")),
        success: function (newId) {
            clearInputs("transactionDetails");
        },
        error: function (data) {
            if (data.responseText)
                alert(data.responseText);
        }
    });
}