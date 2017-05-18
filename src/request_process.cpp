#include "request_process.h"
#include "ui.h"
#include "ping.h"
#include "dao.h"

#include "rapidjson/document.h"

#include <iostream>
#include <vector>

std::string mainPage(int &code, const char *data)
{
	code = 200;
	return main_html();
}

std::string transinputPage(int &code, const char *data)
{
	try
	{
		transinput_html_input i;

		i.accounts = dao::getAccounts();
		i.types = dao::getTypes();
		i.expenses = dao::getExpensesLite();
		i.transactions = dao::getTransactions();

		code = 200;
		return transinput_html(i);
	}
	catch (const char *err)
	{
		std::cerr << err << "\n";
		return std::string(err);
	}
};

std::string pingServer(int &code, const char *data)
{
	code = 204;
	ping::alive();
	return std::string("");
}

std::string accountsPage(int &code, const char *data)
{
	try
	{
		accounts_html_input i;
		i.accounts = dao::getAccounts();
		code = 200;
		return accounts_html(i);
	}
	catch (const char *err)
	{
		std::cerr << err << "\n";
		return std::string(err);
	}
}

std::string addAccount(int &code, const char *data)
{
	try
	{
		long id = dao::addAccount(data);
		std::cout << "Created new account: " << id << "\n";
		code = 200;
		return std::to_string(id);
	}
	catch (const char *err)
	{
		std::cerr << err << "\n";
		return std::string(err);
	}
}

std::string settingsPage(int &code, const char *data)
{
	try
	{
		settings_html_input i;
		i.settings = dao::getSettings();
		code = 200;
		return settings_html(i);
	}
	catch (const char *err)
	{
		std::cerr << err << "\n";
		return std::string(err);
	}
}

std::string setSetting(int &code, const char *data)
{
	try
	{
		rapidjson::Document setting;
		rapidjson::ParseResult result = setting.Parse(data);
		if (result)
		{
			const char *key = setting["setting"].GetString();
			const char *value = setting["value"].GetString();
			dao::setSetting(key, value);
			std::cout << "Set " << key << " to " << value << "\n";
			code = 204;
			return std::string("");
		}

		code = 400;
		return std::string("JSON error ") + data;
	}
	catch (const char *err)
	{
		std::cerr << err << "\n";
		return std::string(err);
	}
}

std::string saveTrans(int &code, const char *data)
{
	try
	{
		rapidjson::Document trans;
		rapidjson::ParseResult result = trans.Parse(data);
		if (result)
		{
			dao::transaction t;

			t.amount = atof(trans["AMOUNT"].GetString());
			t.comment = trans["COMMENT"].GetString();
			t.accountId = atol(trans["ACCOUNT"].GetString());
			t.typeId = atol(trans["TYPE"].GetString());
			t.expenseId = atol(trans["EXPENSE"].GetString());
			t.date = trans["DATE"].GetInt64();

			dao::saveTransaction(t);
			code = 204;
			return std::string("");
		}

		code = 400;
		return std::string("JSON error ") + data;
	}
	catch (const char *err)
	{
		std::cerr << err << "\n";
		return std::string(err);
	}
}

std::string typesPage(int &code, const char *data)
{
	try
	{
		types_html_input i;
		i.types = dao::getTypes();
		code = 200;
		return types_html(i);
	}
	catch (const char *err)
	{
		std::cerr << err << "\n";
		return std::string(err);
	}
}

std::string expensesPage(int &code, const char *data)
{
	try
	{
		code = 200;
		expenses_html_input i;
		i.expenses = dao::getExpenses();
		return expenses_html(i);
	}
	catch (const char *err)
	{
		std::cerr << err << "\n";
		return std::string(err);
	}
}

std::string addType(int &code, const char *data)
{
	try
	{
		long id = dao::addType(data);
		std::cout << "Created new type: " << id << "\n";
		code = 200;
		return std::to_string(id);
	}
	catch (const char *err)
	{
		std::cerr << err << "\n";
		return std::string(err);
	}
}
void bindUris()
{
	uriBindings["/"] = mainPage;
	uriBindings["/ping"] = pingServer;
	uriBindings["/transinput.html"] = transinputPage;
	uriBindings["/accounts.html"] = accountsPage;
	uriBindings["/addAccount"] = addAccount;
	uriBindings["/settings.html"] = settingsPage;
	uriBindings["/setSetting"] = setSetting;
	uriBindings["/saveTrans"] = saveTrans;
	uriBindings["/types.html"] = typesPage;
	uriBindings["/expenses.html"] = expensesPage;
	uriBindings["/addType"] = addType;
}
