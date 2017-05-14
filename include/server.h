#ifndef SERVER_H
#define SERVER_H

#include <string>
#include <cstring>

extern "C" {
char *startServer(const char *ip, int port);
int serverPort();
const char *serverIP();
}

#endif
