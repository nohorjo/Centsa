#ifndef SERVER_H
#define SERVER_H

#include "request_process.h"
#include "ui.h"

#include <string>
#include <cstring>

extern "C" {
int startServer(const char *ip, int port);
int serverPort();
const char *serverIP();
}

extern "C" char *process_request(http_request &req, int &code)
{
    code = 200;
    main_html_input input;
    std::string resp = main_html(input);
    char *rtnn = new char[resp.length()];
    std::strcpy(rtnn, resp.c_str());
    return rtnn;
}

#endif
