import { pool } from './Connection';

export const getNotifications = (userId, cb) => {
    pool.query(
        'SELECT id,message,read FROM notifications WHERE user_id=?;',
        [userId],
        cb
    );
};

export const deleteNotification = (id, userId, cb) => {
    pool.query(
        'DELETE FROM notifications WHERE user_id=? AND id=?;',
        [userId, id],
        cb
    );
};

export const readNotifications = (userId, cb) => {
    pool.query(
        'UPDATE notifications SET read=TRUE WHERE user_id=?',
        [userId],
        cb
    );
};
