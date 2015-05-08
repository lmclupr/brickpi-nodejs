var ee = require('events').EventEmitter;
var util = require('util');

var motors = require('./Motors');
var sensors = require('./Sensors');
var driver = require('./Driver');
var PORTS = require('./Ports');
var SENSOR_TYPE = require('./Sensor_Type');


exports.PORTS = PORTS;
exports.SENSOR_TYPE = SENSOR_TYPE;
exports.Motor = motors.Motor;
exports.Sensor = sensors.Sensor;

var INTERVAL_TIME = 50; // in milliseconds
var SERIAL_PORT_ADDRESS = '/dev/ttyAMA0';


var BrickPi = function(params) {
    ee.call(this);

    if (params) {
	    if (params.pollingInterval) {
		INTERVAL_TIME = params.pollingInterval;
    	}

	    if (params.serialPortAddress) {
		SERIAL_PORT_ADDRESS = params.serialPortAddress;
    	}
    }

    this._running = false;

    this._motors = [null, null, null, null];
    this._sensors = [null, null, null, null];
    
    this._driver = new driver.Driver(SERIAL_PORT_ADDRESS);
};
exports.BrickPi = BrickPi;
util.inherits(BrickPi, ee);

// setup:  open serial port, setTimeout, setupSensors and run an initial single update values.
BrickPi.prototype.setup = function() {
    this._driver.open(function(err) {
	if (err) {throw new Error(err);}
	this._driver.SetupSensors(this._sensors, function(err) {
		if (err) {throw new Error(err);}
		this._driver.UpdateValues(this._motors, this._sensors, function(err) {
			if (err) {throw new Error(err)}
			this.emit('ready');
		}.bind(this));
	}.bind(this));
    }.bind(this));
}

BrickPi.prototype.stop = function() {
    this._running = false;
}

BrickPi.prototype.run = function() {
    this._running = true;
    this._run();
}

BrickPi.prototype._run = function() {
    this._driver.UpdateValues(this._motors, this._sensors, function(err) {
	if (err) console.log(err);
	this.emit('tick');

	if (this._running) {
		setTimeout(function() {
			this._run();
		}.bind(this), INTERVAL_TIME);
	} else {
	    this._driver.close(function() {
		console.log('brickpi stopped');
	    });
	}
    }.bind(this));
}

BrickPi.prototype.addMotor = function(motor) {
	var i = motor.port.chip*2 + motor.port.index - 2;  // 0-> chip 1, index 0, 1-> chip 1, index 1 and so on.
	this._motors[i] = motor;
	return this;
}

BrickPi.prototype.addSensor = function(sensor) {
	var i = sensor.port.chip*2 + sensor.port.index - 2;
	this._sensors[i] = sensor;
	return this;
}
