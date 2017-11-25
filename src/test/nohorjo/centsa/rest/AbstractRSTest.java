package nohorjo.centsa.rest;

import static org.junit.Assert.assertEquals;

import org.apache.commons.lang.RandomStringUtils;
import org.junit.Test;

/**
 * Test class for {@link AbstractRS}
 * 
 * @author muhammed
 *
 */
public class AbstractRSTest {

	private static final String MESSAGE = RandomStringUtils.random(10);

	@Test
	public void toResponse_returnsErrorMessage() {
		Exception e = new Exception(MESSAGE);
		String message = new AbstractRS() {
		}.toResponse(e).getEntity().toString();

		assertEquals(e.getClass().getName() + ": " + e.getMessage(), message);
	}

}
