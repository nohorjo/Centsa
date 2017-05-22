#ifndef ui_NCSP
#define ui_NCSP

#include <sstream>
#include <string>

std::string ui_html(){
std::stringstream page;
page << "<html>\n";
page << "\n";
page << "<head>\n";
page << "    <title>Centsa</title>\n";
page << "    <style>\n";
page << "        body {\n";
page << "            margin: 0;\n";
page << "        }\n";
page << "\n";
page << "        div {\n";
page << "            position: fixed;\n";
page << "            width: 20px;\n";
page << "            height: 20px;\n";
page << "            background: red;\n";
page << "            top: 0px;\n";
page << "            right: 0px;\n";
page << "        }\n";
page << "\n";
page << "        iframe {\n";
page << "            width: 100%;\n";
page << "        }\n";
page << "    </style>\n";
page << "    <script>\n";
page << "        var iframe;\n";
page << "        // keep iframe the same size as the body\n";
page << "        function resizeIframe() {\n";
page << "               iframe.height = document.body.scrollHeight;\n";
page << "        }\n";
page << "        // keep server alive\n";
page << "        function pingServer() {\n";
page << "            var xmlHttp = new XMLHttpRequest();\n";
page << "            xmlHttp.open(\"GET\", \"/ping\", true);\n";
page << "            xmlHttp.send(null);\n";
page << "        }\n";
page << "        function init() {\n";
page << "            iframe = document.querySelector(\"iframe\");\n";
page << "            setInterval(pingServer, 15000);\n";
page << "            resizeIframe();\n";
page << "        }\n";
page << "        function showSettings() {\n";
page << "            alert(\"unimplemented\");\n";
page << "        }\n";
page << "    </script>\n";
page << "</head>\n";
page << "\n";
page << "<body onload=\"init()\" onresize=\"resizeIframe()\">\n";
page << "    <div onmouseover=\"showSettings()\"></div>\n";
page << "    <iframe frameborder=\"no\" src=\"main.html\"></iframe>\n";
page << "</body>\n";
page << "\n";
page << "</html>\n";
return page.str();
}

#endif