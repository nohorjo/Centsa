/* #142 notification table for user accounts page  */
CREATE TABLE notifications
(
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    message VARCHAR(500) NOT NULL,
    user_id BIGINT NOT NULL,
    is_read BOOL NOT NULL DEFAULT FALSE,
    UNIQUE(message,user_id)
);
