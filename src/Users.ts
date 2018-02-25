import Connection from './Connection';

export const getOrCreateUser = (data, cb) => {
    Connection.pool.query('SELECT id FROM users WHERE email=?;',[data.email], (err, results) => {
        if (err) throw err;
        if (results[0]) {
            cb(results[0].id)
        } else {
            Connection.pool.query(
                'INSERT INTO users (email,name) VALUES (?,?);\
                SELECT LAST_INSERT_ID() AS id;'
                , [data.email, data.name],(err,results)=>{
                    cb(results[1][0].id);
            });
        }
    });
}