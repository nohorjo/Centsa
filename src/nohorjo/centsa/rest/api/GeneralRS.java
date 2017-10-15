package nohorjo.centsa.rest.api;

import java.io.File;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.sql.SQLException;
import java.util.List;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.QueryParam;

import javafx.application.Platform;
import javafx.scene.control.Alert;
import javafx.scene.control.Alert.AlertType;
import javafx.scene.control.Label;
import javafx.scene.control.TextArea;
import javafx.scene.layout.GridPane;
import javafx.scene.layout.Priority;
import javafx.stage.FileChooser;
import javafx.stage.FileChooser.ExtensionFilter;
import nohorjo.centsa.Main;
import nohorjo.centsa.dbservices.ExpensesDAO;
import nohorjo.centsa.dbservices.TransactionsDAO;
import nohorjo.centsa.importer.JSCSVParser;
import nohorjo.centsa.properties.SystemProperties;
import nohorjo.centsa.vo.Expense;

@Path("/general")
public class GeneralRS {

	private TransactionsDAO tDao = new TransactionsDAO();
	private ExpensesDAO eDao = new ExpensesDAO();

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
	public void importFile(@QueryParam("rule") String rule) {
		Platform.runLater(() -> {
			FileChooser fileChooser = new FileChooser();
			fileChooser.setTitle("Open CSV spreadsheet");
			fileChooser.getExtensionFilters().addAll(new ExtensionFilter("CSV spreadsheets", "*.csv"));
			fileChooser.setInitialDirectory(new File(System.getProperty("user.home")));
			File selectedFile = fileChooser.showOpenDialog(Main.getStage());

			if (selectedFile != null) {
				new Thread(() -> {
					try {
						new JSCSVParser()
								.parse(new String(Files.readAllBytes(Paths.get(selectedFile.getAbsolutePath()))), rule);
						Platform.runLater(() -> {
							Alert alert = new Alert(AlertType.INFORMATION);
							alert.setTitle("");
							alert.setHeaderText("");
							alert.setContentText("Import complete!");
							alert.show();
						});
					} catch (Exception ex) {
						Platform.runLater(() -> {
							Alert alert = new Alert(AlertType.ERROR);
							alert.setTitle("Import error");
							alert.setHeaderText("Could not import CSV");
							alert.setContentText(ex.getMessage());
							alert.setResizable(true);

							StringWriter sw = new StringWriter();
							PrintWriter pw = new PrintWriter(sw);
							ex.printStackTrace(pw);
							String exceptionText = sw.toString();

							Label label = new Label("The exception stacktrace was:");

							TextArea textArea = new TextArea(exceptionText);
							textArea.setEditable(false);
							textArea.setWrapText(true);

							textArea.setMaxWidth(Double.MAX_VALUE);
							textArea.setMaxHeight(Double.MAX_VALUE);
							GridPane.setVgrow(textArea, Priority.ALWAYS);
							GridPane.setHgrow(textArea, Priority.ALWAYS);

							GridPane expContent = new GridPane();
							expContent.setMaxWidth(Double.MAX_VALUE);
							expContent.add(label, 0, 0);
							expContent.add(textArea, 0, 1);

							alert.getDialogPane().setExpandableContent(expContent);

							alert.show();
						});
						throw new Error(ex);
					}
				}).start();
			}
		});
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