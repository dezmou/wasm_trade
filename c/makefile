all: main.c
	/home/dez/pro/trade/c/emsdk/upstream/emscripten/emcc main.c -O3 -s WASM=1 -s SIDE_MODULE=1 -o main.wasm
	mv main.wasm ../trade/public/