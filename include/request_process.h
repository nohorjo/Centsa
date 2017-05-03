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

#endif