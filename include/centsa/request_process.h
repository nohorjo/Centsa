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

#include "centsa/StringUtils.h"
#include "centsa/main.h"
#include "centsa/dao.h"

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

extern "C" {
char *process_request(http_request &req, int &code)
{
    request_processor rp = getProcessor(req.uri);
    if (rp != NULL)
    {
        std::string resp = rp(code, req.data);

        char *rtn = strdup(resp.c_str());
        if (rtn)
        {
            return rtn;
        }
        code = 500;
        return strdup("strdup failed");
    }
    return NULL;
}
const char *getFilePath(const char *uri)
{
    try
    {
        return std::string(exeDir + FILE_SEP "layout" FILE_SEP + dao::getSetting("LAYOUT") + uri).c_str();
    }
    catch (const char *err)
    {
        return NULL;
    }
}
}
#endif
#endif