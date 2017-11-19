package nohorjo.util;

/**
 * A functional interface like runnable but accepts an argument
 * 
 * @author muhammed
 *
 * @param <T>
 *            Argument type
 */
public interface Procedure<T> {
	public void call(T args);
}
