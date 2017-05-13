#ifndef DAO_H
#define DAO_H

#define DATE_FORMAT "%d/%m/%y"

#include <sqlite3.h>
#include <string>
#include <ctime>
#include <vector>

namespace dao
{

typedef struct
{
    long id;
    float amount;
    std::string comment;
    long accountId;
    long typeId;
    time_t date;
    long expenseId;
} transaction;

typedef struct
{
    long id;
    std::string name;
} account;

typedef struct
{
    long id;
    std::string name;
} type;

typedef struct
{
    long id;
    std::string name;
    float cost;
    int frequencyDays;
    time_t starting;
    time_t ended;
    bool automatic;
} expense;

void prepareDB(std::string dbFile);
void saveTransaction();
std::vector<account> getAccounts();
std::vector<type> getTypes();
std::vector<expense> getExpenses();
}

#endif