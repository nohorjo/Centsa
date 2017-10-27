package nohorjo.centsa.render;

import java.awt.Toolkit;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.Map;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.sun.javafx.webkit.WebConsoleListener;

import javafx.application.Platform;
import javafx.geometry.HPos;
import javafx.geometry.VPos;
import javafx.scene.control.Alert;
import javafx.scene.control.Alert.AlertType;
import javafx.scene.control.ButtonBar.ButtonData;
import javafx.scene.image.Image;
import javafx.scene.control.ButtonType;
import javafx.scene.control.Label;
import javafx.scene.control.TextArea;
import javafx.scene.layout.GridPane;
import javafx.scene.layout.Priority;
import javafx.scene.layout.Region;
import javafx.scene.web.WebEngine;
import javafx.scene.web.WebView;
import javafx.stage.Stage;
import nohorjo.centsa.properties.SystemProperties;
import nohorjo.centsa.server.EmbeddedServer;

/**
 * {@link Region} that provides a {@link WebView} to render the UI
 * 
 * @author muhammed.haque
 *
 */
public class Renderer extends Region {

	private static final int MIN_WIDTH = 1000;
	private static final int MIN_HEIGHT = 500;
	// To not exceed screen resolution
	private static final double MAX_HEIGHT = Toolkit.getDefaultToolkit().getScreenSize().getHeight();
	private static final double MAX_WIDTH = Toolkit.getDefaultToolkit().getScreenSize().getWidth();

	private static final Image ICON = new Image(ClassLoader.getSystemResourceAsStream("icon.png"));

	private final Logger log = LoggerFactory.getLogger(Renderer.class);

	private final WebView browser = new WebView();
	private final WebEngine webEngine = browser.getEngine();

	public Renderer(Stage stage) {
		String url = SystemProperties.get("server.root", String.class) + "core/ui.html?" + EmbeddedServer.UNIQUE_KEY;
		log.info("UI available at {}", url);

		// Load the url in the webview
		webEngine.load(url);

		// Show javafx alert on window.alert()
		webEngine.setOnAlert((wEvent) -> {
			showAlert(wEvent.getData());
		});

		// Log all console messages
		WebConsoleListener.setDefaultListener((WebView webView, String message, int lineNumber, String sourceId) -> {
			LoggerFactory.getLogger(sourceId + ":" + lineNumber).warn(message);
		});

		getChildren().add(browser);

		stage.setTitle("Centsa");
		stage.getIcons().add(ICON);
		stage.show();
	}

	/**
	 * Show a javafx alert
	 * 
	 * @param message
	 *            The message in the alert
	 */
	public static void showAlert(String message) {
		Platform.runLater(() -> {
			Alert alert = new Alert(AlertType.INFORMATION);
			((Stage) alert.getDialogPane().getScene().getWindow()).getIcons().add(ICON);
			alert.setTitle("");
			alert.setHeaderText("");
			alert.setContentText(message);

			alert.show();
		});
	}

	/**
	 * Show a javafx confirmation dialog
	 * 
	 * @param title
	 *            The title of the dialog
	 * @param header
	 *            The header of the dialog
	 * @param body
	 *            The body of the dialog
	 * @param buttons
	 *            Map of button names to their click handlers
	 * @param extraInfo
	 *            Extra info to show in expandable section
	 */
	public static void showConfirm(String title, String header, String body, Map<String, Runnable> buttons,
			String extraInfo) {
		Platform.runLater(() -> {
			Alert alert = new Alert(AlertType.CONFIRMATION);
			((Stage) alert.getDialogPane().getScene().getWindow()).getIcons().add(ICON);
			alert.setTitle(title);
			alert.setHeaderText(header);
			alert.setContentText(body);
			alert.getButtonTypes().setAll();

			for (String button : buttons.keySet()) {
				alert.getButtonTypes().add(new ButtonType(button));
			}
			alert.getButtonTypes().add(new ButtonType("Cancel", ButtonData.CANCEL_CLOSE));
			buttons.put("Cancel", () -> {
			});

			if (extraInfo != null) {
				TextArea textArea = new TextArea(extraInfo);
				textArea.setEditable(false);
				textArea.setWrapText(true);

				textArea.setMaxWidth(Double.MAX_VALUE);
				textArea.setMaxHeight(Double.MAX_VALUE);
				GridPane.setVgrow(textArea, Priority.ALWAYS);
				GridPane.setHgrow(textArea, Priority.ALWAYS);

				GridPane expContent = new GridPane();
				expContent.setMaxWidth(Double.MAX_VALUE);
				expContent.add(textArea, 0, 0);
				alert.getDialogPane().setExpandableContent(expContent);
			}

			Optional<ButtonType> result = alert.showAndWait();
			buttons.get(result.get().getText()).run();
		});
	}

	/**
	 * Show javafx alert with the exception
	 * 
	 * @param ex
	 *            The exception
	 * @param title
	 *            The title of the alert
	 * @param header
	 *            The header of the alert
	 */
	public static void showExceptionDialog(Throwable ex, String title, String header) {
		Platform.runLater(() -> {
			Alert alert = new Alert(AlertType.ERROR);
			((Stage) alert.getDialogPane().getScene().getWindow()).getIcons().add(ICON);
			alert.setTitle(title);
			alert.setHeaderText(header);
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
	}

	@Override
	protected void layoutChildren() {
		double w = getWidth();
		double h = getHeight();
		// Persist dimensions
		SystemProperties.set("width", w);
		SystemProperties.set("height", h);
		layoutInArea(browser, 0, 0, w, h, 0, HPos.CENTER, VPos.CENTER);
	}

	@Override
	protected double computePrefWidth(double height) {
		Double width = SystemProperties.get("width", Double.class);
		return width > MIN_WIDTH ? width < MAX_WIDTH ? width : MAX_WIDTH : MIN_WIDTH;
	}

	@Override
	protected double computePrefHeight(double width) {
		Double height = SystemProperties.get("height", Double.class);
		return height > MIN_HEIGHT ? height < MAX_HEIGHT ? height : MAX_HEIGHT : MIN_HEIGHT;
	}
}