package nohorjo.centsa.updater;

import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * Class to handle checking for and initating updates
 * 
 * @author muhammed
 *
 */
public class UpdateChecker {

	// Updated by ANT build
	public static final int MAJOR_VERSION = 0;
	public static final int MINOR_VERSION = 2;

	/**
	 * Checks Github for a new release
	 * 
	 * @return Info on the latest version or <code>null</code> if this is the latest
	 * @throws IOException
	 */
	@SuppressWarnings("unchecked")
	public static UpdateInfo checkNewVersion() throws IOException {
		UpdateInfo info;
		// Connect to Github's REST API
		HttpURLConnection conn = (HttpURLConnection) new URL(
				"https://api.github.com/repos/nohorjo/Centsa/releases/latest").openConnection();
		conn.setRequestMethod("GET");
		try (InputStream in = conn.getInputStream()) {
			info = new UpdateInfo();
			Map<String, ?> resp = new ObjectMapper().readValue(in, HashMap.class);

			String versionInfo[] = resp.get("tag_name").toString().substring(1).split(Pattern.quote("."));

			info.setMajorVersion(Integer.parseInt(versionInfo[0]));
			info.setMinorVersion(Integer.parseInt(versionInfo[1]));

			if (info.getMajorVersion() == MAJOR_VERSION && info.getMajorVersion() == MAJOR_VERSION) {
				return null; // This is the latest
			}

			String[] changelog = resp.get("body").toString().split("\\r\\n");

			for (int i = 0; i < changelog.length; i++) {
				// Remove the '- ' at the beginning as this was used for markdown
				changelog[i] = changelog[i].replaceAll("^- ", "");
			}

			info.setChangelog(changelog);
			info.setAsset((((List<Map<String, ?>>) resp.get("assets")).get(0)).get("browser_download_url").toString());
		}
		return info;
	}
}
