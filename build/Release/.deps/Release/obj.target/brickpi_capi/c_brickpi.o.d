cmd_Release/obj.target/brickpi_capi/c_brickpi.o := cc '-D_LARGEFILE_SOURCE' '-D_FILE_OFFSET_BITS=64' '-DBUILDING_NODE_EXTENSION' -I/home/pi/.node-gyp/0.10.28/src -I/home/pi/.node-gyp/0.10.28/deps/uv/include -I/home/pi/.node-gyp/0.10.28/deps/v8/include  -fPIC -Wall -Wextra -Wno-unused-parameter -pthread -O2 -fno-strict-aliasing -fno-tree-vrp -fno-omit-frame-pointer  -MMD -MF ./Release/.deps/Release/obj.target/brickpi_capi/c_brickpi.o.d.raw  -c -o Release/obj.target/brickpi_capi/c_brickpi.o ../c_brickpi.c
Release/obj.target/brickpi_capi/c_brickpi.o: ../c_brickpi.c ../tick.h \
 ../BrickPi.h
../c_brickpi.c:
../tick.h:
../BrickPi.h:
