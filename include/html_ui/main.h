#ifndef main_NCSP
#define main_NCSP
#include <sstream>
#include <string>
#include "server.h"
typedef struct {}main_html_input;

main_html_input default_input;
std::string main_html(main_html_input &input = default_input){
std::stringstream page;
page << "<!DOCTYPE html>";
page << "<html>";
page << "";
page << "";
page << "<head>";
page << "    <style>body {";
page << "  background: #FFFFFF;";
page << "  -webkit-user-select: none;";
page << "  -ms-user-select: none;";
page << "  user-select: none;";
page << "}";
page << "</style>";
page << "    <script>/**";
page << " * Prevent text selection";
page << " */";
page << "document.onselectstart = function () { return false; }";
page << "";
page << "/**";
page << " * Custom context menu";
page << " */";
page << "function contextMenu() {";
page << "}";
page << "";
page << "/**";
page << " * Prevent default context menu";
page << " */";
page << "function init() {";
page << "    if (document.addEventListener) {";
page << "        document.addEventListener('contextmenu', function (e) { contextMenu(); e.preventDefault(); }, false);";
page << "    } else {";
page << "        document.attachEvent('oncontextmenu', function () { contextMenu(); window.event.returnValue = false; });";
page << "    }";
page << "}";
page << "";
page << "/**";
page << " * Needed for Trident";
page << " */";
page << "setTimeout(init, 1000);";
page << "</script>";
page << "</head>";
page << "";
page << "<body onload=\"init()\">";
page << "Server running on port: "<< serverPort()  <<"";
page << "</body>";
page << "";
page << "</html>";
return page.str();
}

#endif