#include "request_process.h"
#include "ui.h"
#include "ping.h"
#include "dao.h"

#include <string>
#include <cstring>

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
		return std::string(err);
	}
};

std::string pingServer(int &code, const char *data)
{
	code = 200;
	ping::alive();
	return std::string("");
}

void bindUris()
{
	uriBindings["/"] = mainPage;
	uriBindings["/ping"] = pingServer;
	uriBindings["/transinput.html"] = transinputPage;
}
