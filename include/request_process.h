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

#include <string>
#include <map>
#include <cstring>

struct cmp_str
{
    bool operator()(char const *a, char const *b)
    {
        return std::strcmp(a, b) < 0;
    }
};

typedef std::string (*request_processor)(int &, const char *);
typedef std::map<const char *, request_processor, cmp_str> UrlBindings;

UrlBindings uriBindings;

void bindUris();

request_processor getProcessor(const char *uri)
{
    if (!uriBindings.size())
    {
        bindUris();
    }

    UrlBindings::iterator it = uriBindings.find(uri);
    if (it != uriBindings.end())
    {
        return it->second;
    }

    return NULL;
}

extern "C" char *process_request(http_request &req, int &code)
{
    request_processor rp = getProcessor(req.uri);
    if (rp != NULL)
    {
        std::string resp = rp(code, req.data);
        char *rtn = new char[resp.length()];
        std::strcpy(rtn, resp.c_str());
        return rtn;
    }
    code = 404;
    return NULL;
}
#endif __cplusplus
#endif REQUEST_PROCESS_H