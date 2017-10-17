package nohorjo.centsa.rest.api;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.sql.SQLException;
import java.util.List;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.QueryParam;

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
import nohorjo.centsa.vo.Expense;

@PerLookup
@Path("/general")
public class GeneralRS extends AbstractRS {

	private TransactionsDAO tDao = new TransactionsDAO();
	private ExpensesDAO eDao = new ExpensesDAO();
	private static JSCSVParser parser;

	@GET
	@Path("/budget")
	public int getBudget() throws SQLException {
		int sumNonAuto = tDao.sumNonAutoExpenseAmount();
		List<Expense> autoExpenses = eDao.getAllAuto();
		int totalAuto = 0;

		for (Expense e : autoExpenses) {
			int durationDays = (int) (((e.getEnded() == null ? System.currentTimeMillis() : e.getEnded())
					- e.getStarted()) / 8.64e+7 + 0.5);
			int instances = durationDays / e.getFrequency_days();
			totalAuto += instances * e.getCost();
		}

		return -totalAuto - sumNonAuto;
	}

	@GET
	@Path("/import")
	public void importFile(@QueryParam("rule") String rule) throws IOException {
		if (parser != null) {
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

	@GET
	@Path("/import/progress")
	public String importProgress() {
		if (parser != null) {
			return String.format("{\"processed\":%d,\"total\":%d}", parser.getProcessed(), parser.getTotal());
		}
		return "null";
	}

	@GET
	@Path("/layouts")
	public String getLayouts() {
		File layoutDir = new File(SystemProperties.get("root.dir", String.class) + "/layout");
		String layoutsJson = "[";
		for (File d : layoutDir.listFiles((d) -> {
			return d.isDirectory();
		})) {
			layoutsJson += String.format("\"%s\",", d.getName());
		}
		layoutsJson = layoutsJson.replaceAll(",$", "]");
		return layoutsJson;
	}

	@GET
	@Path("/rules")
	public String getRules() {
		File rulesDir = new File(SystemProperties.get("root.dir", String.class) + "/rules");
		String rulesJson = "[";
		for (File d : rulesDir.listFiles((d) -> {
			return d.getName().endsWith(".js");
		})) {
			rulesJson += String.format("\"%s\",", d.getName().replaceAll("\\.js$", ""));
		}
		rulesJson = rulesJson.replaceAll(",$", "]");
		return rulesJson;
	}

}
