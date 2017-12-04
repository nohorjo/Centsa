package nohorjo.centsa.importer;

import jdk.nashorn.api.scripting.ScriptObjectMirror;
import nohorjo.centsa.dbservices.AbstractDAO;
import nohorjo.centsa.dbservices.mock.DAOOption;
import nohorjo.centsa.dbservices.mock.MockDAO;
import nohorjo.centsa.dbservices.mock.MockTransactionsDAO;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.powermock.api.mockito.PowerMockito;
import org.powermock.core.classloader.annotations.PrepareForTest;
import org.powermock.core.classloader.annotations.SuppressStaticInitializationFor;
import org.powermock.modules.junit4.PowerMockRunner;

import java.sql.SQLException;

import static org.junit.Assert.assertEquals;
import static org.mockito.Mockito.any;

@RunWith(PowerMockRunner.class)
@PrepareForTest({ScriptObjectMirror.class, AbstractDAO.class})
@SuppressStaticInitializationFor("nohorjo.centsa.dbservices.AbstractDAO")
public class TransactionsInterfaceTest {

    @Test
    public void insert_inserts() throws SQLException {
        ScriptObjectMirror o = getTrans();
        assertEquals(MockDAO.ID, getInterface(DAOOption.FINE).insert(o));
    }

    @Test(expected = SQLException.class)
    public void insert_throws() throws SQLException {
        assertEquals(MockDAO.ID, getInterface(DAOOption.ERROR).insert(getTrans()));
    }

    private TransactionsInterface getInterface(DAOOption option) {
        TransactionsInterface i = new TransactionsInterface();
        i.setDao(new MockTransactionsDAO(option));
        return i;
    }


    private ScriptObjectMirror getTrans() {
        ScriptObjectMirror o = PowerMockito.mock(ScriptObjectMirror.class);
        PowerMockito.when(o.get(any(String.class))).then((i) -> {
            switch ((String) i.getArgument(0)) {
                case "amount":
                    return MockTransactionsDAO.AMMOUNT;
                case "comment":
                    return MockTransactionsDAO.COMMENT;
                case "account_id":
                    return MockTransactionsDAO.ACCOUNT_ID;
                case "type_id":
                    return MockTransactionsDAO.TYPE_ID;
                case "expense_id":
                    return MockTransactionsDAO.EXPENSE_ID;
                case "date":
                    return MockTransactionsDAO.DATE;
            }
            throw new NullPointerException();
        });
        return o;
    }
}
