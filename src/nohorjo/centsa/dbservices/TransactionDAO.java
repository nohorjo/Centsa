package nohorjo.centsa.dbservices;

import static nohorjo.centsa.dbservices.ConnectionUtils.*;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;

public class TransactionDAO {

	static {
		String sql = "CREATE TABLE IF NOT EXISTS TRANSACTIONS "	+ 
					"("	+ 
						"ID INTEGER PRIMARY KEY AUTOINCREMENT, " + 
						"AMOUNT DECIMAL(10,2) NOT NULL, " + 
						"COMMENT VARCHAR, " + 
						"ACCOUNT_ID INTEGER NOT NULL REFERENCES ACCOUNTS(ID), " + 
						"TYPE_ID INTEGER NOT NULL REFERENCES TYPES(ID), " + 
						"DATE TIMESTAMP NOT NULL DEFAULT (STRFTIME('%s', 'NOW')), " + 
						"EXPENSE_ID INTEGER REFERENCES EXPENSES(ID) " + 
					");";
		try(Connection conn = getConnection();PreparedStatement ps = conn.prepareStatement(sql)){
			ps.execute();
		} catch (SQLException e) {
			throw new Error(e);
		}
	}
}
