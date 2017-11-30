package nohorjo.centsa.importer;

import static org.junit.Assert.assertEquals;

import java.sql.SQLException;

import org.apache.commons.lang.RandomStringUtils;
import org.apache.commons.lang.math.RandomUtils;
import org.junit.Test;

import jdk.nashorn.api.scripting.ScriptObjectMirror;

public class JSInterfaceTest {

	private JSInterface jsi = new JSInterface() {

		@Override
		public long insert(ScriptObjectMirror o) throws SQLException {
			return 0;
		}
	};

	@Test
	public void cast_doubleToInt() {
		double d = Math.random();
		int i = jsi.cast(d, Integer.class);
		assertEquals((int) d, i);
	}

	@Test
	public void cast_intToDouble() {
		int i = RandomUtils.nextInt();
		double d = jsi.cast(i, Double.class);
		assertEquals((double) i, d, 0);
	}

	@Test
	public void cast_longToDouble() {
		long l = RandomUtils.nextLong();
		double d = jsi.cast(l, Double.class);
		assertEquals((double) l, d, 0);
	}

	@Test
	public void cast_doubleToLong() {
		double d = Math.random();
		long l = jsi.cast(d, Long.class);
		assertEquals((long) d, l);
	}

	@Test
	public void cast_intToLong() {
		int i = RandomUtils.nextInt();
		long l = jsi.cast(i, Long.class);
		assertEquals((long) i, l);
	}

	@Test
	public void cast_longToInt() {
		long l = RandomUtils.nextLong();
		int i = jsi.cast(l, Integer.class);
		assertEquals((int) l, i);
	}

	@Test
	public void cast_straightCast() {
		Object o = RandomStringUtils.randomAlphabetic(10);
		String s = jsi.cast(o, String.class);
		assertEquals(o.toString(), s);
	}
}
