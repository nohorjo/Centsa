package nohorjo.centsa;

import javafx.application.Application;
import javafx.scene.Scene;
import javafx.scene.image.Image;
import javafx.stage.Stage;
import nohorjo.centsa.properties.SystemProperties;
import nohorjo.centsa.render.Renderer;
import nohorjo.centsa.server.EmbeddedServer;

public class Main extends Application {

	@Override
	public void start(Stage stage) {
		stage.setTitle("Centsa");
		stage.setScene(new Scene(new Renderer(stage)));
		stage.getIcons().add(new Image(ClassLoader.getSystemResourceAsStream("icon.png")));
		stage.show();
	}

	@Override
	public void stop() throws Exception {
		EmbeddedServer.stopServer();
	}

	public static void main(String[] args) throws Exception {
		String logfile = SystemProperties.get("root.dir", String.class) + "/log/application.log";

		System.setErr(FilePrintStreamRedirector.getRedirector(logfile, System.err, false));
		System.setOut(FilePrintStreamRedirector.getRedirector(logfile, System.out, true));

		String ip = SystemProperties.get("server.ip", String.class);
		int port = (int) SystemProperties.get("server.port", Integer.class);

		// start the server and obtain the running port (in the case of port set to 0)
		port = EmbeddedServer.startServer(ip, port);

		SystemProperties.setRuntime("server.root",
				String.format("%s://%s:%d/", SystemProperties.get("server.protocol", String.class), ip, port));

		launch(args);
	}
}
