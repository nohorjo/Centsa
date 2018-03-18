import { pool } from './Connection';

export const getOrCreateUser = (data, cb) => {
    pool.query('SELECT id FROM users WHERE email=?;', [data.email], (err, results) => {
        if (err) throw err;
        if (results[0]) {
            cb(results[0].id);
        } else {
            pool.query(
                `INSERT INTO users (email,name) VALUES (?,?);`
                , [data.email, data.name], (err, results) => {
                    if (err) throw err;
                    const userId = results.insertId;
                    pool.query(
                        `INSERT INTO types (user_id,name) VALUES (?,'Other');
                        INSERT INTO accounts (user_id,name) VALUES (?,'Default');
                        INSERT INTO settings VALUES
                            (?,'strict.mode','true'),
                            (?,'trans.page.size','15'),
                            (?,'default.account',(SELECT id FROM accounts a where a.name='Default' AND a.user_id=?));`,
                        Array(6).fill(userId),
                        err => {
                            if (err) throw err;
                            cb(userId);
                        });
                });
        }
    });
};