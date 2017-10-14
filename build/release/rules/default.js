/**
 * 	Script is initialized with the variables:
 * 		$records : an iterator of the records in the CSV
 * 		$transaction , $accounts , $types , $expenses : handlers
 * 
 * 	The handlers each expose the function ' insert(json) ' which creates
 * 	the entity (if it doesn't exist) and returns its ID.
 */

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