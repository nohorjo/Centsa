package nohorjo.centsa;

import javafx.application.Application;
import javafx.scene.Scene;
import javafx.stage.Stage;
import nohorjo.centsa.properties.SystemProperties;
import nohorjo.centsa.render.Renderer;
import nohorjo.centsa.server.EmbeddedServer;
import nohorjo.centsa.updater.UpdateChecker;

/**
 * Main class of the application
 * 
 * @author muhammed.haque
 *
 */
public class Main extends Application {

	private static Stage stage;

	/**
	 * Gets the stage
	 * 
	 * @return The stage
	 */
	public static Stage getStage() {
		return stage;
	}

	@Override
	public void start(Stage stage) {
		Main.stage = stage;
		stage.setScene(new Scene(new Renderer(stage)));
	}

	@Override
	public void stop() throws Exception {
		EmbeddedServer.stopServer();
	}

	public static void main(String[] args) throws Exception {
		Runtime.getRuntime().addShutdownHook(new Thread(() -> {
			UpdateChecker.launchUpdater(false);
		}));

		int port = EmbeddedServer.startServer();
		SystemProperties.setRuntime("server.root", String.format("http://127.0.0.1:%d/", port));

		launch(args);
	}
}
