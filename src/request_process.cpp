#include "request_process.h"
#include "ui.h"
#include "ping.h"

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
	uriBindings["/addAccount"] = addAccount;
	uriBindings["/setSetting"] = setSetting;
	uriBindings["/saveTrans"] = saveTrans;
	uriBindings["/addType"] = addType;
}
