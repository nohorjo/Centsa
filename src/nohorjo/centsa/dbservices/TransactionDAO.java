package nohorjo.centsa.dbservices;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;

public class TransactionDAO implements DAOI {

	static {
		try {
			new TransactionDAO().createTable();
		} catch (SQLException e) {
			throw new Error(e);
		}
	}

	@Override
	public void createTable() throws SQLException {
		try (Connection conn = SQLUtils.getConnection();
				PreparedStatement ps = conn.prepareStatement(SQLUtils.getQuery("Transaction.CreateTable"))) {
			ps.execute();
		}
	}
}
