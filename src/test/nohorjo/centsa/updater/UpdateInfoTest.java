package nohorjo.centsa.updater;

import static org.junit.Assert.assertEquals;

import org.apache.commons.lang.RandomStringUtils;
import org.apache.commons.lang.math.RandomUtils;
import org.junit.Test;

public class UpdateInfoTest {

	@Test
	public void getAssetName_returns() {
		String name = RandomStringUtils.randomAlphabetic(10);
		String fakePath = RandomStringUtils.randomAlphabetic(10);
		for (int i = 0; i < RandomUtils.nextInt(10); i++) {
			fakePath += "/" + RandomStringUtils.randomAlphabetic(10);
		}
		UpdateInfo info = new UpdateInfo();
		info.setAsset(fakePath + "/" + name);
		assertEquals(name, info.getAssetName());
	}

}
