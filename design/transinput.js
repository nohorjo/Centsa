function init(){
    // Set date picker
    $("#transDate").datepicker({
        dateFormat: 'dd/mm/yy'
    }).datepicker("setDate", new Date());
}

function saveTransaction() {
    alert(serializeElement("transactionDetails"));
}