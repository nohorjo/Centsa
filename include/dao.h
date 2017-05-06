#ifndef DAO_H
#define DAO_H

#include <sqlite3.h>
namespace dao
{
void prepareDB(const char *dbFile);
bool transTableExists();
void saveTransaction();
}

#endif