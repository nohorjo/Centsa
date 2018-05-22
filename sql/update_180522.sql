CREATE TABLE usergrants
(
    user BIGINT NOT NULL,
    accesses BIGINT NOT NULL, 
	FOREIGN KEY (user) REFERENCES users(id) ON DELETE CASCADE,
	FOREIGN KEY (accesses) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user,accesses)
);
