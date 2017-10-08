package nohorjo.centsa.rest.api;

import java.io.IOException;
import java.io.PrintWriter;
import java.sql.SQLException;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.core.Context;

import com.fasterxml.jackson.databind.ObjectMapper;

import nohorjo.centsa.dbservices.TransactionsDAO;
import nohorjo.centsa.vo.Transaction;

@Path("/transactions")
public class TransactionsRS {

	TransactionsDAO dao = new TransactionsDAO();

	@GET
	public void doGet(@Context HttpServletRequest req, @Context HttpServletResponse resp) throws IOException {
		String id = req.getParameter("id");
		String countPages = req.getParameter("countPages");
		int code = 500;
		if (id != null) {
			try {
				Transaction t = dao.get(Long.parseLong(id));
				try (PrintWriter pw = resp.getWriter()) {
					new ObjectMapper().writeValue(pw, t);
				}
				code = 200;
			} catch (NumberFormatException e) {
				code = 400;
			} catch (SQLException e) {
				e.printStackTrace();
			}
		} else if (countPages != null) {
			try {
				int count = dao.countPages(Integer.parseInt(countPages));
				try (PrintWriter pw = resp.getWriter()) {
					pw.write(Integer.toString(count));
				}
			} catch (NumberFormatException e) {
				code = 400;
			} catch (SQLException e) {
				e.printStackTrace();
			}
			code = 200;
		} else {
			String page = req.getParameter("page");
			String pageSize = req.getParameter("pageSize");
			String order = req.getParameter("order");
			try {
				List<Transaction> ts = dao.getAll(Integer.parseInt(page), Integer.parseInt(pageSize), order);
				try (PrintWriter pw = resp.getWriter()) {
					new ObjectMapper().writeValue(pw, ts);
				}
				code = 200;
			} catch (NumberFormatException e) {
				code = 400;
			} catch (SQLException e) {
				e.printStackTrace();
			}
		}
		resp.setStatus(code);
	}

	@DELETE
	public void doDelete(@Context HttpServletRequest req, @Context HttpServletResponse resp) throws IOException {
		String id = req.getParameter("id");
		int code = 500;
		try {
			dao.delete(Long.parseLong(id));
			code = 204;
		} catch (NumberFormatException e) {
			code = 400;
		} catch (SQLException e) {
			e.printStackTrace();
		}
		resp.setStatus(code);
	}

	@POST
	public void doPost(@Context HttpServletRequest req, @Context HttpServletResponse resp) throws IOException {
		Transaction t = new ObjectMapper().readValue(req.getReader(), Transaction.class);
		int code = 500;
		try {
			long id = dao.insert(t);
			try (PrintWriter pw = resp.getWriter()) {
				pw.write(Long.toString(id));
			}
			code = 204;
		} catch (SQLException e) {
			e.printStackTrace();
		}
		resp.setStatus(code);
	}

}
