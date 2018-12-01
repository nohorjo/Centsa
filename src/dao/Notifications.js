const { pool } = require('./Connection');

const Notifications = {};

Notifications.getNotifications = (userId, cb) => {
    pool.query(
        'SELECT id,message,is_read FROM notifications WHERE user_id=?;',
        [userId],
        cb
    );
};

Notifications.deleteNotification = (userId, id, cb) => {
    pool.query(
        'DELETE FROM notifications WHERE user_id=? AND id=?;',
        [userId, id],
        cb
    );
};

Notifications.readNotifications = (userId, cb) => {
    pool.query(
        'UPDATE notifications SET is_read=TRUE WHERE user_id=?',
        [userId],
        cb
    );
};

Notifications.addNotification = (user_id, message, cb) => {
    pool.query(
        `INSERT INTO notifications SET ?;`,
        {user_id, message},
        cb
    );
};

module.exports = Notifications;
