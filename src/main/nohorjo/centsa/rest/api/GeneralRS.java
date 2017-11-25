package nohorjo.centsa.rest.api;

import java.io.File;
import java.io.IOException;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.MediaType;

import org.apache.commons.io.FileUtils;
import org.glassfish.jersey.internal.inject.PerLookup;

import javafx.stage.FileChooser.ExtensionFilter;
import nohorjo.centsa.datahandlers.Budget;
import nohorjo.centsa.datahandlers.BudgetHandler;
import nohorjo.centsa.dbservices.ExpensesDAO;
import nohorjo.centsa.dbservices.TransactionsDAO;
import nohorjo.centsa.importer.JSCSVParser;
import nohorjo.centsa.properties.SystemProperties;
import nohorjo.centsa.render.Renderer;
import nohorjo.centsa.rest.AbstractRS;
import nohorjo.centsa.updater.UpdateChecker;
import nohorjo.centsa.updater.UpdateInfo;
import nohorjo.centsa.vo.Expense;
import nohorjo.util.ThreadExecutor;

/**
 * REST service for others
 * 
 * @author muhammed.haque
 *
 */
@PerLookup
@Path("/general")
public class GeneralRS extends AbstractRS {

	private TransactionsDAO tDao = new TransactionsDAO();
	private ExpensesDAO eDao = new ExpensesDAO();
	private static JSCSVParser parser = new JSCSVParser();

	/**
	 * Calculates budget
	 * 
	 * @param strict
	 * 
	 * @return The budgets considering expenses
	 * @throws SQLException
	 */
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	@Path("/budget")
	public Budget getBudget(@QueryParam("strict") boolean strict) throws SQLException {
		List<Expense> es = eDao.getAll(0, 0, null);
		int sumAll = -tDao.sumAll();

		return BudgetHandler.getBudget(strict, es, sumAll);
	}

	/**
	 * Signals the application to open a filechooser to select a CSV to parse
	 * 
	 * @param rule
	 *            The rule to parse with
	 * @throws IOException
	 */
	@GET
	@Path("/import")
	public void importFile(@QueryParam("rule") String rule) throws IOException {
		if (parser.isInProgress()) { // Only allow one parsing at a time to relieve the DB
			throw new IOException("Parsing already in progress");
		}

		Renderer.showFileChooser("Open CSV spreadsheet", new File(System.getProperty("user.home")), (selectedFile) -> {
			if (selectedFile != null) {
				ThreadExecutor.start(() -> {
					try {
						parser.parse(FileUtils.readFileToString(selectedFile), rule);
						Renderer.showAlert("Import complete!");
					} catch (Exception ex) {
						Renderer.showExceptionDialog(ex, "Import error", "Could not import CSV");
						throw new RuntimeException(ex);
					}
				});
			}
		}, new ExtensionFilter("CSV spreadsheets", "*.csv"));
	}

	/**
	 * Gets the progress of a running parser
	 * 
	 * @return The count of the records read and the total number of records
	 */
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	@Path("/import/progress")
	public Map<String, Integer> importProgress() {
		Map<String, Integer> rtn = null;
		if (parser.isInProgress()) {
			rtn = new HashMap<>();
			rtn.put("processed", parser.getProcessed());
			rtn.put("total", parser.getTotal());
		}
		return rtn;
	}

	/**
	 * Gets a list of layouts
	 * 
	 * @return An list of layouts
	 */
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	@Path("/layouts")
	public List<String> getLayouts() {
		File layoutDir = FileUtils.getFile(SystemProperties.get("root.dir", String.class) + "/layout");
		List<String> layouts = new ArrayList<>();
		for (File d : layoutDir.listFiles((d) -> d.isDirectory() // Only interested in directories
		)) {
			layouts.add(d.getName());
		}
		return layouts;
	}

	/**
	 * Gets a list of parser rules
	 * 
	 * @return A list of parser rules
	 */
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	@Path("/rules")
	public List<String> getRules() {
		File rulesDir = FileUtils.getFile(SystemProperties.get("root.dir", String.class) + "/rules");
		List<String> rules = new ArrayList<>();
		for (File d : rulesDir.listFiles((d) -> d.getName().endsWith(".js")// Only interested in JavaScript files
		)) {
			rules.add(d.getName().replaceAll("\\.js$", ""));
		}
		return rules;
	}

	/**
	 * Gets the current version
	 * 
	 * @return The current version
	 * @throws IOException
	 */
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	@Path("/version")
	public String getVersion() throws IOException {
		return UpdateChecker.getCurrentVersion();
	}

	/**
	 * Checks for any updates
	 * 
	 * @return Info on the latest version or <code>null</code> if this is the latest
	 * @throws IOException
	 */
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	@Path("/update")
	public void checkUpdate() {
		try {
			UpdateInfo info = UpdateChecker.checkNewVersion();
			if (info != null) {
				UpdateChecker.requestUpdate(info);
			} else {
				Renderer.showAlert("You have the latest version!");
			}
		} catch (IOException e) {
			e.printStackTrace();
			Renderer.showExceptionDialog(e, "Network error", "Failed to check for updates");
		}
	}

	public void set(ExpensesDAO eDao, TransactionsDAO tDao) {
		this.eDao = eDao;
		this.tDao = tDao;
	}

	public static void setParser(JSCSVParser parser) {
		GeneralRS.parser = parser;
	}

}
