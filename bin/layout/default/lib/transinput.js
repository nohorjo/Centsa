function init() {
    getGridData();
}

function prepareNewTransDate() {
    var newDate = $(".jsgrid-insert-row .dateInput > input");
    newDate.datepicker({
        dateFormat: 'dd/mm/yy'
    });
    newDate.datepicker("setDate", new Date());
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
        onItemInserting: saveTransaction,
        onItemUpdated: saveTransaction,
        onItemDeleting: function (row) {
            top.centsa.transaction.delete(row.item.id);
        },
        onItemInserted: function () {
            setTimeout(prepareNewTransDate, 100)
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

    $(".jsgrid-insert-mode-button").click(prepareNewTransDate);
}

function saveTransaction(row) {
    var trans = row.item;
    trans.date = Date.parse(row.item.dateFormatted.split("/").reverse());
    trans.id = top.centsa.transaction.save(trans);
    if (trans.id == -1) row.cancel = true;
}