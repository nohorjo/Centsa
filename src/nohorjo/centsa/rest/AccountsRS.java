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

import nohorjo.centsa.dbservices.AccountsDAO;
import nohorjo.centsa.vo.Account;

public class AccountsRS extends HttpServlet {

	/**
	 * 
	 */
	private static final long serialVersionUID = -2838315598819859923L;

	AccountsDAO dao = new AccountsDAO();

	@Override
	protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
		String id = req.getParameter("id");
		int code = 500;
		if (id != null) {
			try {
				Account a = dao.get(Long.parseLong(id));
				try (PrintWriter pw = resp.getWriter()) {
					new ObjectMapper().writeValue(pw, a);
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
				List<Account> as = dao.getAll(Integer.parseInt(page), Integer.parseInt(pageSize), order);
				try (PrintWriter pw = resp.getWriter()) {
					new ObjectMapper().writeValue(pw, as);
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
		Account a = new ObjectMapper().readValue(req.getReader(), Account.class);
		int code = 500;
		try {
			long id = dao.insert(a);
			try (PrintWriter pw = resp.getWriter()) {
				pw.write(Long.toString(id));
			}
			code = 200;
		} catch (SQLException e) {
			e.printStackTrace();
		}
		resp.setStatus(code);
	}
}
