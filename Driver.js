var SerialPort = require('serialport').SerialPort;
var async = require('async');
var BitArray = require('./BitArray');
var PROTOCOL = require('./Protocol');
var SENSOR_TYPE = require('./Sensor_Type');

// i am pretty sure these could be merged. left for later.
var READ_TIMEOUT = 500;  //500
var PROTOCOL_TIMEOUT = 1000; //1000


var Driver = function(serialPortAddress) {
    this._reading = null;
    this._readLength = null;
    this._readChecksum = null;
    this._readBuffer = null;
    this._readBufferOffset = null;
    this._readTimeout = null;
    this._readChecksumData = null;
    this._asyncCallback = null;
    this._asyncTimeout = null;
    this._currentChip = null;
    this._motors = null;
    this._sensors = null;
    this._serialPortAddress = serialPortAddress;
};
exports.Driver = Driver;

Driver.prototype.open = function(callback) {    
    this._serialPort = new SerialPort(this._serialPortAddress, {baudrate: 500000});
    
    // open serial communication
    this._serialPort.on("open", function(err) {
	if (err) callback(err);
	async.eachSeries([1, 2], this._SetCommunicationTimeout.bind(this), function(err) {
	    callback(err);
	});

	this._serialPort.on('data', function(data) {
	    Array.prototype.forEach.call(data, function(byte) {
    	        this._addByte(byte);
            }.bind(this));
	}.bind(this));
    }.bind(this));
}

Driver.prototype._SetCommunicationTimeout = function(chipIndex, callback) {
    this._asyncCallback = callback;	
    
    this._asyncTimeout = setTimeout(function() {
	console.log('rx Timeout');	
	callback('timed out');
    }, PROTOCOL_TIMEOUT);
    
    var timeout = 1000; // set brickpi comm timeout.

    var data = [
	timeout & 0xFF,
	(timeout >> 8) & 0xFF,
	(timeout >> 16) & 0xFF,
	(timeout >> 24) & 0xFF
    ];

    this._currentChip = chipIndex;

    this._write(chipIndex, PROTOCOL.SET_COMMUNICATION_TIMEOUT, data);
};

Driver.prototype.UpdateValues = function(motors, sensors, callback) {
    async.eachSeries([{chipIndex: 1, motors: motors, sensors: sensors}, {chipIndex: 2, motors: motors, sensors: sensors}], this._UpdateValues.bind(this), function(err) {
	callback(err);
    });
}

Driver.prototype._UpdateValues = function(params, callback) {
    this._asyncCallback = callback;
    
    this._asyncTimeout = setTimeout(function() {
	console.log('rx Timeout');
	callback('timed out');
    }, PROTOCOL_TIMEOUT);
    
    this._motors = params.motors;
    this._sensors = params.sensors;
    var motors = this._motors;
    var sensors = this._sensors; // sorry for sloppyness.  
    var chipIndex = params.chipIndex;
    
    // 2x motors with 10 bits each + 2 for the encoder offsets
    var data = new BitArray();
    data.addBits(0, 0, 2, 0);
    
    // process the motors and sensors asscociated with the chipIndex
    for (var i=(chipIndex*2 - 2); i<(chipIndex*2); i++) {
	var motor = motors[i];
	
	if(motor != null) {
	    var speed = motor.speed;
	    var direction = 0
	    
	    if(speed < 0) {
		direction = 1
		speed *= -1
	    }
	    
	    if(speed > 255) {
		speed = 255
	    }
	    
	    var value = ((((speed & 0xFF) << 2) | ((direction & 0x11) << 1) | ((motor.enabled ? 1 : 0) & 0x01)) & 0x3FF);
	    data.addBits(0, 0, 10, value);
	} else {
	    data.addBits(0, 0, 10, 0);
	}
    }
    
    for (var i=(chipIndex*2 - 2); i < (chipIndex*2); i++) {
	var sensor = sensors[i];
	
	if (sensor != null) {
	    // TOUCH, and other NON I2C sensors, nothing to do.

	    if (sensor.type === SENSOR_TYPE.DEXTER.IMU.ACC) {
		if (!sensor.setupDone) {
			sensor.setupDone = true;
			data.addBits(0, 0, 4, 2); // I2C WRITE
			data.addBits(0, 0, 4, 0); // I2C READ
			data.addBits(0, 0, 8, 0x16 /**/);
			data.addBits(0, 0, 8, 0x05 /*DIMU_ACC_RANGE_2G 0x04 | DIMU_ACC_MODE_MEAS 0x01 */); // I2Cout
		}
		data.addBits(0, 0, 4, 1); // Write
		data.addBits(0, 0, 4, 1); // Read
		data.addBits(0, 0, 8, sensor.currentAxis); // I2Cout  0x06 x 0x07 y 0x08 z
	    }
//	    console.log('update value request: ' + data.getArray());
	}
    }
    

    this._currentChip = chipIndex;
    this._write(chipIndex, PROTOCOL.READ_SENSOR_VALUES, data.getArray());
}

