const { pool } = require('./Connection');

const Rules = {};

export const getAll = (userId, cb) => {
    pool.query(
        "SELECT id,name FROM rules WHERE user_id IS NULL OR user_id=?;",
        [userId],
        cb
    );
};

export const insert = (name, script, userId, cb) => {
    pool.query(
        "REPLACE INTO rules (name,user_id,content) VALUES (?,?,?);",
        [name, script, userId],
        (err, results) => {
            cb(err, err || results.insertId);
        }
    );
};

export const getRule = (id, userId, cb) => {
    pool.query(
        "SELECT content FROM rules WHERE (user_id IS NULL OR user_id=?) AND id=?;",
        [userId, id],
        cb
    );
};

module.exports = Rules;
