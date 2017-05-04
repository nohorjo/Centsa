#include "dao.h"
#include "sql_scripts.h"

#include <string>

sqlite3 *main_db;

/**
 * Checks the database if file exists, tries to create it and set it up if not
 */
void dao::prepareDB()
{

    if (sqlite3_open("data.db", &main_db))
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

/**
 * Checks if the TRANSACTIONS exists
 */
bool dao::transTableExists()
{
    struct rowCounter
    {
        static int forEachRow(void *data, int colCount, char **colData, char **colNames)
        {
            int *rowCount = (int *)data;
            (*rowCount)++;
            return 0;
        }
    };
    int *rowCount = new int;
    *rowCount = 0;
    if (sqlite3_exec(main_db, CHECK_TABLE, rowCounter::forEachRow, rowCount, NULL) != SQLITE_OK)
    {
        throw sqlite3_errmsg(main_db);
    }

    bool rtn = *rowCount > 0;
    delete rowCount;
    return rtn;
}

/**
 * Saves a transaction
 */
void dao::saveTransaction()
{
    throw "UNIMPLEMENTED";
}