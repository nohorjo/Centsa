/**
 * Script is initialized with the variables: 
 * 		$records : an iterator of the records in the CSV 
 * 		$transaction , $accounts , $types , $expenses : handlers
 * 
 * The handlers each expose the function ' insert(json) ' which creates the
 * entity (if it doesn't exist) and returns its ID.
 */

// Get an instance of SimpleDateFormat to parse dates
var sdf = new java.text.SimpleDateFormat("yyyy/MM/dd");

$records.next();// Skip header

while ($records.hasNext()) {
	// Get the next record
	var record = $records.next();

	// Get timestamp fromdate
	var timestamp = sdf.parse(record.get(0)).getTime();
	var amount = parseFloat(record.get(1)) * 100;
	var comment = record.get(2);
	var accountName = record.get(3);
	var typeName = record.get(4);

	// Get account and type ids, creating them if needed
	var accountId = $accounts.insert({
		name : accountName
	});
	var typeId = $types.insert({
		name : typeName
	});

	// Insert the transaction
	$transactions.insert({
		date : timestamp,
		amount : amount,
		comment : comment,
		account_id : accountId,
		type_id : typeId,
		expense_id : 1
	});
}