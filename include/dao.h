#ifndef DAO_H
#define DAO_H

#define DATE_FORMAT "%d/%m/%y"

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
const char *getIPPort(int *port);
void saveTransaction();
std::vector<account> getAccounts();
std::vector<type> getTypes();
std::vector<expense> getExpenses();
long addAccount(const char *name);
std::map<std::string, std::string> getSettings();
void setSetting(const char *setting, const char *value);
}

#endif