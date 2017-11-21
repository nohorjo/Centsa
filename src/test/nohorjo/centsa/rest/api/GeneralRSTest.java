package nohorjo.centsa.rest.api;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertTrue;
import static org.mockito.ArgumentMatchers.any;

import java.io.File;
import java.io.FileFilter;
import java.io.IOException;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

import javax.script.ScriptException;

import org.apache.commons.io.FileUtils;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.powermock.api.mockito.PowerMockito;
import org.powermock.core.classloader.annotations.PrepareForTest;
import org.powermock.core.classloader.annotations.SuppressStaticInitializationFor;
import org.powermock.modules.junit4.PowerMockRunner;

import javafx.stage.FileChooser.ExtensionFilter;
import nohorjo.centsa.datahandlers.Budget;
import nohorjo.centsa.datahandlers.BudgetHandler;
import nohorjo.centsa.dbservices.mock.DAOOption;
import nohorjo.centsa.dbservices.mock.MockDAO;
import nohorjo.centsa.dbservices.mock.MockExpensesDAO;
import nohorjo.centsa.dbservices.mock.MockTransactionsDAO;
import nohorjo.centsa.importer.JSCSVParser;
import nohorjo.centsa.render.Renderer;
import nohorjo.centsa.vo.Expense;
import nohorjo.util.Procedure;
import nohorjo.util.ThreadExecutor;

/**
 * Test class for {@link GeneralRS}
 * 
 * @author muhammed
 *
 */
@RunWith(PowerMockRunner.class)
@PrepareForTest({ BudgetHandler.class, Renderer.class, FileUtils.class, ThreadExecutor.class })
@SuppressStaticInitializationFor({ "nohorjo.centsa.dbservices.AbstractDAO", "nohorjo.centsa.render.Renderer" })
@SuppressWarnings("serial")
public class GeneralRSTest {

	private static final int AFTER_ALL = MockDAO.random.nextInt(), AFTER_AUTO = MockDAO.random.nextInt(),
			PROCESSED = MockDAO.random.nextInt(), TOTAL = MockDAO.random.nextInt();
	private static final String CSV = Long.toHexString(MockDAO.random.nextLong()),
			RULE = Long.toHexString(MockDAO.random.nextLong()), DIR_NAME = Long.toHexString(MockDAO.random.nextLong()),
			FILE_NAME = Long.toHexString(MockDAO.random.nextLong());
	private static final File[] FILE_LIST = { new File(".") {
		@Override
		public boolean isDirectory() {
			return true;
		};

		@Override
		public String getName() {
			return DIR_NAME;
		};
	}, new File(".") {
		@Override
		public boolean isDirectory() {
			return false;
		};

		@Override
		public String getName() {
			return FILE_NAME + ".js";
		};
	}, new File(".") {
		@Override
		public boolean isDirectory() {
			return false;
		};

		@Override
		public String getName() {
			return Long.toHexString(MockDAO.random.nextLong());
		};
	} };

	private Boolean strictCheck, parsed, parseThrow;
	private JSCSVParser parser;
	private File selectedFile;
	private String alertMessage;

	@SuppressWarnings("unchecked")
	@Before
	public void init() throws Exception {
		PowerMockito.mockStatic(BudgetHandler.class);
		PowerMockito.when(BudgetHandler.getBudget(any(Boolean.class), any(), any(Integer.class))).then((i) -> {
			assertEquals(strictCheck, i.getArgument(0));
			assertEquals(MockExpensesDAO.EXPENSE, ((List<Expense>) i.getArgument(1)).get(0));
			assertEquals(MockTransactionsDAO.SUM, -((int) i.getArgument(2)));

			Budget b = new Budget();
			b.setAfterAll(AFTER_ALL);
			b.setAfterAuto(AFTER_AUTO);

			return b;
		});

		PowerMockito.mockStatic(Renderer.class);
		PowerMockito.when(Renderer.class, "showFileChooser", any(String.class), any(File.class), any(Procedure.class),
				any(ExtensionFilter.class)).then((i) -> {
					Object lambda = i.getArguments()[2];
					ExtensionFilter filter = i.getArgument(3);
					List<String> extensions = filter.getExtensions();

					assertEquals("Open CSV spreadsheet", i.getArgument(0));
					assertEquals(new File(System.getProperty("user.home")), i.getArgument(1));
					assertEquals("CSV spreadsheets", filter.getDescription());
					assertEquals(1, extensions.size());
					assertEquals("*.csv", extensions.get(0));

					lambda.getClass().getMethod("call", Object.class).invoke(lambda, selectedFile);
					return null;
				});
		PowerMockito.when(Renderer.class, "showAlert", any(String.class)).then((i) -> {
			alertMessage = i.getArgument(0);
			return null;
		});

		PowerMockito.mockStatic(ThreadExecutor.class);
		PowerMockito.when(ThreadExecutor.start(any(Runnable.class))).then((i) -> {
			// Force single threaded operation
			Object lambda = i.getArguments()[0];
			lambda.getClass().getMethod("run").invoke(lambda);
			return null;
		});

		PowerMockito.mockStatic(FileUtils.class);
		PowerMockito.when(FileUtils.readFileToString(any(File.class))).then((i) -> {
			return CSV;
		});
		PowerMockito.when(FileUtils.getFile(any(String.class))).then((i) -> {
			return new File(".") {
				@Override
				public File[] listFiles(FileFilter f) {
					List<File> rtn = new ArrayList<>();
					for (File file : FILE_LIST) {
						if (f.accept(file)) {
							rtn.add(file);
						}
					}
					return rtn.toArray(new File[] {});
				}
			};
		});

		GeneralRS.setParser(parser = new JSCSVParser() {
			@Override
			public void parse(String csv, String rule) throws ScriptException, NoSuchMethodException, IOException {
				parsed = true;
				assertEquals(RULE, rule);
				assertEquals(CSV, csv);
				if (parseThrow)
					throw new IOException();
			}

			@Override
			public void setInProgress(boolean inProgress) {
				this.inProgress = inProgress;
			}

			@Override
			public int getProcessed() {
				return PROCESSED;
			}

			@Override
			public int getTotal() {
				return TOTAL;
			}
		});

		selectedFile = null;
		strictCheck = null;
		parsed = parseThrow = false;
		alertMessage = null;
	}

