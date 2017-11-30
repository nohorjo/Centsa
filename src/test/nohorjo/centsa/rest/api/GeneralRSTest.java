package nohorjo.centsa.rest.api;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;

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
import org.apache.commons.lang.RandomStringUtils;
import org.apache.commons.lang.math.RandomUtils;
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
import nohorjo.centsa.dbservices.mock.MockExpensesDAO;
import nohorjo.centsa.dbservices.mock.MockTransactionsDAO;
import nohorjo.centsa.importer.JSCSVParser;
import nohorjo.centsa.properties.SystemProperties;
import nohorjo.centsa.render.Renderer;
import nohorjo.centsa.updater.UpdateChecker;
import nohorjo.centsa.updater.UpdateInfo;
import nohorjo.centsa.vo.Expense;
import nohorjo.util.ClasspathUtils;
import nohorjo.util.Procedure;
import nohorjo.util.ThreadExecutor;

/**
 * Test class for {@link GeneralRS}
 * 
 * @author muhammed
 *
 */
@RunWith(PowerMockRunner.class)
@PrepareForTest({ BudgetHandler.class, Renderer.class, FileUtils.class, ThreadExecutor.class, SystemProperties.class,
		UpdateChecker.class, ClasspathUtils.class })
@SuppressStaticInitializationFor({ "nohorjo.centsa.dbservices.AbstractDAO", "nohorjo.centsa.render.Renderer",
		"nohorjo.centsa.properties.SystemProperties", "nohorjo.centsa.updater.UpdateChecker" })
@SuppressWarnings("serial")
public class GeneralRSTest {

	private static final int AFTER_ALL = RandomUtils.nextInt(), AFTER_AUTO = RandomUtils.nextInt(),
			PROCESSED = RandomUtils.nextInt(), TOTAL = RandomUtils.nextInt(), MAJOR = RandomUtils.nextInt(),
			MINOR = RandomUtils.nextInt();
	private static final String CSV = RandomStringUtils.randomAlphabetic(10),
			RULE = RandomStringUtils.randomAlphabetic(10), DIR_NAME = RandomStringUtils.randomAlphabetic(10),
			FILE_NAME = RandomStringUtils.randomAlphabetic(10), VERSION = RandomStringUtils.randomAlphabetic(10),
			ASSET = RandomStringUtils.randomAlphabetic(10), CHANGELOG = RandomStringUtils.randomAlphabetic(10);
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
			return RandomStringUtils.randomAlphabetic(10);
		};
	} };

	private Boolean strictCheck, passed, doThrow, doThrow2;
	private JSCSVParser parser;
	private File selectedFile;
	private String alertMessage;
	private Exception thrown;
	private UpdateInfo update;

	@SuppressWarnings("unchecked")
	@Before
	public void init() throws Exception {
		PowerMockito.mockStatic(BudgetHandler.class, Renderer.class, ThreadExecutor.class, FileUtils.class,
				SystemProperties.class, UpdateChecker.class, ClasspathUtils.class);

		PowerMockito.when(BudgetHandler.getBudget(any(Boolean.class), any(), any(Integer.class))).then((i) -> {
			assertEquals(strictCheck, i.getArgument(0));
			assertEquals(MockExpensesDAO.EXPENSE, ((List<Expense>) i.getArgument(1)).get(0));
			assertEquals(MockTransactionsDAO.SUM, -((int) i.getArgument(2)));

			Budget b = new Budget();
			b.setAfterAll(AFTER_ALL);
			b.setAfterAuto(AFTER_AUTO);

			return b;
		});

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
		PowerMockito
				.when(Renderer.class, "showExceptionDialog", any(Exception.class), any(String.class), any(String.class))
				.then((i) -> {
					thrown = i.getArgument(0);
					return null;
				});

		PowerMockito.when(ThreadExecutor.start(any(Runnable.class))).then((i) -> {
			// Force single threaded operation
			Object lambda = i.getArguments()[0];
			lambda.getClass().getMethod("run").invoke(lambda);
			return null;
		});

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

		PowerMockito.when(SystemProperties.get(anyString(), any(Class.class))).then((i) -> {
			return null;
		});

		PowerMockito.when(UpdateChecker.getCurrentVersion()).then((i) -> {
			if (doThrow)
				throw new IOException();
			return VERSION;
		});
		PowerMockito.when(UpdateChecker.checkNewVersion()).then((i) -> {
			if (doThrow)
				throw new IOException("checkNewVersion");
			return update;
		});
		PowerMockito.when(UpdateChecker.class, "requestUpdate", any(UpdateInfo.class)).then((i) -> {
			UpdateInfo info = i.getArgument(0);
			assertEquals(ASSET, info.getAsset());
			assertEquals(CHANGELOG, info.getChangelog());
			assertEquals(MAJOR, info.getMajorVersion());
			assertEquals(MINOR, info.getMinorVersion());
			if (doThrow2)
				throw new IOException("requestUpdate");
			passed = true;
			return null;
		});

		PowerMockito.when(ClasspathUtils.getFileAsString(any(String.class))).thenReturn(RULE);

		GeneralRS.setParser(parser = new JSCSVParser() {

			@Override
			public void parse(String csv, String rule) throws ScriptException, NoSuchMethodException, IOException {
				passed = true;
				assertEquals(RULE, rule);
				assertEquals(CSV, csv);
				if (doThrow)
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
		passed = doThrow = doThrow2 = false;
		alertMessage = null;
		thrown = null;
		update = new UpdateInfo();
		update.setAsset(ASSET);
		update.setChangelog(CHANGELOG);
		update.setMajorVersion(MAJOR);
		update.setMinorVersion(MINOR);
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
		assertFalse(passed);
	}

	@Test
	public void importFile_parses() throws IOException {
		selectedFile = new File(".");
		new GeneralRS().importFile(RULE);
		assertTrue(passed);
		assertEquals("Import complete!", alertMessage);
	}

	@Test(expected = RuntimeException.class)
	public void importFile_errorParsing() throws IOException {
		doThrow = true;
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
		List<String> rules = new GeneralRS().getRules();
		assertEquals(1, rules.size());
		assertEquals(FILE_NAME, rules.get(0));
	}

	@Test
	public void getVersion_returns() throws IOException {
		assertEquals(VERSION, new GeneralRS().getVersion());
	}

	@Test(expected = IOException.class)
	public void getVersion_throws() throws IOException {
		doThrow = true;
		assertEquals(VERSION, new GeneralRS().getVersion());
	}

	@Test
	public void checkUpdate_updateAvailable() {
		new GeneralRS().checkUpdate();
		assertTrue(passed);
	}

	@Test
	public void checkUpdate_noUpdate() {
		update = null;
		new GeneralRS().checkUpdate();
		assertEquals("You have the latest version!", alertMessage);
	}

	@Test
	public void checkUpdate_checkThrows() {
		doThrow = true;
		new GeneralRS().checkUpdate();
		assertEquals(thrown.getMessage(), "checkNewVersion");
	}

	@Test
	public void checkUpdate_updateThrows() {
		doThrow2 = true;
		new GeneralRS().checkUpdate();
		assertEquals(thrown.getMessage(), "requestUpdate");
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
