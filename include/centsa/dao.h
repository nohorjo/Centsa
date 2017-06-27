#ifndef DAO_H
#define DAO_H

#include <sqlite3.h>
#include <string>
#include <ctime>
#include <vector>
#include <map>

namespace dao
{

typedef struct
{
    long id;
    double amount;
    std::string comment;
    long accountId;
    long typeId;
    long expenseId;
    time_t date;
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
    double cost;
    int frequencyDays;
    time_t started;
    time_t ended;
    bool automatic;
} expense;

void prepareDB(std::string dbFile);
long saveTransaction(transaction t);
std::vector<account> getAccounts();
std::vector<type> getTypes();
std::vector<expense> getExpensesLite();
std::vector<expense> getExpenses();
long addAccount(const char *name);
std::map<std::string, std::string> getSettings();
void setSetting(const char *setting, const char *value);
std::string getSetting(const char *setting);
std::vector<transaction> getTransactions(int limit, int offset);
long addType(const char *name);
}

#endif