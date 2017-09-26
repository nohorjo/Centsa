package nohorjo.centsa.dbservices;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;

public class TransactionDAO {

	static {
		try (Connection conn = SQLUtils.getConnection();
				PreparedStatement ps = conn.prepareStatement(SQLUtils.getQuery("Transaction.CreateTable"))) {
			ps.execute();
		} catch (SQLException e) {
			throw new Error(e);
		}
	}
}
