package nohorjo.centsa.dbservices {

  import java.sql.Connection
  import java.sql.PreparedStatement

  object MetaDAO {

    def createTable() = {
      var conn:Connection = null
      try {
        conn = SQLUtils.getConnection()
        val ps:PreparedStatement = conn.prepareStatement(SQLUtils.getQuery("Meta.Create"))
        ps.executeUpdate()
      } finally {
        if(conn != null) conn.close()
      }
    }

    def set(key:String, value:Any) = {
      var conn:Connection = null
      try {
        conn = SQLUtils.getConnection()
        val ps:PreparedStatement = conn.prepareStatement(SQLUtils.getQuery("Meta.Set"))
        ps.setString(1, key)
        ps.setObject(2, value)
        ps.executeUpdate()
      } finally {
        if(conn != null) conn.close()
      }
    }

    def get(key:String): String = {
      var conn:Connection = null
      try {
        conn = SQLUtils.getConnection()
        val ps:PreparedStatement = conn.prepareStatement(SQLUtils.getQuery("Meta.Get"))
        ps.setString(1, key)
        val rs = ps.executeQuery()
        if(rs.next()) rs.getString(1) else null
      } finally {
        if(conn != null) conn.close()
      }
    }

  }

}
