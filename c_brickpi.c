#include <stdio.h>
#include <wiringPi.h>
#include "tick.h"
#include "BrickPi.h"
#include <linux/i2c-dev.h> 

#define DIMU 99

#define PI 3.14159265359
#define I2C_SPEED 0                   // delay for as little time as possible. Usually about 100k baud

#define I2C_DEVICE_DIMU 0             // DComm is device 0 on this I2C bus

#define DIMU_GYRO_I2C_ADDR      0xD2  /*!< Gyro I2C address */

#define DIMU_GYRO_RANGE_250     0x00  /*!< 250 dps range */
#define DIMU_GYRO_RANGE_500     0x10  /*!< 500 dps range */
#define DIMU_GYRO_RANGE_2000    0x30  /*!< 2000 dps range */
#define DIMU_CTRL4_BLOCKDATA    0x80

#define DIMU_GYRO_CTRL_REG1     0x20  /*!< CTRL_REG1 for Gyro */
#define DIMU_GYRO_CTRL_REG2     0x21  /*!< CTRL_REG2 for Gyro */
#define DIMU_GYRO_CTRL_REG3     0x22  /*!< CTRL_REG3 for Gyro */
#define DIMU_GYRO_CTRL_REG4     0x23  /*!< CTRL_REG4 for Gyro */
#define DIMU_GYRO_CTRL_REG5     0x24  /*!< CTRL_REG5 for Gyro */

#define DIMU_GYRO_ALL_AXES      0x28  /*!< All Axes for Gyro */
#define DIMU_GYRO_X_AXIS        0x2A  /*!< X Axis for Gyro */
#define DIMU_GYRO_Y_AXIS        0x28  /*!< Y Axis for Gyro */
#define DIMU_GYRO_Z_AXIS        0x2C  /*!< Z Axis for Gyro */

#define DIMU_ACC_I2C_ADDR       0x3A  /*!< Accelerometer I2C address */
#define DIMU_ACC_RANGE_2G       0x04  /*!< Accelerometer 2G range */
#define DIMU_ACC_RANGE_4G       0x08  /*!< Accelerometer 4G range */
#define DIMU_ACC_RANGE_8G       0x00  /*!< Accelerometer 8G range */
#define DIMU_ACC_MODE_STBY      0x00  /*!< Accelerometer standby mode */
#define DIMU_ACC_MODE_MEAS      0x01  /*!< Accelerometer measurement mode */
#define DIMU_ACC_MODE_LVLD      0x02  /*!< Accelerometer level detect mode */
#define DIMU_ACC_MODE_PLSE      0x03  /*!< Accelerometer pulse detect mode */
#define DIMU_ACC_X_AXIS         0x00  /*!< X Axis for Accel */
#define DIMU_ACC_Y_AXIS         0x02  /*!< Y Axis for Accel */
#define DIMU_ACC_Z_AXIS         0x04  /*!< Z Axis for Accel */


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

void c_setSensorType(int port, unsigned char sensor_type) {
  BrickPi.SensorType[port] = sensor_type;
}

long c_getSensor(int port) {
  return BrickPi.Sensor[port];
}

void c_setUpDIMUSensor(int port) {
  BrickPi.SensorType       [port]    = TYPE_SENSOR_I2C;
  BrickPi.SensorI2CSpeed   [port]    = I2C_SPEED;
  BrickPi.SensorI2CDevices [port]    = 1;
  BrickPi.SensorI2CAddr    [port][I2C_DEVICE_DIMU] = DIMU_ACC_I2C_ADDR;
  BrickPi.SensorI2CWrite [port][I2C_DEVICE_DIMU]    = 2;
  BrickPi.SensorI2CRead  [port][I2C_DEVICE_DIMU]    = 0;  
  BrickPi.SensorI2COut   [port][I2C_DEVICE_DIMU][0] = 0x16;
  BrickPi.SensorI2COut   [port][I2C_DEVICE_DIMU][1] = DIMU_ACC_RANGE_2G | DIMU_ACC_MODE_MEAS;
}

float c_getDIMUSensor(int port) {
  int xx,yy,zz;
  short int           X, Y, Z;
  float x,y,z;
  float angle;

  BrickPi.SensorI2CAddr    [port][I2C_DEVICE_DIMU] = DIMU_ACC_I2C_ADDR;
  BrickPi.SensorI2CWrite [port][I2C_DEVICE_DIMU]    = 1;
  BrickPi.SensorI2CRead  [port][I2C_DEVICE_DIMU]    = 1;  
  BrickPi.SensorI2COut   [port][I2C_DEVICE_DIMU][0] = 0x06;
  //  BrickPiSetupSensors();
  //  BrickPiUpdateValues();
  xx = BrickPi.SensorI2CIn   [port][I2C_DEVICE_DIMU][0];
  if(xx>128) xx-=256;
  x = ((float)(xx))/64.0;

  return x;
}
