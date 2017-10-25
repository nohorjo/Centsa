package nohorjo.centsa;

import javafx.application.Application;
import javafx.scene.Scene;
import javafx.scene.image.Image;
import javafx.stage.Stage;
import nohorjo.centsa.properties.SystemProperties;
import nohorjo.centsa.render.Renderer;
import nohorjo.centsa.server.EmbeddedServer;

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
		stage.setTitle("Centsa");
		stage.setScene(new Scene(new Renderer()));
		stage.getIcons().add(new Image(ClassLoader.getSystemResourceAsStream("icon.png")));
		stage.show();
	}

	@Override
	public void stop() throws Exception {
		EmbeddedServer.stopServer();
	}

	public static void main(String[] args) throws Exception {
		int port = EmbeddedServer.startServer();

		SystemProperties.setRuntime("server.root", String.format("http://127.0.0.1:%d/", port));

		launch(args);
	}
}
