package nohorjo.centsa.dbservices;

import java.sql.SQLException;
import java.util.List;

import nohorjo.centsa.vo.VO;

/**
 * Basic interface for DAOs
 * 
 * @author muhammed.haque
 *
 */
public interface DAO {
	public void createTable() throws SQLException;

	public long insert(VO _vo) throws SQLException;

	public List<? extends VO> getAll(int page, int pageSize, String order) throws SQLException;

	public VO get(long id) throws SQLException;

	public void delete(long id) throws SQLException;
}
