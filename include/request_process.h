#ifndef REQUEST_PROCESS_H
#define REQUEST_PROCESS_H

#define HTTP_GET 0
#define HTTP_POST 1

typedef struct
{
    const char *uri;
    const char *data;
    int method;
} http_request;

#ifdef __cplusplus

#include "StringUtils.h"

#include <cstring>
#include <map>
#include <stdexcept>

typedef std::string (*request_processor)(int &, const char *);

std::map<std::string, request_processor> uriBindings;

void bindUris();

request_processor getProcessor(const char *uri)
{
    if (!uriBindings.size())
    {
        bindUris();
    }
    try
    {
        return uriBindings.at(uri);
    }
    catch (const std::out_of_range &oor)
    {
        return NULL;
    }
}

extern "C" char *process_request(http_request &req, int &code)
{
    request_processor rp = getProcessor(req.uri);
    if (rp != NULL)
    {
        std::string resp = rp(code, req.data);

        // These seem to cause problems....
        replaceAll(resp, "%", "%%");
        replaceAll(resp, "%;", "% ;");
        replaceAll(resp, "($", "( $");
        replaceAll(resp, "$(\"", "$( \"");
        replaceAll(resp, "\")", "\" )");

        char *rtn = new char[resp.length()];
        std::strcpy(rtn, resp.c_str());
        return rtn;
    }
    code = 404;
    return NULL;
}
#endif
#endif