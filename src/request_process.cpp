#include "centsa/request_process.h"
#include "centsa/ui.h"
#include "centsa/ping.h"

#include "rapidjson/document.h"

#include <iostream>
#include <vector>

std::string mainPage(int &code, const char *data)
{
	code = 200;
	return ui_html();
}

std::string pingServer(int &code, const char *data)
{
	code = 204;
	ping::alive();
	return std::string("");
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

			t.amount = trans["amount"].GetDouble();
			t.comment = trans["comment"].GetString();
			t.accountId = trans["account"].GetInt64();
			t.typeId = trans["type"].GetInt64();
			t.expenseId = trans["expense"].GetInt64();
			t.date = trans["date"].GetInt64();

			long id = dao::saveTransaction(t);
			code = 200;
			return std::to_string(id);
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

std::string getTrans(int &code, const char *data)
{
	try
	{
		rapidjson::Document req;
		rapidjson::ParseResult result = req.Parse(data);
		if (result)
		{
			std::vector<dao::transaction> trans = dao::getTransactions(req["limit"].GetInt64(), req["offset"].GetInt64());
			std::string resp("[");
			for (dao::transaction t : trans)
			{
				resp += "{";
				resp += "\"id\":";
				resp += std::to_string(t.id);
				resp += ",\"amount\":";
				resp += std::to_string(t.amount);
				resp += ",\"comment\":\"";
				resp += t.comment;
				resp += "\",\"account\":";
				resp += std::to_string(t.accountId);
				resp += ",\"type\":";
				resp += std::to_string(t.typeId);
				resp += ",\"date\":";
				resp += std::to_string(t.date);
				resp += ",\"expense\":";
				resp += std::to_string(t.expenseId);
				resp += "},";
			}
			if (trans.size() > 0)
				resp.pop_back();
			resp += "]";
			code = 200;
			return resp;
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

std::string getAccounts(int &code, const char *data)
{
	try
	{
		std::vector<dao::account> accounts = dao::getAccounts();
		std::string resp("[");
		for (dao::account account : accounts)
		{
			resp += "{\"id\":";
			resp += std::to_string(account.id);
			resp += ",\"name\":\"";
			resp += account.name;
			resp += "\"},";
		}
		if (accounts.size() > 0)
			resp.pop_back();
		resp += "]";
		code = 200;
		return resp;
	}
	catch (const char *err)
	{
		std::cerr << err << "\n";
		return std::string(err);
	}
}

std::string getTypes(int &code, const char *data)
{
	try
	{
		std::vector<dao::type> types = dao::getTypes();
		std::string resp("[");
		for (dao::type type : types)
		{
			resp += "{\"id\":";
			resp += std::to_string(type.id);
			resp += ",\"name\":\"";
			resp += type.name;
			resp += "\"},";
		}
		if (types.size() > 0)
			resp.pop_back();
		resp += "]";
		code = 200;
		return resp;
	}
	catch (const char *err)
	{
		std::cerr << err << "\n";
		return std::string(err);
	}
}

std::string getExpenses(int &code, const char *data)
{
	try
	{
		std::vector<dao::expense> expenses = dao::getExpensesLite();
		std::string resp("[");
		for (dao::expense expense : expenses)
		{
			resp += "{\"id\":";
			resp += std::to_string(expense.id);
			resp += ",\"name\":\"";
			resp += expense.name;
			resp += "\"},";
		}
		if (expenses.size() > 0)
			resp.pop_back();
		resp += "]";
		code = 200;
		return resp;
	}
	catch (const char *err)
	{
		std::cerr << err << "\n";
		return std::string(err);
	}
}

std::string getSetting(int &code, const char *data)
{
	try
	{
		std::string resp = dao::getSetting(data);
		code = 200;
		return resp;
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
	uriBindings["/addAccount"] = addAccount;
	uriBindings["/setSetting"] = setSetting;
	uriBindings["/saveTrans"] = saveTrans;
	uriBindings["/addType"] = addType;
	uriBindings["/getTrans.json"] = getTrans;
	uriBindings["/getAccounts.json"] = getAccounts;
	uriBindings["/getTypes.json"] = getTypes;
	uriBindings["/getExpenses.json"] = getExpenses;
	uriBindings["/getSetting"] = getSetting;
}
