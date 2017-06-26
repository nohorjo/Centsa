function init() {

    getGridData();

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

function getGridData() {
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
            $(transactions).each(function () {
                this.dateFormatted = new Date(this.date).formatDate("dd/MM/yyyy");
            });
            $.ajax({
                url: "/getAccounts.json",
                method: "GET",
                success: function (data) {
                    accounts = JSON.parse(data);

                    $.ajax({
                        url: "/getTypes.json",
                        method: "GET",
                        success: function (data) {
                            types = JSON.parse(data);
                            $.ajax({
                                url: "/getExpenses.json",
                                method: "GET",
                                success: function (data) {
                                    expenses = JSON.parse(data);
                                    initGrid(transactions, accounts, types, expenses);
                                },
                            });
                        },
                    });

                },
            });
        },
    });

}

function initGrid(transactions, accounts, types, expenses) {

    $("#transGrid").jsGrid({
        width: "100%",
        inserting: true,
        editing: true,
        onItemInserting: function (row) {
            console.dir(row);
            row.item.id = 99;
        },
        rowClick: function (row) {
            $("#transGrid").jsGrid("editItem", row.item);
            $($(row.event.target).parents()[1]).find(".jsgrid-edit-row > .dateInput > input").datepicker({
                dateFormat: 'dd/mm/yy'
            });
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
                width: "15%",
                name: "amount",
                type: "number"
            },
            {
                title: "Comment",
                width: "30%",
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
                width: "15%",
                name: "dateFormatted",
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
        var newDate = $(".jsgrid-insert-row .dateInput > input");
        newDate.datepicker({
            dateFormat: 'dd/mm/yy'
        });
        newDate.datepicker("setDate", new Date());
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