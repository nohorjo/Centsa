#include "request_process.h"

#include "util-internal.h"

#ifdef _WIN32
#include <winsock2.h>
#include <ws2tcpip.h>
#include <windows.h>
#else
#include <signal.h>
#endif

#include <event2/event.h>
#include <event2/http.h>
#include <event2/buffer.h>
#include <event2/util.h>
#include <event2/keyvalq_struct.h>

#include <sys/stat.h>
#include <fcntl.h>

#ifdef EVENT__HAVE_NETINET_IN_H
#include <netinet/in.h>
#ifdef _XOPEN_SOURCE_EXTENDED
#include <arpa/inet.h>
#endif
#endif

#include <string.h>

static int got_port = 0;
static char *server_ip = "127.0.0.1";

static const struct table_entry
{
	const char *extension;
	const char *content_type;
} content_type_table[] = {
	{"html", "text/html"},
	{"htm", "text/htm"},
	{"css", "text/css"},
	{"js", "text/javascript"},
	{"gif", "image/gif"},
	{"jpg", "image/jpeg"},
	{"jpeg", "image/jpeg"},
	{"png", "image/png"},
	{"ico", "image/x-icon"},
	{NULL, NULL},
};

static const char *guess_content_type(const char *path)
{
	const char *last_period, *extension;
	const struct table_entry *ent;
	last_period = strrchr(path, '.');
	if (last_period && !strchr(last_period, '/'))
	{
		extension = last_period + 1;
		for (ent = &content_type_table[0]; ent->extension; ++ent)
		{
			if (!evutil_ascii_strcasecmp(ent->extension, extension))
			{
				return ent->content_type;
			}
		}
	}
	return "application/misc";
}

int serverPort() { return got_port; };
char *serverIP() { return server_ip; };

static void process_request_cb(struct evhttp_request *req, void *arg)
{

	http_request hreq;

	switch (evhttp_request_get_command(req))
	{
	case EVHTTP_REQ_GET:
		hreq.method = HTTP_GET;
		break;
	case EVHTTP_REQ_POST:
		hreq.method = HTTP_POST;
		break;
	default:
		evhttp_send_error(req, HTTP_BADREQUEST, 0);
		return;
	}

	const char *uri = evhttp_request_get_uri(req);
	hreq.uri = uri;

	struct evhttp_uri *decoded = evhttp_uri_parse(uri);

	if (!decoded)
	{
		printf("It's not a good URI. Sending BADREQUEST\n");
		evhttp_send_error(req, HTTP_BADREQUEST, 0);
		return;
	}
	char *dbuff = NULL;
	if (hreq.method)
	{
		struct evbuffer *buf = evhttp_request_get_input_buffer(req);
		dbuff = malloc(evbuffer_get_length(buf) + 1);
		dbuff[evbuffer_get_length(buf)] = 0;
		evbuffer_copyout(buf, dbuff, evbuffer_get_length(buf));
		hreq.data = dbuff;
	}

	int code = 500;
	struct evbuffer *evb = evbuffer_new();
	char *resp = (char *)(intptr_t)process_request(&hreq, &code);

	if (resp)
	{
		evbuffer_add_printf(evb, "%s", resp);
	}
	else
	{
		//response is a static file
		const char *filePath = (char *)(intptr_t)getFilePath(uri);
		if (filePath)
		{
			int fd = -1;
			struct stat st;
			if ((fd = open(filePath, O_RDONLY)) >= 0)
			{
				if (fstat(fd, &st) >= 0)
				{
					code = 200;
					const char *contentType = guess_content_type(uri);
					evhttp_add_header(evhttp_request_get_output_headers(req), "Content-Type", contentType);
					evbuffer_add_file(evb, fd, 0, st.st_size);
				}
			}
			else
			{
				code = 404;
			}
		}
		else
		{
			code = 500;
			evbuffer_add_printf(evb, "%s", "Error layout not set");
		}
	}
	evhttp_send_reply(req, code, "", evb);

	free(dbuff);
	free(evb);
	if (resp)
	{
		free(resp);
	}
}

char *startServer(const char *ip, int port)
{
	struct event_base *base;
	struct evhttp *http;
	struct evhttp_bound_socket *handle;

#ifdef _WIN32
	WSADATA WSAData;
	WSAStartup(0x101, &WSAData);
#else
	if (signal(SIGPIPE, SIG_IGN) == SIG_ERR)
		return "SIG_ERR";
#endif

	if (!(base = event_base_new()))
	{
		return "Couldn't create an event_base: exiting";
	}

	if (!(http = evhttp_new(base)))
	{
		return "couldn't create evhttp. Exiting";
	}

	evhttp_set_gencb(http, process_request_cb, ".");

	if (!(handle = evhttp_bind_socket_with_handle(http, ip, port)))
	{
		return "Invalid IP/port";
	}

	{
		struct sockaddr_storage ss;
		evutil_socket_t fd;
		ev_socklen_t socklen = sizeof(ss);
		char addrbuf[128];
		void *inaddr;
		const char *addr;
		fd = evhttp_bound_socket_get_fd(handle);
		memset(&ss, 0, sizeof(ss));
		if (getsockname(fd, (struct sockaddr *)&ss, &socklen))
		{
			return "getsockname() failed";
		}
		if (ss.ss_family == AF_INET)
		{
			got_port = ntohs(((struct sockaddr_in *)&ss)->sin_port);
			inaddr = &((struct sockaddr_in *)&ss)->sin_addr;
		}
		else if (ss.ss_family == AF_INET6)
		{
			got_port = ntohs(((struct sockaddr_in6 *)&ss)->sin6_port);
			inaddr = &((struct sockaddr_in6 *)&ss)->sin6_addr;
		}
		else
		{
			char *buffer = (char *)malloc(sizeof(char) * 1024);
			sprintf(buffer, "Weird address family %d\n", ss.ss_family);
			return buffer;
		}
		if (addr = evutil_inet_ntop(ss.ss_family, inaddr, addrbuf, sizeof(addrbuf)))
		{
			server_ip = strdup(addr);
			printf("Listening on %s:%d\n", addr, got_port);
		}
		else
		{
			return "evutil_inet_ntop failed";
		}
	}

	event_base_dispatch(base);
	return 0;
}
