package nohorjo.centsa.importer;

import java.sql.SQLException;

import jdk.nashorn.api.scripting.ScriptObjectMirror;
import nohorjo.centsa.dbservices.TypesDAO;
import nohorjo.centsa.vo.Type;

/**
 * JavaScript interface for types
 * 
 * @author muhammed.haque
 *
 */
public class TypesInterface extends JSInterface {

	TypesDAO dao = new TypesDAO();

	@Override
	public long insert(ScriptObjectMirror o) throws SQLException {
		Type t = new Type();
		t.setName((String) o.get("name"));

		Long id = dao.getIdByName(t.getName());

		if (id == null) {
			id = dao.insert(t);
		}

		return id;
	}

	public void setDao(TypesDAO dao) {
		this.dao = dao;
	}
}
