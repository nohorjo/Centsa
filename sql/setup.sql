/*
DROP TABLE transactions;
DROP TABLE expenses;
DROP TABLE types;
DROP TABLE accounts;
DROP TABLE settings;
DROP TABLE users;
*/

CREATE TABLE users
(
	id BIGINT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(50) NOT NULL,
    name VARCHAR(50) NOT NULL,
	UNIQUE(email)
);
CREATE TABLE settings
(
	user_id BIGINT NOT NULL,
    setting VARCHAR(40) NOT NULL,
    value VARCHAR(40),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id,setting)
);
CREATE TABLE accounts
(
	id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
	name VARCHAR(50) NOT NULL,
    UNIQUE(user_id,name),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE types
(
	id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
	name VARCHAR(50) NOT NULL,
    UNIQUE(user_id,name),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE expenses
(
	id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
	name VARCHAR(50) NOT NULL,
	cost INTEGER NOT NULL,
	frequency VARCHAR(10) NOT NULL,
	started DATE NOT NULL,
	automatic BOOL NOT NULL DEFAULT FALSE,
	account_id BIGINT,
	type_id BIGINT NOT NULL,
    UNIQUE(user_id,name),
    FOREIGN KEY (account_id) REFERENCES accounts(id),
    FOREIGN KEY (type_id) REFERENCES types(id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE transactions
(
	id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
	amount INTEGER NOT NULL,
	comment VARCHAR(500),
	account_id BIGINT NOT NULL,
	type_id BIGINT NOT NULL,
	expense_id BIGINT NOT NULL,
	date DATE NOT NULL,
    FOREIGN KEY (account_id) REFERENCES accounts(id),
    FOREIGN KEY (type_id) REFERENCES types(id),
	FOREIGN KEY (expense_id) REFERENCES expenses(id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
