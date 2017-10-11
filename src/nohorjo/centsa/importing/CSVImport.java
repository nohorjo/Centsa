package nohorjo.centsa.importing;

import java.io.IOException;
import java.io.Reader;
import java.io.StringReader;
import java.sql.SQLException;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.HashMap;
import java.util.Map;

import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVRecord;

import nohorjo.centsa.dbservices.AccountsDAO;
import nohorjo.centsa.dbservices.TransactionsDAO;
import nohorjo.centsa.dbservices.TypesDAO;
import nohorjo.centsa.vo.Account;
import nohorjo.centsa.vo.Transaction;
import nohorjo.centsa.vo.Type;

public class CSVImport {

	private static final SimpleDateFormat sdf = new SimpleDateFormat("yyyy/MM/dd");

	private static AccountsDAO aDao = new AccountsDAO();
	private static TypesDAO tDao = new TypesDAO();
	private static TransactionsDAO transDao = new TransactionsDAO();

	public static void importCSV(String csv) throws IOException, SQLException, ParseException {
		Map<Account, Long> accounts = new HashMap<>();
		Map<Type, Long> types = new HashMap<>();
		try (Reader r = new StringReader(csv)) {
			Iterable<CSVRecord> records = CSVFormat.RFC4180
					.withHeader("date", "amount", "comment", "account", "type", "expense").parse(r);
			for (CSVRecord record : records) {
				Transaction trans = new Transaction();
				trans.setDate(sdf.parse(record.get("date")).getTime());
				trans.setAmount((int) (Float.parseFloat(record.get("amount")) * 100));
				trans.setComment(record.get("comment"));

				Account account = new Account();
				account.setName(record.get("account"));
				if (!accounts.containsKey(account)) {
					accounts.put(account, aDao.insert(account));
				}

				trans.setAccount_id(accounts.get(account));

				Type type = new Type();
				type.setName(record.get("type"));
				if (!types.containsKey(type)) {
					types.put(type, tDao.insert(type));
				}

				trans.setType_id(types.get(type));
				// FIXME expenses
				transDao.insert(trans);
			}
		}
	}
}
