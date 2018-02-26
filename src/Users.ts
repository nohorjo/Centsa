import Connection from './Connection';

export const getOrCreateUser = (data, cb) => {
    Connection.pool.query('SELECT id FROM users WHERE email=?;', [data.email], (err, results) => {
        if (err) throw err;
        if (results[0]) {
            cb(results[0].id)
        } else {
            Connection.pool.query(
                'INSERT INTO users (email,name) VALUES (?,?);\
                SELECT LAST_INSERT_ID() AS id;'
                , [data.email, data.name], (err, results) => {
                    if (err) throw err;
                    const userId = results[1][0].id;
                    Connection.pool.query(
                        "INSERT INTO settings VALUES (?,'strict.mode','true'),(?,'trans.page.size','15');\
                        INSERT INTO accounts (user_id,name) VALUES (?,'default');\
                        INSERT INTO types (user_id,name) VALUES (?,'other')\
                        SELECT LAST_INSERT_ID() AS id;",
                        Array(4).fill(userId),
                        (err, results) => {
                            if (err) throw err;
                            const typeId = results[3][0].id;
                            Connection.pool.query(
                                "INSERT INTO expenses (user_id,name,cost,frequency,started,type_id) VALUES (?,'N/A',0,'1',CURDATE(),?)",
                                [userId, typeId],
                                err => {
                                    if (err) throw err;
                                    cb(userId);
                                });
                        });
                });
        }
    });
}