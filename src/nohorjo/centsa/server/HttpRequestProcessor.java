package nohorjo.centsa.server;

import java.io.IOException;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public interface HttpRequestProcessor {
	public void process(HttpServletRequest req, HttpServletResponse resp) throws IOException;
}
