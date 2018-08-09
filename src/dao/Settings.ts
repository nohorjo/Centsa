import { pool } from './Connection';

export const getAll = (userId, cb) => {
    pool.query(
        'SELECT setting,value FROM settings WHERE user_id=?;',
        [userId],
        (err, results) => {
            cb(err, err || results.reduce((a, b) => {
                // Convert array of {key:x,value:y} to a single object {x:y}...
                const x = {};
                x[b.setting] = b.value;
                return {...x, ...a};
            }, {}));
        }
    );
};

export const setSetting = (setting, userId, cb) => {
    pool.query(
        'REPLACE INTO settings (user_id, setting, value) VALUES (?,?,?);',
        [userId, setting.key, setting.value],
        cb
    );
};
