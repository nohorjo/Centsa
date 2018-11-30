const { pool } = require('./Connection');

const Types = {};

export const getAll = (userId, cb) => {
    pool.query(
        'SELECT id,name,(SELECT SUM(amount) FROM transactions t WHERE t.type_id=a.id) AS sum FROM types a WHERE user_id=?;',
        [userId],
        cb
    );
};

export const insert = (name, userId, cb) => {
    pool.query(
        'INSERT INTO types (name,user_id) VALUES (?,?);',
        [name, userId],
        (err, results) => {
            cb(err, err || results.insertId);
        }
    );
};

export const deleteType = (id, userId, cb) => {
    pool.query(
        `UPDATE transactions tr SET type_id=
        (SELECT id FROM types ty WHERE ty.user_id=? AND ty.name='Other')
        WHERE type_id=? AND user_id=?;
        UPDATE expenses SET type_id=
        (SELECT id FROM types ty WHERE ty.user_id=? AND ty.name='Other')
        WHERE type_id=? AND user_id=?;
        DELETE FROM types WHERE id=? AND user_id=?;`,
        [
            userId,
            id,
            userId,
            userId,
            id,
            userId,
            id,
            userId,
        ],
        cb
    );
};

module.exports = Types;
