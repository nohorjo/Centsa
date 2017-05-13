#include "dao.h"
#include "sql_scripts.h"

#include <stdlib.h>
#include <iostream>
namespace dao
{
static std::string dbFileName;
static sqlite3 *main_db;

/**
 * Checks if the TRANSACTIONS exists
 */
bool transTableExists()
{
    int rowCount = 0;
    auto forEachRow = [](void *rowCount, int colCount, char **colData, char **colNames) {
        (*(int *)rowCount)++;
        return 0;
    };
    if (sqlite3_exec(main_db, CHECK_TABLE, forEachRow, &rowCount, NULL))
    {
        throw sqlite3_errmsg(main_db);
    }

    return rowCount > 0;
}

/**
 * Checks the database if file exists, tries to create it and set it up if not
 */
void prepareDB(std::string dbFile)
{
    dbFileName = dbFile;

    if (sqlite3_open(dbFileName.c_str(), &main_db))
    {
        throw std::string(std::string("Can't open database: ") + sqlite3_errmsg(main_db)).c_str();
    }
    try
    {
        if (!dao::transTableExists())
        {
            if (sqlite3_exec(main_db, CREATE_EXPENSES_TABLE
                                          CREATE_TYPES_TABLE
                                              CREATE_ACCOUNTS_TABLE
                                                  CREATE_TRANSACTION_TABLE,
                             NULL, NULL, NULL))
            {
                sqlite3_close(main_db);
                throw sqlite3_errmsg(main_db);
            }
        }
    }
    catch (const char *err)
    {
        sqlite3_close(main_db);
        throw std::string(std::string("SQL error: ") + err).c_str();
    }

    sqlite3_close(main_db);
}

/**
 * Gets a vector of accounts
 */
std::vector<account> getAccounts()
{
    if (sqlite3_open(dbFileName.c_str(), &main_db))
    {
        throw std::string(std::string("Can't open database: ") + sqlite3_errmsg(main_db)).c_str();
    }
    std::vector<account> accounts;
    auto forEachRow = [](void *accounts, int colCount, char **colData, char **colNames) {
        account acc;
        acc.id = atol(colData[0]);
        acc.name = std::string(colData[1]);
        (*(std::vector<account> *)accounts).push_back(acc);
        return 0;
    };
    if (sqlite3_exec(main_db, GET_ACCOUNTS, forEachRow, &accounts, NULL))
    {
        sqlite3_close(main_db);
        throw sqlite3_errmsg(main_db);
    }
    sqlite3_close(main_db);
    return accounts;
}

/**
 * Gets a vector of types
 */
std::vector<type> getTypes()
{
    if (sqlite3_open(dbFileName.c_str(), &main_db))
    {
        throw std::string(std::string("Can't open database: ") + sqlite3_errmsg(main_db)).c_str();
    }
    std::vector<type> types;
    auto forEachRow = [](void *accounts, int colCount, char **colData, char **colNames) {
        type typ;
        typ.id = atol(colData[0]);
        typ.name = std::string(colData[1]);
        (*(std::vector<type> *)accounts).push_back(typ);
        return 0;
    };
    if (sqlite3_exec(main_db, GET_TYPES, forEachRow, &types, NULL))
    {
        sqlite3_close(main_db);
        throw sqlite3_errmsg(main_db);
    }
    sqlite3_close(main_db);
    return types;
}

/**
 * Gets a vector of expenses
 */
std::vector<expense> getExpenses()
{
    if (sqlite3_open(dbFileName.c_str(), &main_db))
    {
        throw std::string(std::string("Can't open database: ") + sqlite3_errmsg(main_db)).c_str();
    }
    std::vector<expense> expenses;
    auto forEachRow = [](void *expenses, int colCount, char **colData, char **colNames) {
        expense ex;
        ex.id = atol(colData[0]);
        ex.name = std::string(colData[1]);
        (*(std::vector<expense> *)expenses).push_back(ex);
        return 0;
    };
    if (sqlite3_exec(main_db, GET_EXPENSES_LITE, forEachRow, &expenses, NULL))
    {
        sqlite3_close(main_db);
        throw sqlite3_errmsg(main_db);
    }
    sqlite3_close(main_db);
    return expenses;
}

/**
 * Adds an account and returns its id
 */
long addAccount(const char *name)
{
    if (sqlite3_open(dbFileName.c_str(), &main_db))
    {
        throw std::string(std::string("Can't open database: ") + sqlite3_errmsg(main_db)).c_str();
    }

    sqlite3_stmt *ps;

    if (sqlite3_prepare_v2(main_db, ADD_ACCOUNT, -1, &ps, NULL) || sqlite3_bind_text(ps, 1, name, -1, SQLITE_TRANSIENT) || sqlite3_step(ps) != SQLITE_DONE)
    {
        std::string err = sqlite3_errmsg(main_db);
        sqlite3_close(main_db);
        throw err.c_str();
    }

    long id = -1;
    auto forEachRow = [](void *id, int colCount, char **colData, char **colNames) {
        (*(long *)id) = atol(colData[0]);
        return 0;
    };
    if (sqlite3_exec(main_db, GET_LAST_ID, forEachRow, &id, NULL))
    {
        sqlite3_close(main_db);
        throw sqlite3_errmsg(main_db);
    }

    sqlite3_close(main_db);
    return id;
}

/**
 * Saves a transaction
 */
void saveTransaction()
{
    throw "UNIMPLEMENTED";
}
}