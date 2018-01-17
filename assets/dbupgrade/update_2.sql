ALTER TABLE EXPENSES RENAME TO _EXPENSES;

CREATE TABLE IF NOT EXISTS EXPENSES
(
    ID INTEGER PRIMARY KEY AUTOINCREMENT,
    NAME VARCHAR UNIQUE NOT NULL,
    COST INTEGER NOT NULL,
    FREQUENCY VARCHAR NOT NULL,
    STARTED INTEGER NOT NULL DEFAULT (STRFTIME('%s', 'NOW')*1000),
    AUTOMATIC TINYINT NOT NULL DEFAULT 0,
    ACCOUNT_ID INTEGER NOT NULL REFERENCES ACCOUNTS(ID) DEFAULT 0,
    TYPE_ID INTEGER NOT NULL REFERENCES TYPES(ID) DEFAULT 1
);

INSERT INTO EXPENSES (ID, NAME, COST, FREQUENCY, STARTED, AUTOMATIC)
	SELECT ID, NAME, COST, FREQUENCY_DAYS, STARTED, 0
	FROM _EXPENSES;

DROP TABLE _EXPENSES;


ALTER TABLE TRANSACTIONS RENAME TO _TRANSACTIONS;

CREATE TABLE IF NOT EXISTS TRANSACTIONS
(
    ID INTEGER PRIMARY KEY AUTOINCREMENT,
    AMOUNT INTEGER NOT NULL,
    COMMENT VARCHAR,
    ACCOUNT_ID INTEGER NOT NULL REFERENCES ACCOUNTS(ID) DEFAULT 1,
    TYPE_ID INTEGER NOT NULL REFERENCES TYPES(ID) DEFAULT 1,
    EXPENSE_ID INTEGER NOT NULL REFERENCES EXPENSES(ID) DEFAULT 1,
    DATE INTEGER NOT NULL DEFAULT (STRFTIME('%s', 'NOW')*1000)
);

INSERT INTO TRANSACTIONS SELECT ID, AMOUNT, COMMENT, ACCOUNT_ID, TYPE_ID, EXPENSE_ID, DATE FROM _TRANSACTIONS;

DROP TABLE _TRANSACTIONS;