package nohorjo.centsa.importer;

import java.sql.SQLException;

import jdk.nashorn.api.scripting.ScriptObjectMirror;
import nohorjo.centsa.dbservices.AccountsDAO;
import nohorjo.centsa.vo.Account;

public class AccountsInterface extends JSInterface {

	private AccountsDAO dao = new AccountsDAO();

	@Override
	public long insert(ScriptObjectMirror o) throws SQLException {
		Account a = new Account();
		a.setName((String) o.get("name"));

		Long id = dao.getIdByName(a.getName());

		if (id == null) {
			id = dao.insert(a);
		}

		return id;
	}
}
