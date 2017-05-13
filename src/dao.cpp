#include "dao.h"
#include "sql_scripts.h"

#include <stdlib.h>

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
    if (sqlite3_exec(main_db, CHECK_TABLE, forEachRow, &rowCount, NULL) != SQLITE_OK)
    {
        throw sqlite3_errmsg(main_db);
    }

    bool rtn = rowCount > 0;
    return rtn;
}

/**
 * Checks the database if file exists, tries to create it and set it up if not
 */
void prepareDB(std::string dbFile)
{
    dbFileName = dbFile;

    if (sqlite3_open(dbFileName.c_str(), &main_db))
    {
        throw std::string(std::string("Can't open database: ") + sqlite3_errmsg(main_db));
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
                throw sqlite3_errmsg(main_db);
            }
        }
    }
    catch (const char *err)
    {
        throw std::string(std::string("SQL error: ") + err);
    }

    sqlite3_close(main_db);
}
std::vector<account> getAccounts()
{
    if (sqlite3_open(dbFileName.c_str(), &main_db))
    {
        throw std::string(std::string("Can't open database: ") + sqlite3_errmsg(main_db));
    }
    std::vector<account> accounts;
    auto forEachRow = [](void *accounts, int colCount, char **colData, char **colNames) {
        account acc;
        acc.id = atol(colData[0]);
        acc.name = std::string(colData[1]);
        (*(std::vector<account> *)accounts).push_back(acc);
        return 0;
    };
    if (sqlite3_exec(main_db, GET_ACCOUNTS, forEachRow, &accounts, NULL) != SQLITE_OK)
    {
        throw sqlite3_errmsg(main_db);
    }
    sqlite3_close(main_db);
    return accounts;
}
std::vector<type> getTypes() {
    if (sqlite3_open(dbFileName.c_str(), &main_db))
    {
        throw std::string(std::string("Can't open database: ") + sqlite3_errmsg(main_db));
    }
    std::vector<type> types;
    auto forEachRow = [](void *accounts, int colCount, char **colData, char **colNames) {
        type typ;
        typ.id = atol(colData[0]);
        typ.name = std::string(colData[1]);
        (*(std::vector<type> *)accounts).push_back(typ);
        return 0;
    };
    if (sqlite3_exec(main_db, GET_TYPES, forEachRow, &types, NULL) != SQLITE_OK)
    {
        throw sqlite3_errmsg(main_db);
    }
    sqlite3_close(main_db);
    return types;
}
std::vector<expense> getExpenses() {
    if (sqlite3_open(dbFileName.c_str(), &main_db))
    {
        throw std::string(std::string("Can't open database: ") + sqlite3_errmsg(main_db));
    }
    std::vector<expense> expenses;
    auto forEachRow = [](void *expenses, int colCount, char **colData, char **colNames) {
        expense ex;
        ex.id = atol(colData[0]);
        ex.name = std::string(colData[1]);
        (*(std::vector<expense> *)expenses).push_back(ex);
        return 0;
    };
    if (sqlite3_exec(main_db, GET_EXPENSES_LITE, forEachRow, &expenses, NULL) != SQLITE_OK)
    {
        throw sqlite3_errmsg(main_db);
    }
    sqlite3_close(main_db);
    return expenses;
}

/**
 * Saves a transaction
 */
void saveTransaction()
{
    throw "UNIMPLEMENTED";
}
}