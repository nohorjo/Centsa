INC=-I include
CXXFLAGS=-pthread -std=gnu++11 -g -Wno-format-security
INCC=include/ui.h include/sql_scripts.h
CSS=$(shell find design -name '*.css')
HTML=$(shell find design -name '*.html')
JS=$(shell find design  -name '*.js')

UIH=$(HTML:design/%.html=include/html_ui/%.h)

INCC+=$(UIH)
ifeq ($(OS),Windows_NT)
	INC+=-I include/windows
	LIBS=-L lib/windows -lwxregexu-3.0 -lwxtiff-3.0 -lwxjpeg-3.0 -lwxpng-3.0 -lrpcrt4 -loleaut32 -lole32 -luuid -lwinspool -lwinmm -lshell32 -lcomctl32 -lcomdlg32 -ladvapi32 -lwsock32 -lgdi32 -static -static-libstdc++ -static-libgcc -lstdc++ -lpthread -lwxexpat-3.0 -lz -lws2_32
	CXXFLAGS+=-D_LARGEFILE_SOURCE=unknown -D__WXMSW__ -mthreads -Wl,--subsystem,windows -mwindows
	LDFLAGS=lib/windows/*.a lib/windows/libwx_mswu-3.0.a
	OBJ=obj/windows
	SERVOBJ=$(OBJ)/event2/bufferevent_async.o $(OBJ)/event2/buffer_iocp.o $(OBJ)/event2/win32select.o $(OBJ)/event2/event_iocp.o
	CC=gcc
	SERVRES=obj/windows/meta.res
else ifeq ($(shell uname -s),Linux)
	INC+=-I include/linux
	LIBS=-lwxregexu-3.0 -lwxtiff-3.0 -lwxjpeg-3.0 -lstdc++ -lz -L lib/linux -lgthread-2.0 -lX11 -lXxf86vm -lSM -lgtk-x11-2.0 -lgdk-x11-2.0 -latk-1.0 -lgio-2.0 -lpangoft2-1.0 -lpangocairo-1.0 -lgdk_pixbuf-2.0 -lcairo -lpango-1.0 -lfontconfig -lgobject-2.0 -lglib-2.0 -lfreetype -lpng -ldl -lm  -lwebkitgtk-1.0 -lsoup-2.4 -ljavascriptcoregtk-1.0
	CXXFLAGS+=-D__WXGTK__
	CC=gcc-4.9
	OBJ=obj/linux
	SERVOBJ=$(OBJ)/event2/epoll.o $(OBJ)/event2/select.o $(OBJ)/event2/poll.o 
	LDFLAGS=lib/linux/*.a
	RENDERER=bin/renderer
endif

SERVOBJ+=$(OBJ)/ping.o $(OBJ)/request_process.o $(OBJ)/dao.o $(OBJ)/sqlite3/sqlite3.o $(OBJ)/main.o $(OBJ)/server.o $(OBJ)/event2/bufferevent.o $(OBJ)/event2/buffer.o $(OBJ)/event2/bufferevent_ratelim.o $(OBJ)/event2/bufferevent_sock.o $(OBJ)/event2/event.o $(OBJ)/event2/event_tagging.o $(OBJ)/event2/evmap.o $(OBJ)/event2/evthread.o $(OBJ)/event2/log.o $(OBJ)/event2/listener.o $(OBJ)/event2/evutil_time.o $(OBJ)/event2/evutil_rand.o  $(OBJ)/event2/evutil.o $(OBJ)/event2/strlcpy.o $(OBJ)/event2/http.o $(OBJ)/event2/signal.o

all: $(RENDERER) bin/Centsa

bin/Centsa: $(SERVOBJ) $(SERVRES)
	$(CC) $^ -o $@ $(LIBS) $(CXXFLAGS) $(SERVRES)

bin/renderer: $(OBJ)/renderer.o
	$(CC) $< -o $@ $(LDFLAGS) $(LIBS) $(CXXFLAGS)

obj/windows/meta.res: include/wx/msw/wx.rc bin/icon.ico src/meta.rc
	windres -I include src/meta.rc -O coff -o $@

$(OBJ)/%.o: src/%.cpp $(INCC)
	$(CC) $(INC) $(LIBS) $(CXXFLAGS) -c -o $@ $<

$(OBJ)/%.o: src/%.c
	$(CC) $(INC) $(LIBS) $(CXXFLAGS) -c -o $@ $<
	
include/html_ui/%.h: design/%.htm
	mkdir -p include/html_ui
ifeq ($(shell uname -s),Linux)
	./ncspc $< > $@
endif

include/ui.h: $(UIH)
	rm -rf $@
	echo "#ifndef HTML_UI" >> $@
	echo "#define HTML_UI" >> $@
	for h in include/html_ui/*; do echo \#include \"$$(echo $$h | sed 's/include\///g')\" >> $@; done
	echo "#endif" >> $@

design/%.htm: design/%.html $(CSS) $(JS)
	java -cp . MonoHtml $< > $@

clean:
	rm -rf bin/Centsa*
	rm -rf bin/renderer*
	rm -rf $(OBJ)/*.o
	rm -rf bin/*.db
	rm -rf include/html_ui/*
ifeq ($(shell uname -s),Linux)
	rm -rf design/*.htm
endif

