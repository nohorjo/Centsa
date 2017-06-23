function init() {

    initGrid();

    // Set date pickers
    $(".transDate").datepicker({
        dateFormat: 'dd/mm/yy'
    });
    $("#transDate").datepicker("setDate", new Date());
    $(".transDate:not(#transDate)").each(function () {
        $(this).datepicker("setDate", new Date($(this).val() * 1000));
    });

    // add selects to rows
    $(".accountSelect").each(function () {
        $("#accountSelect").clone().appendTo($(this));
        $(this).find("select").val($(this).find("input:hidden").val());
    });
    $(".typeSelect").each(function () {
        $("#typeSelect").clone().appendTo($(this));
        $(this).find("select").val($(this).find("input:hidden").val());
    });
    $(".expenseSelect").each(function () {
        $(this).find("select").val($(this).find("input:hidden").val());
        $("#expenseSelect").clone().appendTo($(this));
    });
}

function initDatePicker() {
    $(".dateInput > input").datepicker({
        dateFormat: 'dd/mm/yy'
    });
}

function initGrid() {
    var transactions;
    var accounts;
    var types;
    var expenses;

    $.ajax({
        url: "/getTrans.json",
        method: "POST",
        data: JSON.stringify({
            limit: 999,
            offset: 0
        }),
        success: function (data) {
            transactions = JSON.parse(data);
        },
        async: false
    });

    $.ajax({
        url: "/getAccounts.json",
        method: "GET",
        success: function (data) {
            accounts = JSON.parse(data);
        },
        async: false
    });
    $.ajax({
        url: "/getTypes.json",
        method: "GET",
        success: function (data) {
            types = JSON.parse(data);
        },
        async: false
    });
    $.ajax({
        url: "/getExpenses.json",
        method: "GET",
        success: function (data) {
            expenses = JSON.parse(data);
        },
        async: false
    });


    $("#transGrid").jsGrid({
        width: "100%",
        inserting: true,
        editing: true,
        onItemInserting: function (row) {
            console.dir(row);
            row.item.id = 99;
        },
        rowClick: function (row) {
            console.dir(row);
            $("#transGrid").jsGrid("editItem", row.item);
        },
        data: transactions,
        fields: [{
                title: "ID",
                width: "5%",
                name: "id",
                type: "number",
                editing: false,
                inserting: false
            },
            {
                title: "Amount",
                width: "10%",
                name: "amount",
                type: "number"
            },
            {
                title: "Comment",
                width: "40%",
                name: "comment",
                type: "text"
            },
            {
                title: "Account",
                width: "10%",
                name: "account",
                type: "select",
                items: accounts,
                valueField: "id",
                textField: "name"
            },
            {
                title: "Type",
                width: "10%",
                name: "type",
                type: "select",
                items: types,
                valueField: "id",
                textField: "name"
            },
            {
                title: "Expense",
                width: "10%",
                name: "expense",
                type: "select",
                items: types,
                valueField: "id",
                textField: "name"
            },
            {
                title: "Date",
                width: "10%",
                name: "date",
                type: "text",
                css: "dateInput"
            },
            {
                width: "5%",
                type: "control"
            }
        ]
    });

    $(".jsgrid-insert-mode-button").click(function () {
        initDatePicker();
        $("jsgrid-insert-row .dateInput > input").datepicker("setDate", new Date());
    });
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