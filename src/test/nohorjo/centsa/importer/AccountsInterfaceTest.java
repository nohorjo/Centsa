package nohorjo.centsa.importer;

import jdk.nashorn.api.scripting.ScriptObjectMirror;
import nohorjo.centsa.dbservices.AbstractDAO;
import nohorjo.centsa.dbservices.mock.DAOOption;
import nohorjo.centsa.dbservices.mock.MockAccountsDAO;
import nohorjo.centsa.dbservices.mock.MockDAO;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.powermock.api.mockito.PowerMockito;
import org.powermock.core.classloader.annotations.PrepareForTest;
import org.powermock.core.classloader.annotations.SuppressStaticInitializationFor;
import org.powermock.modules.junit4.PowerMockRunner;

import java.sql.SQLException;

import static org.junit.Assert.assertEquals;
import static org.mockito.ArgumentMatchers.any;

/**
 * Test class for {@link AccountsInterface}
 *
 * @author muhammed
 */
@RunWith(PowerMockRunner.class)
@PrepareForTest({ScriptObjectMirror.class, AbstractDAO.class})
@SuppressStaticInitializationFor("nohorjo.centsa.dbservices.AbstractDAO")
public class AccountsInterfaceTest {

    private boolean createNew;

    @Before
    public void init() {
        createNew = false;
    }

    @Test
    public void insert_inserts() throws SQLException {
        ScriptObjectMirror o = getTrans();
        assertEquals(MockDAO.ID, getInterface(DAOOption.FINE).insert(o));
    }

    @Test
    public void insert_createInserts() throws SQLException {
        createNew = true;
        ScriptObjectMirror o = getTrans();
        assertEquals(MockDAO.ID, getInterface(DAOOption.FINE).insert(o));
    }

    @Test(expected = SQLException.class)
    public void insert_throws() throws SQLException {
        assertEquals(MockDAO.ID, getInterface(DAOOption.ERROR).insert(getTrans()));
    }

    private AccountsInterface getInterface(DAOOption option) {
        AccountsInterface i = new AccountsInterface();
        i.setDao(new MockAccountsDAO(option));
        return i;
    }


    private ScriptObjectMirror getTrans() {
        ScriptObjectMirror o = PowerMockito.mock(ScriptObjectMirror.class);
        PowerMockito.when(o.get(any(String.class))).then((i) -> {
            String prop = i.getArgument(0);
            switch (prop) {
                case "name":
                    return createNew ? MockDAO.NAME_2 : MockDAO.NAME;
            }
            throw new NullPointerException(prop);
        });
        return o;
    }
}