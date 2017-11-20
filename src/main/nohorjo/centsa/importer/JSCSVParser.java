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

/**
 * Class to parse CSV files
 * 
 * @author muhammed.haque
 *
 */
public class JSCSVParser {

	private ScriptEngine engine = new ScriptEngineManager(null).getEngineByName("nashorn");
	private int processed;
	private int total;

	protected boolean inProgress;

	/**
	 * Parse the CSV file
	 * 
	 * @param csv
	 *            The CSV
	 * @param rule
	 *            The rule
	 * @throws ScriptException
	 * @throws NoSuchMethodException
	 * @throws IOException
	 */
	public void parse(String csv, String rule) throws ScriptException, NoSuchMethodException, IOException {
		inProgress = true;
		StringBuilder sb = new StringBuilder();
		try (InputStream is = ClassLoader.getSystemResourceAsStream(String.format("rules/%s.js", rule));
				Reader r = new StringReader(csv)) {
			int b;
			// Load the rule
			while ((b = is.read()) != -1) {
				sb.append((char) b);
			}
			// Load the CSV
			List<CSVRecord> records = CSVFormat.RFC4180.parse(r).getRecords();
			ListIterator<CSVRecord> iterator = records.listIterator();
			total = records.size();
			watchProgress(iterator);
			// Create and invoke the function with the JavaScript interfaces and CSV record
			// iterator
			engine.eval(String.format("function parse($records, $accounts, $transactions, $types, $expenses) {%s}",
					sb.toString()));
			((Invocable) engine).invokeFunction("parse", iterator, new AccountsInterface(), new TransactionsInterface(),
					new TypesInterface(), new ExpensesInterface());
		} finally {
			inProgress = false;
		}
	}

	/**
	 * Gets the number of records read
	 * 
	 * @return The number of records read
	 */
	public int getProcessed() {
		return processed;
	}

	/**
	 * Gets the total number of records in the CSV
	 * 
	 * @return The total number of records in the CSV
	 */
	public int getTotal() {
		return total;
	}

	public boolean isInProgress() {
		return inProgress;
	}

	/**
	 * Starts a new thread to watch the progress of the iterator
	 * 
	 * @param iterator
	 *            The iterator to watch
	 */
	private void watchProgress(ListIterator<CSVRecord> iterator) {
		new Thread(() -> {
			while (processed < total) {
				try {
					Thread.sleep(200);
				} catch (InterruptedException e) {
				}
				processed = iterator.nextIndex();
			}
		}).start();
	}

	/**
	 * Throws an {@link IllegalAccessError}. Can be overridden for testing purposes
	 * 
	 * @param inProgress
	 */
	public void setInProgress(boolean inProgress) {
		throw new IllegalAccessError("Cannot set progress state");
	}
}
