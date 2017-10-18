package nohorjo.centsa.render;

import java.awt.Toolkit;
import java.io.PrintWriter;
import java.io.StringWriter;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.sun.javafx.webkit.WebConsoleListener;

import javafx.application.Platform;
import javafx.geometry.HPos;
import javafx.geometry.VPos;
import javafx.scene.control.Alert;
import javafx.scene.control.Alert.AlertType;
import javafx.scene.control.Label;
import javafx.scene.control.TextArea;
import javafx.scene.layout.GridPane;
import javafx.scene.layout.Priority;
import javafx.scene.layout.Region;
import javafx.scene.web.WebEngine;
import javafx.scene.web.WebView;
import nohorjo.centsa.properties.SystemProperties;
import nohorjo.centsa.server.EmbeddedServer;

public class Renderer extends Region {

	private static final int MIN_WIDTH = 1000;
	private static final int MIN_HEIGHT = 500;
	private static final double MAX_HEIGHT = Toolkit.getDefaultToolkit().getScreenSize().getHeight();
	private static final double MAX_WIDTH = Toolkit.getDefaultToolkit().getScreenSize().getWidth();
	private final Logger log = LoggerFactory.getLogger(Renderer.class);

	private final WebView browser = new WebView();
	private final WebEngine webEngine = browser.getEngine();

	public Renderer() {
		String url = SystemProperties.get("server.root", String.class) + "core/ui.html?" + EmbeddedServer.UNIQUE_KEY;
		log.info("UI available at {}", url);

		webEngine.load(url);

		webEngine.setOnAlert((wEvent) -> {
			Alert alert = new Alert(AlertType.INFORMATION);
			alert.setTitle("");
			alert.setHeaderText("");
			alert.setContentText(wEvent.getData());

			alert.showAndWait();
		});

		WebConsoleListener.setDefaultListener((WebView webView, String message, int lineNumber, String sourceId) -> {
			LoggerFactory.getLogger(sourceId + ":" + lineNumber).warn(message);
		});

		getChildren().add(browser);
	}

	public static void showExceptionDialog(Throwable ex, String title, String header) {
		Platform.runLater(() -> {
			Alert alert = new Alert(AlertType.ERROR);
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