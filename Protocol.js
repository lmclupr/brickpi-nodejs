var PROTOCOL = {

  /**
   * Change the UART address.
   */
  CHANGE_UART_ADDRESS: 0x01,

  /**
   * Change/set the sensor type.
   */
  CONFIGURE_SENSORS: 0x02,

  /**
   * Set the motor speed and direction, and return the sesnors and encoders.
  */
  READ_SENSOR_VALUES: 0x03,

  /**
   * Float motors immediately
   */
  EMERGENCY_STOP: 0x04,

  /**
   * Set the timeout to stop motors if we stop communicating with the BrickPi
   */
  SET_COMMUNICATION_TIMEOUT: 0x05
}

module.exports = Object.freeze(PROTOCOL)
