#include "server.h"
#include "dao.h"

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
        continue; // Wait for the server to start up
    }
    std::string uiArgs("Centsa http://");
    uiArgs += serverIP();
    uiArgs += ":";
    uiArgs += std::to_string(serverPort());
    uiArgs += "/ ";
#ifdef _WIN32
    std::string uiCall(FILE_SEP "renderer.exe ");
    uiArgs += std::to_string(GetCurrentProcessId()); // give the pid so that renderer can terminate the server
    uiCall += uiArgs;
    std::cout << uiCall.c_str() << "\n";
    WinExec(std::string(exeDir + uiCall).c_str(), SW_SHOWNORMAL);
#else
    std::string uiCall(FILE_SEP "renderer ");
    uiArgs += std::to_string(::getpid()); // give the pid so that renderer can terminate the server
    uiCall += uiArgs;
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
    standalone = std::string(lpCmdLine) == "standalone";

    WCHAR buff[MAX_PATH];
    GetModuleFileNameW(GetModuleHandleW(NULL), buff, MAX_PATH);
    std::wstring ws(buff);
    std::string path(ws.begin(), ws.end());

    std::regex re("\\\\[^\\\\]*$");

    exeDir = std::regex_replace(path, re, "");
#else
    if (argc != 1)
    {
        standalone = std::string(argv[1]) == "standalone";
    }

    char buff[1024];
    readlink("/proc/self/exe", buff, 1024);
    std::string path(buff);

    std::regex re("/[^/]*$");

    exeDir = std::regex_replace(path, re, "");

#endif

    if (!standalone)
    {
        std::thread(ui).detach();
    }
    else
    {
        std::cout << "Running standalone server\n";
    }
    try
    {
        dao::prepareDB(std::string(exeDir + FILE_SEP "data.db").c_str());
        startServer("127.0.0.1", 0);
    }
    catch (std::string err)
    {
        std::cerr << err << "\n";
    }
}