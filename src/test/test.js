var test = Java.type("nohorjo.centsa.importer.JSCSVParserTest");
var parser = Java.type("nohorjo.centsa.importer.JSCSVParser");

function sleep() {
	java.lang.Thread.sleep(parser.WATCH_SLEEP);
}

while (test.wait) {
	sleep();
}

test.assertParams.call([ $records, "java.util.ArrayList$ListItr" ]);
test.assertParams
		.call([ $accounts, "nohorjo.centsa.importer.AccountsInterface" ]);
test.assertParams.call([ $transactions,
		"nohorjo.centsa.importer.TransactionsInterface" ]);
test.assertParams.call([ $types, "nohorjo.centsa.importer.TypesInterface" ]);
test.assertParams
		.call([ $expenses, "nohorjo.centsa.importer.ExpensesInterface" ]);

for (var i = 0; i < 10; i++) {
	sleep();
	test.assertProcessed.call(i);
	$records.next();
}
