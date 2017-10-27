package nohorjo.centsa.updater;

import java.util.Arrays;

/**
 * VO class to hold update information
 * 
 * @author muhammed
 *
 */
public class UpdateInfo {
	private int majorVersion;
	private int minorVersion;
	private String[] changelog;
	private String asset;

	public int getMajorVersion() {
		return majorVersion;
	}

	public void setMajorVersion(int majorVersion) {
		this.majorVersion = majorVersion;
	}

	public int getMinorVersion() {
		return minorVersion;
	}

	public void setMinorVersion(int minorVersion) {
		this.minorVersion = minorVersion;
	}

	public String[] getChangelog() {
		return changelog;
	}

	public void setChangelog(String[] changelog) {
		this.changelog = changelog;
	}

	public String getAsset() {
		return asset;
	}

	public void setAsset(String asset) {
		this.asset = asset;
	}

	/**
	 * Gets the name of the file denoted by the asset url
	 * 
	 * @return The name of the file
	 */
	public String getAssetName() {
		return asset.substring(asset.lastIndexOf('/') + 1);
	}

	@Override
	public String toString() {
		return "UpdateInfo [majorVersion=" + majorVersion + ", minorVersion=" + minorVersion + ", changelog="
				+ Arrays.toString(changelog) + ", asset=" + asset + "]";
	}
}
