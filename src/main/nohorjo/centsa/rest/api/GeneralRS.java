package nohorjo.centsa.rest.api;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
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

import org.glassfish.jersey.internal.inject.PerLookup;

import javafx.application.Platform;
import javafx.scene.control.Alert;
import javafx.scene.control.Alert.AlertType;
import javafx.stage.FileChooser;
import javafx.stage.FileChooser.ExtensionFilter;
import nohorjo.centsa.Main;
import nohorjo.centsa.dbservices.ExpensesDAO;
import nohorjo.centsa.dbservices.TransactionsDAO;
import nohorjo.centsa.importer.JSCSVParser;
import nohorjo.centsa.properties.SystemProperties;
import nohorjo.centsa.render.Renderer;
import nohorjo.centsa.rest.AbstractRS;
import nohorjo.centsa.updater.UpdateChecker;
import nohorjo.centsa.updater.UpdateInfo;
import nohorjo.centsa.vo.Expense;

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
	private static JSCSVParser parser;

	/**
	 * Calculates budget
	 * 
	 * @param strict
	 *            If true will round expenses
	 * @return The budgets considering expenses
	 * @throws SQLException
	 */
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	@Path("/budget")
	public Map<String, Integer> getBudget(@QueryParam("strict") boolean strict) throws SQLException {
		Map<String, Integer> rtn = new HashMap<>();
		List<Expense> es = eDao.getAll(0, 0, null);
		int sumAll = -tDao.sumAll();

		int autoExpenseReduction = sumAll;
		int allExpenseReduction = sumAll;

		for (Expense e : es) {
			// Only ones that have started
			if (e.getId() != 1 && e.getStarted() <= System.currentTimeMillis()) {
				double expectedInstances = e.get_expected_instances_count();
				double leftToTransfer = expectedInstances - e.getInstance_count();
				if (leftToTransfer < 0) {
					leftToTransfer = 0;
				}
				if (e.getCost() < 0) {
					// If cost is negative (is income) then we floor it so as to assume the money
					// isn't in yet.
					leftToTransfer = Math.floor(leftToTransfer);
				} else if (strict) {
					// If it's positive we ceiling it so that we're 'saving' the money.
					leftToTransfer = Math.ceil(leftToTransfer);
				}
				double cost = leftToTransfer * e.getCost();
				if (e.isAutomatic()) {
					autoExpenseReduction -= cost;
				}
				allExpenseReduction -= cost;
			}
		}

		rtn.put("afterAuto", autoExpenseReduction);
		rtn.put("afterAll", allExpenseReduction);

		return rtn;
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
		if (parser != null) { // Only allow one parsing at a time to relieve the DB
			throw new IOException("Parsing already in progress");
		}
		Platform.runLater(() -> {
			FileChooser fileChooser = new FileChooser();
			fileChooser.setTitle("Open CSV spreadsheet");
			fileChooser.getExtensionFilters().addAll(new ExtensionFilter("CSV spreadsheets", "*.csv"));
			fileChooser.setInitialDirectory(new File(System.getProperty("user.home")));
			File selectedFile = fileChooser.showOpenDialog(Main.getStage());

			if (selectedFile != null) {
				parser = new JSCSVParser();
				new Thread(() -> {
					try {
						parser.parse(new String(Files.readAllBytes(Paths.get(selectedFile.getAbsolutePath()))), rule);
						parser = null;
						Platform.runLater(() -> {
							Alert alert = new Alert(AlertType.INFORMATION);
							alert.setTitle("");
							alert.setHeaderText("");
							alert.setContentText("Import complete!");
							alert.show();
						});
					} catch (Exception ex) {
						Renderer.showExceptionDialog(ex, "Import error", "Could not import CSV");
						throw new Error(ex);
					}
				}).start();
			}
		});
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
		if (parser != null) {
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
		File layoutDir = new File(SystemProperties.get("root.dir", String.class) + "/layout");
		List<String> layouts = new ArrayList<>();
		for (File d : layoutDir.listFiles((d) -> {
			return d.isDirectory(); // Only interested in directories
		})) {
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
		File rulesDir = new File(SystemProperties.get("root.dir", String.class) + "/rules");
		List<String> rules = new ArrayList<>();
		for (File d : rulesDir.listFiles((d) -> {
			return d.getName().endsWith(".js");// Only interested in JavaScript files
		})) {
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
		UpdateInfo info;
		try {
			info = UpdateChecker.checkNewVersion();
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

}