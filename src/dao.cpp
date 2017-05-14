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
                                                  CREATE_TRANSACTION_TABLE
                                                      CREATE_SETTINGS_TABLE,
                             NULL, NULL, NULL))
            {
                throw sqlite3_errmsg(main_db);
            }
        }
    }
    catch (const char *err)
    {
        throw std::string(std::string("SQL error: ") + err).c_str();
    }

    sqlite3_close(main_db);
}

/**
 * Returns IP and sets port
 */
const char *getIPPort(int *port)
{
    if (sqlite3_open(dbFileName.c_str(), &main_db))
    {
        throw std::string(std::string("Can't open database: ") + sqlite3_errmsg(main_db)).c_str();
    }
    struct ip_port
    {
        std::string ip;
        int port;
    };
    ip_port ipp;
    auto forEachRow = [](void *ipp, int colCount, char **colData, char **colNames) {
        (*(ip_port *)ipp).ip = std::string(colData[0]);
        (*(ip_port *)ipp).port = atoi(colData[1]);
        return 0;
    };
    if (sqlite3_exec(main_db, GET_IP_PORT, forEachRow, &ipp, NULL))
    {
        throw sqlite3_errmsg(main_db);
    }
    sqlite3_close(main_db);
    *port = ipp.port;
    return ipp.ip.c_str();
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
        throw sqlite3_errmsg(main_db);
    }

    long id = -1;
    auto forEachRow = [](void *id, int colCount, char **colData, char **colNames) {
        (*(long *)id) = atol(colData[0]);
        return 0;
    };
    if (sqlite3_exec(main_db, GET_LAST_ID, forEachRow, &id, NULL))
    {
        throw sqlite3_errmsg(main_db);
    }

    sqlite3_close(main_db);
    return id;
}

std::map<std::string, std::string> getSettings()
{
    if (sqlite3_open(dbFileName.c_str(), &main_db))
    {
        throw std::string(std::string("Can't open database: ") + sqlite3_errmsg(main_db)).c_str();
    }
    std::map<std::string, std::string> settings;
    auto forEachRow = [](void *settings, int colCount, char **colData, char **colNames) {
        (*(std::map<std::string, std::string> *)settings)[colData[0]] = colData[1];
        return 0;
    };
    if (sqlite3_exec(main_db, GET_SETTINGS, forEachRow, &settings, NULL))
    {
        throw sqlite3_errmsg(main_db);
    }
    sqlite3_close(main_db);
    return settings;
}

/**
 * Saves a transaction
 */
void saveTransaction()
{
    throw "UNIMPLEMENTED";
}
}