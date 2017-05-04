#include "request_process.h"
#include "ui.h"

#include <string>
#include <cstring>
#include <iostream>


std::string mainPage(int &code, const char *data)
{
	code = 200;
	std::string resp = main_html();
	return resp;
};

void bindUris()
{
	uriBindings["/"] = mainPage;
}

