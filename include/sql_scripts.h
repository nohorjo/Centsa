#ifndef SQL_SCRIPTS_H
#define SQL_SCRIPTS_H

#define CHECK_TABLE "SELECT name FROM sqlite_master WHERE type='table' AND name='TRANSACTIONS';"

#define CREATE_TRANSACTION_TABLE \
    "CREATE TABLE TRANSACTIONS \
    (\
        ID INTEGER PRIMARY KEY AUTOINCREMENT,\
        AMOUNT DECIMAL(10,2) NOT NULL,\
        COMMENT VARCHAR,\
        ACCOUNT_ID INTEGER NOT NULL REFERENCES ACCOUNTS(ID),\
        TYPE_ID INTEGER NOT NULL REFERENCES TYPES(ID),\
        DATE TIMESTAMP NOT NULL DEFAULT (DATE('NOW')),\
        EXPENSE_ID INTEGER REFERENCES EXPENSES(ID)\
    );"


#define CREATE_ACCOUNTS_TABLE \
    "CREATE TABLE ACCOUNTS \
    (\
        ID INTEGER PRIMARY KEY AUTOINCREMENT,\
        NAME VARCHAR NOT NULL\
    );\
    INSERT INTO ACCOUNTS (NAME) VALUES ('Default');"

#define CREATE_TYPES_TABLE \
    "CREATE TABLE TYPES \
    (\
        ID INTEGER PRIMARY KEY AUTOINCREMENT,\
        NAME VARCHAR NOT NULL\
    );\
    INSERT INTO TYPES (NAME) VALUES ('Other');"

#define CREATE_EXPENSES_TABLE \
    "CREATE TABLE EXPENSES \
    (\
        ID INTEGER PRIMARY KEY AUTOINCREMENT,\
        NAME VARCHAR NOT NULL,\
        COST DECIMAL(10,2) NOT NULL,\
        FREQUENCY_DAYS INT NOT NULL,\
        STARTED TIMESTAMP NOT NULL DEFAULT (DATE('NOW')),\
        ENDED TIMESTAMP,\
        AUTOMATIC TINYINT NOT NULL DEFAULT 0\
    );\
    INSERT INTO EXPENSES (NAME, COST, FREQUENCY_DAYS) VALUES ('N/A', 0, 1);"

#define CREATE_SETTINGS_TABLE \
    "CREATE TABLE SETTINGS \
    (\
        KEY VARCHAR NOT NULL PRIMARY KEY,\
        VALUE VARCHAR\
    );\
    INSERT INTO SETTINGS VALUES ('IP','127.0.0.1');\
    INSERT INTO SETTINGS VALUES ('PORT','0');"

#define GET_ACCOUNTS "SELECT ID, NAME FROM ACCOUNTS;"
#define GET_TYPES "SELECT ID, NAME FROM TYPES;"

#define GET_EXPENSES "SELECT ID, NAME, COST, FREQUENCY_DAYS, STARTED, ENDED, AUTOMATIC FROM EXPENSES;"
#define GET_EXPENSES_LITE "SELECT ID, NAME FROM EXPENSES;"

#define GET_IP_PORT "SELECT (SELECT VALUE FROM SETTINGS WHERE KEY='IP') AS IP, (SELECT VALUE FROM SETTINGS WHERE KEY='PORT') AS PORT;"
#define GET_SETTINGS "SELECT KEY, VALUE FROM SETTINGS;"
#define SET_SETTING "REPLACE INTO SETTINGS (KEY,VALUE) VALUES (?,?);"

#define ADD_ACCOUNT "INSERT INTO ACCOUNTS (NAME) VALUES (?);"
#define SAVE_TRANSACTION "INSERT INTO TRANSACTIONS (AMOUNT, COMMENT, ACCOUNT_ID, TYPE_ID, DATE, EXPENSE_ID) VALUES (?,?,?,?,?,?);"

#define GET_LAST_ID "SELECT LAST_INSERT_ROWID();"

#endif