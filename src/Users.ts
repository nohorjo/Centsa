import Connection from './Connection';

export const getOrCreateUser = (data, cb) => {
    Connection.pool.query('SELECT id FROM users WHERE email=?;', [data.email], (err, results) => {
        if (err) throw err;
        if (results[0]) {
            cb(results[0].id);
        } else {
            Connection.pool.query(
                `INSERT INTO users (email,name) VALUES (?,?);`
                , [data.email, data.name], (err, results) => {
                    if (err) throw err;
                    const userId = results.insertId;
                    Connection.pool.query(
                        `INSERT INTO settings VALUES (?,'strict.mode','true'),(?,'trans.page.size','15');
                        INSERT INTO accounts (user_id,name) VALUES (?,'Default');
                        INSERT INTO types (user_id,name) VALUES (?,'Other');`,
                        Array(4).fill(userId),
                        err => {
                            if (err) throw err;
                            cb(userId);
                        });
                });
        }
    });
};