Driver.prototype.SetupSensors = function(sensors, callback) {
//	console.log('setting up sensors');
    async.eachSeries([{chipIndex: 1, sensors: sensors}, {chipIndex: 2, sensors: sensors}], this._SetupSensors.bind(this), function(err) {
	callback(err);
    });
}

Driver.prototype._SetupSensors = function(params, callback) {
    this._asyncCallback = callback;
    
    this._asyncTimeout = setTimeout(function() {
	console.log('rx Timeout');
	callback('timed out');
    }, PROTOCOL_TIMEOUT);
    
    this._sensors = params.sensors;
    var chipIndex = params.chipIndex;
    
    var data = new BitArray();

    for (var i=(chipIndex*2 - 2); i<(chipIndex*2); i++) {
	var sensor = this._sensors[i];

	if (sensor != null) {
		if (sensor.type === SENSOR_TYPE.NXT.ULTRASONIC.CONT) {
			data.addBits(0, 0, 8, SENSOR_TYPE.I2C);
			data.addBits(0, 0, 8, 10 /*US_I2C_SPEED*/);
			data.addBits(0, 0, 3, 0); // # devices - 1
			data.addBits(0, 0, 7, 1/*LEGO_US_I2C_ADDR >> 1*/);
			data.addBits(0, 0, 2, 0x03 /* sensor settings (BIT_I2C_MID | BIT_I2C_SAME)*/);
			data.addBits(0, 0, 4, 1); // I2C WRITE
			data.addBits(0, 0, 4, 1); // I2C READ
			data.addBits(0, 0, 8, 0x42 /*LEGO_US_I2C_DATA_REG*/);
		} else if (sensor.type === SENSOR_TYPE.DEXTER.IMU.ACC) {
			data.addBits(0, 0, 8, SENSOR_TYPE.I2C);
			data.addBits(0, 0, 8, 0 /*I2C_SPEED*/);
			data.addBits(0, 0, 3, 0); // # devices - 1
			data.addBits(0, 0, 7, 0x3A >> 1 /* DIMU_ACC_I2C_ADDR >> 1*/);
			data.addBits(0, 0, 2, 0x00 /* sensor settings */);
		} else {
			data.addBits(0, 0, 8, sensor.type);
		}
	} else {
		data.addBits(0, 0, 8, 0);
	}
    }
    
    this._currentChip = chipIndex;
    this._write(chipIndex, PROTOCOL.CONFIGURE_SENSORS, data.getArray());
}


Driver.prototype._write = function(chipIndex, command, data) { 
    var packet = new Buffer(data.length + 4);
    
    // clear the read buffer before writing...
    this._serialPort.flush(function(error) {
	if(error) {
	    callback(error);
	    return;
	}
	
	// + 1 for the command byte
	var dataLength = data.length + 1;
	
	// the checksum is the sum of all the bytes in the entire packet EXCEPT the checksum
	var checksum = chipIndex + command + dataLength + Array.prototype.reduce.call(data, function(a, b, index) {
	    packet[index + 4] = b & 0xFF
	    return a + (b & 0xFF)
	}, 0);
	
	packet[0] = chipIndex & 0xFF
	packet[1] = checksum & 0xFF
	packet[2] = dataLength
	packet[3] = command & 0xFF

	var buf = new Buffer(packet);

	this._serialPort.write(new Buffer(packet), function(err, results) {
	    if (err && this._asynCallback) this._asyncCallback('write error');
	});
    }.bind(this));
}

Driver.prototype._addByte = function(byte) {
    if(!this._reading) {	
	if(this._readChecksum === null) {
            return this._recordExpectedChecksum(byte)
	}
	
	if(this._readLength === null) {
            return this._recordExpectedReadLength(byte)
	}
    }
    
    this._readChecksumData += byte
    
    this._readBuffer[this._readBufferOffset] = byte
    this._readBufferOffset++
    
    this._checkResponseIfFinished();   
}

Driver.prototype._recordExpectedChecksum = function(byte) {
    this._readChecksum = byte   
}

