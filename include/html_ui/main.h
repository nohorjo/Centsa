#ifndef main_NCSP
#define main_NCSP
#include <sstream>
#include <string>
#include "server.h"
#include <vector>
#include <string>

typedef struct {
    std::vector<const char*> accounts;
    std::vector<const char*> types;
    std::vector<const char*> expenses;
}main_html_input;

main_html_input default_input;
std::string main_html(main_html_input &input = default_input){
std::stringstream page;
page << "<!DOCTYPE html>\n";
page << "<html>\n";
page << "\n";
page << "\n";
page << "<head>\n";
page << "    <style>body {\n";
page << "  background: #FFFFFF;\n";
page << "  -webkit-user-select: none;\n";
page << "  -ms-user-select: none;\n";
page << "  user-select: none;\n";
page << "  font-size: 11pt;\n";
page << "}\n";
page << "</style>\n";
page << "    <script>/**\n";
page << " * Prevent text selection\n";
page << " */\n";
page << "document.onselectstart = function () { return false; }\n";
page << "\n";
page << "/**\n";
page << " * Custom context menu\n";
page << " */\n";
page << "function contextMenu() {\n";
page << "}\n";
page << "\n";
page << "/**\n";
page << " * Prevent default context menu\n";
page << " */\n";
page << "function init() {\n";
page << "    if (document.addEventListener) {\n";
page << "        document.addEventListener('contextmenu', function (e) { contextMenu(); e.preventDefault(); }, false);\n";
page << "    } else {\n";
page << "        document.attachEvent('oncontextmenu', function () { contextMenu(); window.event.returnValue = false; });\n";
page << "    }\n";
page << "}\n";
page << "\n";
page << "/**\n";
page << " * Needed for Trident\n";
page << " */\n";
page << "setTimeout(init, 1000);\n";
page << "\n";
page << "function alertHi(){\n";
page << "    alert('hi');\n";
page << "}</script>\n";
page << "</head>\n";
page << "\n";
page << "<body onload=\"init()\">\n";
page << "    Server running on port:\n";
page << "    "<< serverPort()  <<"\n";
page << "    <hr>\n";
page << "    <table>\n";
page << "        <tbody>\n";
page << "            <tr>\n";
page << "                <td>Amount</td>\n";
page << "                <td><input type=\"number\" step='0.01' value='0.00' placeholder='0.00'></td>\n";
page << "            </tr>\n";
page << "            <tr>\n";
page << "                <td>Comment</td>\n";
page << "                <td><input></td>\n";
page << "            </tr>\n";
page << "            <tr>\n";
page << "                <td>Account</td>\n";
page << "                <td><select>\n";
                    for(const char * account:input.accounts){
page << "                        <option value=\""<<account <<"\" >"<<account <<"</option>\n";
                    }
page << "                    </select></td>\n";
page << "            </tr>\n";
page << "            <tr>\n";
page << "                <td>Type</td>\n";
page << "                <td><select>\n";
                    for(const char * type:input.types){
page << "                        <option value=\""<<type <<"\" >"<<type <<"</option>\n";
                    }
page << "                    </select></td>\n";
page << "            </tr>\n";
page << "            <tr>\n";
page << "                <td>Date</td>\n";
page << "                <td><input type=\"date\"></td>\n";
page << "            </tr>\n";
page << "            <tr>\n";
page << "                <td>Expense</td>\n";
page << "                <td><select>\n";
page << "                    <option value=\"NONE\">N/A</option>\n";
                    for(const char * expense:input.expenses){
page << "                        <option value=\""<<expense <<"\" >"<<expense <<"</option>\n";
                    }
page << "                    </select></td>\n";
page << "            </tr>\n";
page << "            <tr>\n";
page << "                <td><input type=\"button\" onclick=\"alertHi()\" value=\"Save\"></td>\n";
page << "            </tr>\n";
page << "        </tbody>\n";
page << "    </table>\n";
page << "</body>\n";
page << "\n";
page << "</html>\n";
return page.str();
}

#endif