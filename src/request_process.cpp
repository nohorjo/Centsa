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
		i.expenses = dao::getExpenses();

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
	code = 200;
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

void bindUris()
{
	uriBindings["/"] = mainPage;
	uriBindings["/ping"] = pingServer;
	uriBindings["/transinput.html"] = transinputPage;
	uriBindings["/accounts.html"] = accountsPage;
	uriBindings["/addAccount"] = addAccount;
	uriBindings["/settings.html"] = settingsPage;
}
