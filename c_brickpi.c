#include <stdio.h>
#include <wiringPi.h>
#include "tick.h"
#include "BrickPi.h"

int c_ClearTick() {
  return ClearTick();
}

int c_BrickPiSetup() {
  return BrickPiSetup();
}

int c_BrickPiSetupSensors() {
  return BrickPiSetupSensors();
}

int c_BrickPiUpdateValues() {
  return BrickPiUpdateValues();
}

void c_setAddress(int index, int address) {
  BrickPi.Address[index]=address;
}

void c_setMotorEnable(int port) {
  BrickPi.MotorEnable[port] = 1;
}

void c_setMotorSpeed(int port, int speed) {
  BrickPi.MotorSpeed[port]=speed;
}

long c_getEncoder(int port) {
  return BrickPi.Encoder[port];
}

int c_getMotorEnable(int port) {
  return BrickPi.MotorEnable[port];
}
