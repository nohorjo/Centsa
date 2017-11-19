package nohorjo.util;

/**
 * Class that runs a {@link Runnable} in a new thread. Can be mocked to force
 * single threaded operation
 * 
 * @author muhammed
 *
 */
public abstract class ThreadExecutor {

	public static Thread start(Runnable r) {
		Thread t = new Thread(r);
		t.start();
		return t;
	}

}
