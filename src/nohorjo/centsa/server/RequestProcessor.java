package nohorjo.centsa.server;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public interface RequestProcessor {
	public void process(HttpServletRequest req, HttpServletResponse resp);
}
