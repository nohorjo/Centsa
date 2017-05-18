function init() {
    $(".datePicker").each(function () {
        $(this).datepicker({
            dateFormat: 'dd/mm/yy'
        }).datepicker("setDate", new Date($(this).val() * 1000));
    });
}

function saveExpense() {
    alert("unimplemented");
}

function deleteExpense(id) {
    alert("unimplemented");
}