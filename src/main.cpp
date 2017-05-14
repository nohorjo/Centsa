#include "server.h"
#include "dao.h"
#include "ping.h"

#include <string>
#include <thread>
#include <regex>

#include <iostream>

#ifdef _WIN32
#define FILE_SEP "\\"

#include <windows.h>
#else
#define FILE_SEP "/"

#include <unistd.h>
#endif

std::string exeDir;

/**
 * Starts renderer
 */
static void ui()
{
    while (serverPort() == 0)
    {
        continue; // wait for the server to start up
    }
    // generate url
    std::string url("http://");
    url += serverIP();
    url += ":";
    url += std::to_string(serverPort());
    url += "/ ";
#ifdef _WIN32
    // load url in default browser
    ShellExecute(0, 0, url.c_str(), 0, 0, SW_SHOW);
#else
    std::string uiCall(FILE_SEP "renderer ");
    uiCall += "Centsa ";
    uiCall += url;
    std::cout << uiCall.c_str() << "\n";
    system(std::string(exeDir + uiCall).c_str());
#endif
}

#ifdef _WIN32
int WINAPI WinMain(HINSTANCE hInstance, HINSTANCE hPrevInstance, LPSTR lpCmdLine, int nCmdShow)
#else
int main(int argc, char **argv)
#endif
{
    bool standalone = false;
#ifdef _WIN32

    // check cli args
    standalone = std::string(lpCmdLine) == "standalone";

    // get executable directory
    WCHAR buff[MAX_PATH];
    GetModuleFileNameW(GetModuleHandleW(NULL), buff, MAX_PATH);
    std::wstring ws(buff);
    std::string path(ws.begin(), ws.end());
    std::regex re("\\\\[^\\\\]*$");

    exeDir = std::regex_replace(path, re, "");
#else

    if (argc != 1)
    {
        // check cli args
        standalone = std::string(argv[1]) == "standalone";
    }

    // get executable directory
    char buff[1024];
    readlink("/proc/self/exe", buff, 1024);
    std::string path(buff);
    std::regex re("/[^/]*$");

    exeDir = std::regex_replace(path, re, "");

#endif

    if (!standalone)
    {
        // if not running as a standalone server, expect a browser to be constantly pinging it
        ping::init();
        std::thread(ui).detach();
    }
    else
    {
        std::cout << "Running standalone server\n";
    }
    try
    {
        dao::prepareDB(std::string(exeDir + FILE_SEP "data.db"));
        startServer("127.0.0.1", 0);
    }
    catch (const char *err)
    {
#ifdef _WIN32
        MessageBox(NULL, err, "Error", MB_OK | MB_ICONERROR);
#else
        std::cerr << err << "\n";
#endif
    }
}