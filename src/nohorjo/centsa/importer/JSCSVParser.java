package nohorjo.centsa.importer;

import java.io.IOException;
import java.io.InputStream;
import java.io.Reader;
import java.io.StringReader;
import java.util.List;
import java.util.ListIterator;

import javax.script.Invocable;
import javax.script.ScriptEngine;
import javax.script.ScriptEngineManager;
import javax.script.ScriptException;

import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVRecord;

public class JSCSVParser {

	private ScriptEngine engine = new ScriptEngineManager(null).getEngineByName("nashorn");
	private int processed;
	private int total;

	public void parse(String csv, String rule) throws ScriptException, NoSuchMethodException, IOException {
		StringBuilder sb = new StringBuilder();
		try (InputStream is = ClassLoader.getSystemResourceAsStream(String.format("rules/%s.js", rule));
				Reader r = new StringReader(csv)) {
			int b;
			while ((b = is.read()) != -1) {
				sb.append((char) b);
			}
			List<CSVRecord> records = CSVFormat.RFC4180.parse(r).getRecords();
			ListIterator<CSVRecord> iterator = records.listIterator();
			total = records.size();
			new Thread(() -> {
				while (processed < total) {
					try {
						Thread.sleep(200);
					} catch (InterruptedException e) {
					}
					processed = iterator.nextIndex();
				}
			}).start();
			engine.eval(String.format("function parse($records, $accounts, $transactions, $types, $expenses) {%s}",
					sb.toString()));
			((Invocable) engine).invokeFunction("parse", iterator, new AccountsInterface(), new TransactionsInterface(),
					new TypesInterface(), new ExpensesInterface());
		}
	}

	public int getProcessed() {
		return processed;
	}

	public int getTotal() {
		return total;
	}

}
