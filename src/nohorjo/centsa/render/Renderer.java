package nohorjo.centsa.render;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.sun.javafx.webkit.WebConsoleListener;

import javafx.geometry.HPos;
import javafx.geometry.VPos;
import javafx.scene.control.Alert;
import javafx.scene.control.Alert.AlertType;
import javafx.scene.layout.Region;
import javafx.scene.web.WebEngine;
import javafx.scene.web.WebEvent;
import javafx.scene.web.WebView;
import nohorjo.centsa.properties.SystemProperties;
import nohorjo.centsa.server.EmbeddedServer;

public class Renderer extends Region {

	private static final int MIN_WIDTH = 1000;
	private static final int MIN_HEIGHT = 500;
	private final Logger log = LoggerFactory.getLogger(Renderer.class);
	private final Logger console = LoggerFactory.getLogger("Console");

	private final WebView browser = new WebView();
	private final WebEngine webEngine = browser.getEngine();

	public Renderer() {
		String url = SystemProperties.get("server.root", String.class) + "core/ui.html?" + EmbeddedServer.UNIQUE_KEY;
		log.info("UI available at {}", url);

		webEngine.load(url);

		webEngine.setOnAlert((WebEvent<String> wEvent) -> {
			Alert alert = new Alert(AlertType.INFORMATION);
			alert.setTitle("");
			alert.setHeaderText("");
			alert.setContentText(wEvent.getData());

			alert.showAndWait();
		});

		WebConsoleListener.setDefaultListener((WebView webView, String message, int lineNumber, String sourceId) -> {
			console.warn("[{}:{}] {}", sourceId, lineNumber, message);
		});

		getChildren().add(browser);
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
		return width > MIN_WIDTH ? width : MIN_WIDTH;
	}

	@Override
	protected double computePrefHeight(double width) {
		Double height = SystemProperties.get("height", Double.class);
		return height > MIN_HEIGHT ? height : MIN_HEIGHT;
	}
}