int c_ClearTick();
int c_BrickPiSetup();
int c_BrickPiSetupSensors();
int c_BrickPiUpdateValues();

void c_setAddress(int index, int address);
void c_setMotorEnable(int port);
void c_setMotorSpeed(int port, int speed);
long c_getEncoder(int port);
int c_getMotorEnable(int port);
void c_setSensorType(int port, unsigned char sensor_type);
long c_getSensor(int port);

void c_setUpDIMUSensor(int port);
float c_getDIMUSensor(int port);
