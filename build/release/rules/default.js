var sdf = new java.text.SimpleDateFormat("yyyy/MM/dd");

$records.next();// skip header

while ($records.hasNext()) {
	var record = $records.next();

	$transactions.insert({
		date : sdf.parse(record.get(0)).getTime(),
		amount : parseFloat(record.get(1)) * 100,
		comment : record.get(2),
		account_id : $accounts.insert({
			name : record.get(3)
		}),
		type_id : $types.insert({
			name : record.get(4)
		}),
		expense_id : 1
	});

}