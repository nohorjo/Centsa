package nohorjo.centsa.rest.api;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.sql.SQLException;
import java.util.List;

import javax.ws.rs.GET;
import javax.ws.rs.Path;

import javafx.application.Platform;
import javafx.stage.FileChooser;
import javafx.stage.FileChooser.ExtensionFilter;
import nohorjo.centsa.Main;
import nohorjo.centsa.dbservices.ExpensesDAO;
import nohorjo.centsa.dbservices.TransactionsDAO;
import nohorjo.centsa.importer.Importer;
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
	public void importFile() {
		Platform.runLater(() -> {
			FileChooser fileChooser = new FileChooser();
			fileChooser.setTitle("Open CSV spreadsheet");
			fileChooser.getExtensionFilters().addAll(new ExtensionFilter("CSV spreadsheets", "*.csv"));
			File selectedFile = fileChooser.showOpenDialog(Main.getStage());

			if (selectedFile != null) {
				try {
					Importer imp = (Importer) Class.forName("nohorjo.centsa.importer.CSVImport").newInstance();
					imp.doImport(new String(Files.readAllBytes(Paths.get(selectedFile.getAbsolutePath()))));
				} catch (Exception e) {
					throw new Error(e);
				}
			}
		});
	}
}
