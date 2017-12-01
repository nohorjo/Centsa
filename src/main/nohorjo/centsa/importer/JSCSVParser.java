package nohorjo.centsa.importer;

import java.io.IOException;
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

import nohorjo.util.ThreadExecutor;

/**
 * Class to parse CSV files
 * 
 * @author muhammed.haque
 *
 */
public class JSCSVParser {

	private ScriptEngine engine = new ScriptEngineManager().getEngineByName("nashorn");
	private int processed;
	private int total;
	
	public static int WATCH_SLEEP = 200;

	protected boolean inProgress;

	/**
	 * Parse the CSV file
	 * 
	 * @param csv
	 *            The CSV
	 * @param rule
	 *            The rule js
	 * @throws ScriptException
	 * @throws NoSuchMethodException
	 * @throws IOException
	 */
	public void parse(String csv, String rule) throws ScriptException, NoSuchMethodException, IOException {
		inProgress = true;
		try (Reader r = new StringReader(csv)) {
			// Load the CSV
			List<CSVRecord> records = CSVFormat.RFC4180.parse(r).getRecords();
			ListIterator<CSVRecord> iterator = records.listIterator();
			total = records.size();
			watchProgress(iterator);
			// Create and invoke the function with the JavaScript interfaces and CSV record
			// iterator
			engine.eval(
					String.format("function parse($records, $accounts, $transactions, $types, $expenses) {%s}", rule));
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
		ThreadExecutor.start(() -> {
			while (processed < total) {
				try {
					Thread.sleep(WATCH_SLEEP);
				} catch (InterruptedException e) {
				}
				processed = iterator.nextIndex();
			}
		});
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
