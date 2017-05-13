#include <wx/wx.h>
#include <wx/webview.h>

#include <string>
#include <regex>
#include <iostream>

#ifndef _WIN32
#include "../bin/icon.xpm"
#endif

class Frame : public wxFrame
{
  public:
    wxWebView *webView;
    Frame(const wxString &title, const wxString &url, wxSize size)
        : wxFrame(NULL, wxID_ANY, title, wxDefaultPosition, size)
    {
        if (url.length() == 0)
        {
            webView = wxWebView::New(this, wxID_ANY);
            webView->SetPage(wxString("Usage: renderer TITLE URL"), title);
        }
        else
        {
            webView = wxWebView::New(this, wxID_ANY, url);
        }
#ifndef _WIN32
        SetIcon(wxIcon(icon_xpm));
#endif
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
    wxSize size;
    if (wxGetApp().argc < 3)
    {
        url = wxString("");
        title = wxString("Error");
        size = wxSize(400, 150);
    }
    else
    {
        url = wxString(wxGetApp().argv[2]);
        title = wxString(wxGetApp().argv[1]);
        size = wxSize(1000, 600);
    }
    Frame *frame = new Frame(title, url, size);
    frame->Show(true);

    return true;
}
