function init() {
    // Set date pickers
    $(".transDate").datepicker({
        dateFormat: 'dd/mm/yy'
    });
    $("#transDate").datepicker("setDate", new Date());
    $(".transDate:not(#transDate)").each(function () {
        $(this).datepicker("setDate", new Date($(this).val() * 1000));
    });

    // add selects to rows
    $("#accountSelect").clone().appendTo(".accountSelect");
    $("#typeSelect").clone().appendTo(".typeSelect");
    $("#expenseSelect").clone().appendTo(".expenseSelect");
}

function saveTransaction() {
    var trans = serializeElement("transactionDetails");
    var timeStamp = $("#transDate").datepicker("getDate").getTime();
    trans["DATE"] = timeStamp / 1000;
    $.ajax({
        url: "/saveTrans",
        type: "POST",
        data: JSON.stringify(trans),
        success: function () {
            location.reload();
        },
        error: function (data) {
            if (data.responseText)
                alert(data.responseText);
        }
    });
}

function updateTransaction(rowId) {
    alert("unimplemented!");
}

function deleteTransaction(id) {
    alert("unimplemented!");
}