#include "request_process.h"
#include "ui.h"
#include "ping.h"

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
	code = 200;
	transinput_html_input i;

	std::vector<const char *> acc;
	acc.push_back("BANK");
	acc.push_back("POCKET");
	i.accounts = acc;

	std::vector<const char *> ty;
	ty.push_back("FOOD");
	ty.push_back("RENT");
	i.types = ty;

	std::vector<const char *> ex;
	ex.push_back("FOOD");
	ex.push_back("RENT");
	i.expenses = ex;

	return transinput_html(i);
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
