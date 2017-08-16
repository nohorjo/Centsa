INC=-I include
CFLAGS=-pthread -g -Wno-format-security -Wno-builtin-macro-redefined
INCC=include/centsa/ui.h include/centsa/sql_scripts.h include/centsa/dao.h include/centsa/request_process.h include/centsa/StringUtils.h

ifeq ($(OS),Windows_NT)
	INC+=-I include/windows
	LIBS=-L lib/windows -lrpcrt4 -loleaut32 -lole32 -luuid -lwinspool -lwinmm -lshell32 -lcomctl32 -lcomdlg32 -ladvapi32 -lwsock32 -lgdi32 -static -static-libstdc++ -static-libgcc -lstdc++ -lpthread -lz -lws2_32
	OBJ=obj/windows
	SERVOBJ=$(OBJ)/event2/bufferevent_async.o $(OBJ)/event2/buffer_iocp.o $(OBJ)/event2/win32select.o $(OBJ)/event2/event_iocp.o
	CC=gcc
	SERVRES=obj/windows/meta.res
else ifeq ($(shell uname -s),Linux)
	INC+=-I include/linux
	LIBS=-lstdc++ -lz -L lib/linux -lgthread-2.0 -lX11 -lXxf86vm -lSM -lgio-2.0 -lpangoft2-1.0 -lpangocairo-1.0 -lgdk_pixbuf-2.0 -lcairo -lpango-1.0 -lfontconfig -lgobject-2.0 -lglib-2.0 -lfreetype -lpng -ldl -lm
	CC=gcc-4.9
	OBJ=obj/linux
	SERVOBJ=$(OBJ)/event2/epoll.o $(OBJ)/event2/select.o $(OBJ)/event2/poll.o 
endif

SERVOBJ+=$(OBJ)/ping.o $(OBJ)/request_process.o $(OBJ)/dao.o $(OBJ)/sqlite3/sqlite3.o $(OBJ)/main.o $(OBJ)/server.o $(OBJ)/event2/bufferevent.o $(OBJ)/event2/buffer.o $(OBJ)/event2/bufferevent_ratelim.o $(OBJ)/event2/bufferevent_sock.o $(OBJ)/event2/event.o $(OBJ)/event2/event_tagging.o $(OBJ)/event2/evmap.o $(OBJ)/event2/evthread.o $(OBJ)/event2/log.o $(OBJ)/event2/listener.o $(OBJ)/event2/evutil_time.o $(OBJ)/event2/evutil_rand.o  $(OBJ)/event2/evutil.o $(OBJ)/event2/strlcpy.o $(OBJ)/event2/http.o $(OBJ)/event2/signal.o
CXXFLAGS=$(CFLAGS) -std=gnu++11

all: bin/Centsa

bin/Centsa: $(SERVOBJ) $(SERVRES)
	$(CC) $^ -o $@ $(LIBS) $(CXXFLAGS) $(SERVRES)

bin/renderer: $(OBJ)/renderer.o
	$(CC) $< -o $@ $(LIBS) $(CXXFLAGS)

obj/windows/meta.res: bin/icon.ico src/meta.rc
	cmd /c "windres -I include src/meta.rc -O coff -o $@"

$(OBJ)/%.o: src/%.cpp $(INCC)
	$(CC) $(INC) $(LIBS) $(CXXFLAGS) -c -o $@ $<

$(OBJ)/%.o: src/%.c
	$(CC) $(INC) $(LIBS) $(CFLAGS) -c -o $@ $<

include/centsa/ui.h: design/ui.html
ifeq ($(shell uname -s),Linux)
	./ncspc $< > $@
endif

clean:
	rm -rf bin/Centsa*
	rm -rf bin/renderer*
	rm -rf $(OBJ)/*.o
	rm -rf bin/*.db
ifeq ($(shell uname -s),Linux)
	rm -rf include/centsa/ui.h
endif

_clean: clean
	rm -rf obj/windows/*.o
	rm -rf obj/linux/*.o