var SENSOR_TYPE = {
  I2C: 41,
  I2C_9V: 42,

  NXT: {
    TOUCH: 32,
    ULTRASONIC: {
      CONT: 33, 
      SS: 34
    },
    LIGHT: {
//      ON: (Mask.D0_M | Mask.D0_S),
      OFF: 0
    },
    COLOR: {
      FULL: 36,
      RED: 37,
      GREEN: 38,
      BLUE: 39,
      NONE: 40
    }
  },
  DEXTER: {
    IMU: {
	ACC: 99,
	GYRO: 100,
	}
  }

}

module.exports = Object.freeze(SENSOR_TYPE);
