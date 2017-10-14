package nohorjo.centsa.importer;

import java.sql.SQLException;

import jdk.nashorn.api.scripting.ScriptObjectMirror;

public abstract class JSInterface {
	public abstract long insert(ScriptObjectMirror o) throws SQLException;

	@SuppressWarnings("unchecked")
	protected <T> T cast(Object o, Class<T> clazz) {
		for (int i = 0; i < 3; i++) {
			try {
				switch (i) {
				case 0:
					switch (clazz.getName()) {
					case "java.lang.Integer":
						return (T) new Integer(((Double) o).intValue());
					case "java.lang.Long":
						return (T) new Long(((Double) o).longValue());
					}
					break;
				case 1:
					switch (clazz.getName()) {
					case "java.lang.Integer":
						return (T) new Integer(((Long) o).intValue());
					case "java.lang.Double":
						return (T) new Double(((Long) o).doubleValue());
					}
					break;
				case 2:
					switch (clazz.getName()) {
					case "java.lang.Double":
						return (T) new Double(((Integer) o).doubleValue());
					case "java.lang.Long":
						return (T) new Long(((Integer) o).longValue());
					}
					break;
				}
			} catch (ClassCastException e) {
			}
		}
		return (T) o;
	}

}
