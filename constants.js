var MOTOR = {
    A: 0,
    B: 1,
    C: 2,
    D: 3,
};
exports.MOTOR = MOTOR;

var SENSOR_PORT = {
    ONE: 0,
    TWO: 1,
    THREE: 2,
    FOUR: 3,
    FIVE: 4,
};
exports.SENSOR_PORT = SENSOR_PORT;

/*
#define TYPE_SENSOR_RAW                0 // - 31
#define TYPE_SENSOR_LIGHT_OFF          0
#define TYPE_SENSOR_LIGHT_ON           (MASK_D0_M | MASK_D0_S)
#define TYPE_SENSOR_TOUCH              32
#define TYPE_SENSOR_ULTRASONIC_CONT    33
#define TYPE_SENSOR_ULTRASONIC_SS      34
#define TYPE_SENSOR_RCX_LIGHT          35 // tested minimally
#define TYPE_SENSOR_COLOR_FULL         36
#define TYPE_SENSOR_COLOR_RED          37
#define TYPE_SENSOR_COLOR_GREEN        38
#define TYPE_SENSOR_COLOR_BLUE         39
#define TYPE_SENSOR_COLOR_NONE         40
#define TYPE_SENSOR_I2C                41
#define TYPE_SENSOR_I2C_9V             42


*/

var SENSOR_TYPE = {
    TOUCH: 32,
    ULTRASONIC_CONT: 33,
    ULTRASONIC_SS: 34,
    COLOR_FULL: 36,
    I2C: 41,
    DIMU: 99,
};
exports.SENSOR_TYPE = SENSOR_TYPE;
