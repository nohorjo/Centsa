#include "centsa/server.h"
#include "centsa/dao.h"
#include "centsa/ping.h"
#include "centsa/main.h"

#include <string>
#include <thread>
#include <regex>

#include <iostream>

#ifdef _WIN32
#include <windows.h>
#else
#include <unistd.h>
#endif

std::string exeDir;

/**
 * Starts renderer
 */
static void ui()
{
    while (!serverPort())
    {
        continue; // wait for the server to start up
    }
    // generate url
    std::string url("http://");
    const char *ip = serverIP();
    if (ip[0] == ':')
    {
        url += "[";
        url += ip;
        url += "]";
    }
    else
    {
        url += ip;
    }
    url += ":";
    url += std::to_string(serverPort());
    url += "/";
    std::cout << "Server running on: " << url << "\n";
#ifdef _WIN32
    // load url in default browser
    ShellExecute(0, 0, url.c_str(), 0, 0, SW_SHOW);
#else
    std::string uiCall("xdg-open ");
    uiCall += url;
    system(uiCall.c_str());
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
        int port = atoi(dao::getSetting("PORT").c_str());
        std::string ip = dao::getSetting("IP");
        char *err = startServer(ip.c_str(), port);
        if (err)
        {
            // reset ip and port
            dao::setSetting("IP", "::1");
            dao::setSetting("PORT", "0");
            throw err;
        }
    }
    catch (const char *err)
    {
#ifdef _WIN32
        MessageBox(NULL, err, "Error", MB_OK | MB_ICONERROR);
#else
        std::cerr << err << "\n";
#endif
        return 1;
    }
    return 0;
}