	@Test
	public void getBudget_returns() throws SQLException {
		strictCheck = true;
		Budget b = getRS(DAOOption.FINE, DAOOption.FINE).getBudget(true);
		assertEquals(AFTER_ALL, b.getAfterAll());
		assertEquals(AFTER_AUTO, b.getAfterAuto());

		strictCheck = false;

		b = getRS(DAOOption.FINE, DAOOption.FINE).getBudget(false);
		assertEquals(AFTER_ALL, b.getAfterAll());
		assertEquals(AFTER_AUTO, b.getAfterAuto());
	}

	@Test(expected = SQLException.class)
	public void getBudget_transactionThrows() throws SQLException {
		strictCheck = true;
		getRS(DAOOption.FINE, DAOOption.ERROR).getBudget(true);
	}

	@Test(expected = SQLException.class)
	public void getBudget_expenseThrows() throws SQLException {
		strictCheck = true;
		getRS(DAOOption.ERROR, DAOOption.FINE).getBudget(true);
	}

	@Test
	public void importFile_ignoresNotSelected() throws IOException {
		new GeneralRS().importFile(RULE);
		assertFalse(parsed);
	}

	@Test
	public void importFile_parses() throws IOException {
		selectedFile = new File(".");
		new GeneralRS().importFile(RULE);
		assertTrue(parsed);
		assertEquals("Import complete!", alertMessage);
	}

	@Test(expected = RuntimeException.class)
	public void importFile_errorParsing() throws IOException {
		parseThrow = true;
		selectedFile = new File(".");
		new GeneralRS().importFile(RULE);
	}

	@Test(expected = IOException.class)
	public void importFile_throws() throws IOException {
		parser.setInProgress(true);
		new GeneralRS().importFile(RULE);
	}

	@Test
	public void importProgress_get() {
		parser.setInProgress(true);
		Map<String, Integer> p = new GeneralRS().importProgress();
		assertEquals(TOTAL, (int) p.get("total"));
		assertEquals(PROCESSED, (int) p.get("processed"));
	}

	@Test
	public void importProgress_null() {
		assertNull(new GeneralRS().importProgress());
	}

	@Test
	public void getLayouts_getsDirs() {
		List<String> layouts = new GeneralRS().getLayouts();
		assertEquals(1, layouts.size());
		assertEquals(DIR_NAME, layouts.get(0));
	}

	@Test
	public void getRules_getsJSFiles() {
		List<String> rules = new GeneralRS().getLayouts();
		assertEquals(1, rules.size());
		assertEquals(FILE_NAME, rules.get(0));
	}

	/**
	 * Creates an RS with mocked fields
	 * 
	 * @param eOption
	 *            {@link DAOOption} for expenses
	 * @param tOption
	 *            {@link DAOOption} for transactions
	 * 
	 * @return
	 */
	private GeneralRS getRS(DAOOption eOption, DAOOption tOption) {
		GeneralRS rs = new GeneralRS();
		rs.set(new MockExpensesDAO(eOption) {
			@Override
			public List<Expense> getAll(int page, int pageSize, String orderBy) throws SQLException {
				switch (eOption) {
				case ERROR:
					throw new SQLException();
				case FINE:
					return Arrays.asList(EXPENSE);
				case NONE:
				}
				throw new IllegalStateException("Invalid option: " + eOption);
			}
		}, new MockTransactionsDAO(tOption));
		return rs;
	}
}
