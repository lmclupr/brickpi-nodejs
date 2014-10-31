{
  "targets": [
    {
      "target_name": "brickpi_capi",
      "sources": [ "c_brickpi.c", "brickpi.cc"],
      "libraries": [
        "-lwiringPi", "-lrt", "-lm", "-L/usr/local/lib"
      ],
    }
  ]
}
