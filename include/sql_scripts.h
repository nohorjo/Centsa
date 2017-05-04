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
    );"

#define CREATE_TYPES_TABLE \
    "CREATE TABLE TYPES \
    (\
        ID INTEGER PRIMARY KEY AUTOINCREMENT,\
        NAME VARCHAR NOT NULL\
    );"

#define CREATE_EXPENSES_TABLE \
    "CREATE TABLE EXPENSES \
    (\
        ID INTEGER PRIMARY KEY AUTOINCREMENT,\
        EXPENSE VARCHAR NOT NULL,\
        COST DECIMAL(10,2) NOT NULL,\
        FREQUENCY_DAYS INT NOT NULL,\
        STARTED TIMESTAMP NOT NULL DEFAULT (DATE('NOW')),\
        ENDED TIMESTAMP,\
        AUTOMATIC TINYINT NOT NULL DEFAULT 0\
    );"


#endif