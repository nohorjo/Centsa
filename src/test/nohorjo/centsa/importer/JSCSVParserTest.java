package nohorjo.centsa.importer;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

import java.io.IOException;

import javax.script.ScriptException;

import org.apache.commons.lang.RandomStringUtils;
import org.apache.commons.lang.math.RandomUtils;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.powermock.core.classloader.annotations.PrepareForTest;
import org.powermock.core.classloader.annotations.SuppressStaticInitializationFor;
import org.powermock.modules.junit4.PowerMockRunner;

import nohorjo.centsa.dbservices.AbstractDAO;
import nohorjo.util.ClasspathUtils;
import nohorjo.util.Procedure;
import nohorjo.util.ThreadExecutor;

@RunWith(PowerMockRunner.class)
@PrepareForTest(AbstractDAO.class)
@SuppressStaticInitializationFor("nohorjo.centsa.dbservices.AbstractDAO")
public class JSCSVParserTest {

	private static JSCSVParser parser;

	public static boolean wait;

	public static Procedure<Double> assertProgress = (i) -> {
		assertEquals(i, parser.getProcessed(), 0);
	};

	private Throwable thrown;

	@Before
	public void init() {
		parser = new JSCSVParser();
		wait = false;
		thrown = null;
	}

	@Test
	public void getTotal_returns() throws NoSuchMethodException, ScriptException, IOException {
		final int rows = RandomUtils.nextInt(100);
		String csv = getCSV(rows);
		parser.parse(csv, "");

		assertEquals(rows, parser.getTotal());
	}

	@Test(expected = IllegalAccessError.class)
	public void setInProgress_illegal() {
		parser.setInProgress(RandomUtils.nextBoolean());
	}

	@Test
	public void isInProgress_progressStatus() throws Throwable {
		assertFalse(parser.isInProgress());
		wait = true;

		ThreadExecutor.start(() -> {
			try {
				parser.parse(getCSV(RandomUtils.nextInt(100) + 10), ClasspathUtils.getFileAsString("test.js"));
			} catch (Exception e) {
				thrown = e;
			}
		});
		Thread.sleep(500);
		assertTrue(parser.isInProgress());
		wait = false;
		Thread.sleep(500);

		assertFalse(parser.isInProgress());
		if (thrown != null) {
			throw thrown;
		}
	}

	private String getCSV(final int rows) {
		StringBuilder csv = new StringBuilder();
		for (int i = 0; i < rows; i++) {
			csv.append(RandomStringUtils.randomAlphabetic(10) + "\n");
		}
		return csv.toString();
	}
}
