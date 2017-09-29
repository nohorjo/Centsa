package nohorjo.centsa.rest;

import java.io.IOException;
import java.io.PrintWriter;
import java.sql.SQLException;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.fasterxml.jackson.databind.ObjectMapper;

import nohorjo.centsa.dbservices.TransactionsDAO;
import nohorjo.centsa.vo.Transaction;

public class TransactionsRS extends HttpServlet {

	/**
	 * 
	 */
	private static final long serialVersionUID = -3321157826434071421L;

	TransactionsDAO dao = new TransactionsDAO();

	@Override
	protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
		String id = req.getParameter("id");
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

	@Override
	protected void doDelete(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
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

	@Override
	protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
		Transaction t = new ObjectMapper().readValue(req.getReader(), Transaction.class);
		int code = 500;
		try {
			dao.insert(t);
			code = 204;
		} catch (SQLException e) {
			e.printStackTrace();
		}
		resp.setStatus(code);
	}

}
