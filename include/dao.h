#ifndef DAO_H
#define DAO_H

#include <sqlite3.h>
namespace dao
{
void prepareDB();
bool transTableExists();
void saveTransaction();
}

#endif