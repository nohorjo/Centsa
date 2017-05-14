function init() {
    // Set date picker
    try {
        $("#transDate").datepicker({
            dateFormat: 'dd/mm/yy'
        }).datepicker("setDate", new Date());
    } catch (e) { }
}

function saveTransaction() {
    alert(serializeElement("transactionDetails"));
}