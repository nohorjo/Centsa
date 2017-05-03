#include "server.h"
#include "dao.h"

#include <string>
#include <thread>
#include <regex>

#include <iostream>

#ifdef _WIN32
#include <windows.h>
#else
#include <unistd.h>
#endif

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
    uiArgs += " ";
#ifdef _WIN32
    WCHAR buff[MAX_PATH];
    GetModuleFileNameW(GetModuleHandleW(NULL), buff, MAX_PATH);
    std::wstring ws(buff);
    std::string path(ws.begin(), ws.end());

    std::regex re("\\\\[^\\\\]*$");
    std::string uiCall("\\renderer.exe ");

    uiArgs += std::to_string(GetCurrentProcessId());

    uiCall += uiArgs;
    std::cout << uiCall.c_str() << "\n";
    WinExec(std::regex_replace(path, re, uiCall.c_str()).c_str(), SW_SHOWNORMAL);
#else
    char buff[1024];
    readlink("/proc/self/exe", buff, 1024);
    std::string path(buff);

    std::regex re("/[^/]*$");
    std::string uiCall("/renderer ");

    uiArgs += std::to_string(::getpid());

    uiCall += uiArgs;
    std::cout << uiCall.c_str() << "\n";
    system(std::regex_replace(path, re, uiCall.c_str()).c_str());
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
#else
    if (argc != 1)
    {
        standalone = std::string(argv[1]) == "standalone";
    }
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
        dao::prepareDB();
        startServer("127.0.0.1", 8080);
    }
    catch (std::string err)
    {
        std::cerr << err << "\n";
    }
}