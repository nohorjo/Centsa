package nohorjo.centsa.render;

import javafx.beans.value.ObservableValue;
import javafx.concurrent.Worker.State;
import javafx.geometry.HPos;
import javafx.geometry.VPos;
import javafx.scene.layout.Region;
import javafx.scene.web.WebEngine;
import javafx.scene.web.WebView;
import javafx.stage.Stage;
import netscape.javascript.JSObject;
import nohorjo.centsa.properties.SystemProperties;

public class Renderer extends Region {

	private static final int MIN_WIDTH = 1000;
	private static final int MIN_HEIGHT = 500;

	private final WebView browser = new WebView();
	private final WebEngine webEngine = browser.getEngine();

	public Renderer(final Stage stage) {

		// load the home page
		webEngine.load(SystemProperties.get("server.root") + "uiroot");

		getChildren().add(browser);

		// set js interface
		webEngine.getLoadWorker().stateProperty()
				.addListener((ObservableValue<? extends State> observable, State oldValue, State newState) -> {
					if (newState == State.SUCCEEDED) {
						JSObject win = (JSObject) webEngine.executeScript("window");
						win.setMember("centsa", new CentsaJSInterface());
					}
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
		Double width = SystemProperties.get("width");
		return width > MIN_WIDTH ? width : MIN_WIDTH;
	}

	@Override
	protected double computePrefHeight(double width) {
		Double height = SystemProperties.get("height");
		return height > MIN_HEIGHT ? height : MIN_HEIGHT;
	}
}