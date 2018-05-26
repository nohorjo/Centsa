UPDATE rules SET content = 
'/**
	* Script is initialized with the variables: 
	* 		$records : an iterator of the records in the CSV 
	* 		$centsa : an interface to the backend
	*/

$records.next(); // Skip header

Promise.all([
	$centsa.accounts.getAll(),
	$centsa.types.getAll(),
]).then(async result => {
	// Store account and type ids
	const accountsCache = result[0].data;
	const typesCache = result[1].data;

	// Putting transactions in an array for bulk insert
	const allTransactions = [];

	while ($records.hasNext()) {
		const row = $records.next();

		if (row.length == 5) {
			let account = accountsCache.find(a => a.name == row[3]);
			if (!account) {
				// Account does not exist so create it
				account = { name: row[3] };
				account.id = (await $centsa.accounts.insert(account)).data;
				// Add it back to the cache
				accountsCache.push(account);
			}

			let type = typesCache.find(a => a.name == row[4]);
			if (!type) {
				// Type does not exist so create it
				type = { name: row[4] };
				type.id = (await $centsa.types.insert(type)).data;
				// Add it back to the cache
				typesCache.push(type);
			}

			const date = new Date(row[0]);
			date.setHours(12); // So that DST does not set the date back a day

			allTransactions.push({
				date: date,
				amount: parseFloat(row[1].replace(/[^\\d\\.\\-]/g,"")) * 100,
				comment: row[2],
				account_id: account.id,
				type_id: type.id,
				expense_id: null
			});
		}
	}

	await $centsa.transactions.insert(allTransactions);

}).catch(err => setTimeout(() => { throw JSON.stringify(err.message || err.response) }, 0));
' WHERE name='Default';
