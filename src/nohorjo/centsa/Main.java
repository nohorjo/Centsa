package nohorjo.centsa;

import java.io.File;
import java.nio.file.Files;
import java.util.Arrays;

import javafx.application.Application;
import javafx.scene.Scene;
import javafx.scene.image.Image;
import javafx.stage.Stage;
import nohorjo.centsa.properties.SystemProperties;
import nohorjo.centsa.render.Renderer;
import nohorjo.centsa.server.EmbeddedServer;

public class Main extends Application {

	private static Stage stage;

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
		String logDir = SystemProperties.get("root.dir", String.class) + "/log";

		File[] logs = new File(logDir).listFiles();
		if (logs != null) {
			int size = 0;
			for (File file : logs) {
				size += file.length() / 1024;
			}
			if (size > SystemProperties.get("max.logs.kb", Integer.class)) {
				Arrays.sort(logs, (f1, f2) -> {
					return Long.compare(f1.lastModified(), f2.lastModified());
				});
				for (int i = 0; i < (logs.length / 2) + 1; i++) {
					Files.delete(logs[i].toPath());
				}
			}
		}

		String logfile = logDir + "/application.log";

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
