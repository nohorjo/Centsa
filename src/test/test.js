var test = Java.type("nohorjo.centsa.importer.JSCSVParserTest");

while (test.wait) {
	java.lang.Thread.sleep(200);
}

var i = 0;

for (var j = 0; j < 10; j++) {
	test.assertProgress.call(i++);
	$records.next();
}