Driver.prototype._recordExpectedReadLength = function(byte) {
    this._readLength = byte;
    this._readChecksumData = this._readLength;
    
    this._readBuffer = new Buffer(this._readLength);
    this._readBufferOffset = 0;
    
    this._reading = true
    
    this._readTimeout = setTimeout(function() {
	if(this._readBuffer[0]) {
		if (this._asynCallback) this._asyncCallback('read timeout');
	} else {
		if (this._asynCallback) this._asyncCallback('read timeout');
	}
	this._resetReadFields();
    }.bind(this), READ_TIMEOUT);
}


Driver.prototype._checkResponseIfFinished = function() {
    if(this._readBufferOffset != this._readLength) {
	return;
    }
    
    // done reading response
    clearTimeout(this._readTimeout)
    
    var error = undefined;
    
    if((this._readChecksumData & 0xFF) != this._readChecksum) {
	if (this._asyncCallback) this._asyncCallback('checksum failed');
    }

    // this is where the reponse from the Brickpi is handled.
    if (this._readBuffer[0] === PROTOCOL.SET_COMMUNICATION_TIMEOUT) {
	if (this._asyncTimeout) clearTimeout(this._asyncTimeout);
	this._asyncCallback(null);
    }

    if (this._readBuffer[0] === PROTOCOL.READ_SENSOR_VALUES) {
	var incoming = new BitArray(this._readBuffer);
	
	var encoderLengths = [
	    incoming.getBits(1, 0, 5),
	    incoming.getBits(1, 0, 5),
	]
	
	for(var i = 0; i < 2; i++) {
	    var value = incoming.getBits(1, 0, encoderLengths[i]);
	    var position = value;
	    position = (position/2).toFixed(0);

	    if(value & 0x01) {
    	        position *= -1;
  	    }

            if (this._motors) {
		if (this._motors[this._currentChip*2 + i - 2]) {
			// motor is defined. update position
			this._motors[this._currentChip*2 + i - 2]._update(position);
		}
            }
	}

	for (var i = 0; i < 2; i++) {
		// read sensor values.
		var sensor = this._sensors[this._currentChip*2 + i - 2];

		if (sensor) {
			var value;
			if (sensor.type === SENSOR_TYPE.NXT.TOUCH) {
	 			value = incoming.getBits(1, 0, 1);
			} else if (sensor.type === SENSOR_TYPE.NXT.ULTRASONIC.CONT) {
				var port = incoming.getBits(1, 0, 1);
				value = incoming.getBits(1, 0, 8);
			} else if (sensor.type === SENSOR_TYPE.DEXTER.IMU.ACC) {
				var port = incoming.getBits(1, 0, 1);
				value = incoming.getBits(1, 0, 8);

				value = (value > 128) ? ((value-256)/64) : (value/64);
				
				var newValue = sensor.getValue();
				if (sensor.currentAxis === 0x6) {
					sensor.currentAxis = 0x07; // set it up so that next cycle, the y is read.
					newValue.x = value;
					value = newValue;
				} else if (sensor.currentAxis === 0x7) {
					sensor.currentAxis = 0x08; // set it up so that next cycle, the z is read.
					newValue.y = value;
					value = newValue;
				} else {
					sensor.currentAxis = 0x06; // set it up so that next cycle, the x is read.
					newValue.z = value;
					value = newValue;
				}

			} else if (sensor.type === SENSOR_TYPE.NXT.ULTRASONIC.SS) {
				// i don't know how _SS works.  Need to implement _CONT
	 			value = incoming.getBits(1, 0, 8);
			} else if (sensor.type === SENSOR_TYPE.NXT.COLOR.FULL) {
				value = {blank: incoming.getBits(1, 0, 10), red: incoming.getBits(1, 0, 10), green: incoming.getBits(1, 0, 10), blue: incoming.getBits(1, 0, 10)};
			} else { // COLOR.RED, etc..
				value = incoming.getBits(1, 0, 10);
			}
			sensor._update(value);
		} else {
			incoming.getBits(1, 0, 10);
		}
	}

	if (this._asyncTimeout) clearTimeout(this._asyncTimeout);
	this._asyncCallback(null);
    }

    if (this._readBuffer[0] === PROTOCOL.CONFIGURE_SENSORS) {
	if (this._asyncTimeout) clearTimeout(this._asyncTimeout);
	this._asyncCallback(null);
    }

    this._resetReadFields();
}

Driver.prototype._resetReadFields = function() {
    this._reading = false;
    this._readChecksum = null;
    this._readLength = null;
    this._readBuffer = null;
}

Driver.prototype.close = function(callback) {
    this._serialPort.close(function() {
	if (callback) callback();
    });
}


