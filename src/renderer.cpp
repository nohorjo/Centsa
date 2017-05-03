#include <wx/wx.h>
#include <wx/webview.h>

#include <string>
#include <regex>
#include <iostream>

#ifdef _WIN32
#include <windows.h>
#endif

class Frame : public wxFrame
{
  public:
    wxWebView *webView;
    wxString parentPID;

    /**
     * Kills the 'parent' process
     */
    void OnClose(wxCloseEvent &event)
    {
        if (parentPID.length() != 0)
        {
#ifdef _WIN32
            std::string call("Taskkill /PID ");
            call += parentPID;
            call += " /F";
            std::cout << call << "\n";
            WinExec(call.c_str(), SW_HIDE);
#else
            std::string call("kill -15 ");
            call += parentPID;
            std::cout << call << "\n";
            system(call.c_str());
#endif
        }
        Destroy();
    };
    Frame(const wxString &title, const wxString &url, const wxString &parentPid, wxSize size)
        : wxFrame(NULL, wxID_ANY, title, wxDefaultPosition, size)
    {
        parentPID = parentPid;
        Connect(wxEVT_CLOSE_WINDOW, wxCloseEventHandler(Frame::OnClose));
#ifndef _WIN32
        char buff[1024];
        readlink("/proc/self/exe", buff, 1024);
        std::string path(buff);

        std::regex re("/[^/]*$");

        SetIcon(wxIcon(wxString(std::regex_replace(path, re, "/icon.xpm"))));
#endif
        if (url.length() == 0)
        {
            webView = wxWebView::New(this, wxID_ANY);
            webView->SetPage(wxString("Usage: renderer TITLE URL [pid of process to kill on close]"), title);
        }
        else
        {
            webView = wxWebView::New(this, wxID_ANY, url);
        }
        this->Centre();
    };
};

class UI : public wxApp
{
  public:
    bool OnInit();
};

IMPLEMENT_APP(UI)

bool UI::OnInit()
{
    wxString url;
    wxString title;
    wxString parentPid;
    wxSize size;
    if (wxGetApp().argc < 3)
    {
        url = wxString("");
        title = wxString("Error");
        size = wxSize(400, 150);
    }
    else
    {
        if (wxGetApp().argc < 4)
        {
            parentPid = wxString("");
        }
        else
        {
            parentPid = wxString(wxGetApp().argv[3]);
        }
        url = wxString(wxGetApp().argv[2]);
        title = wxString(wxGetApp().argv[1]);
        size = wxSize(1000, 600);
    }
    Frame *frame = new Frame(title, url, parentPid, size);
    frame->Show(true);

    return true;
}
