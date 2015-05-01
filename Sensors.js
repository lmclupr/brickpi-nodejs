// module that contains the sensor class
var util = require('util');
var ee = require('events').EventEmitter;

Sensor = function(params) {
    ee.call(this);
    this.name = params.name;
    this.decription = params.description;

    this.type = params.type;
    this.port = params.port;
	this._value = {x: null, y: null, z: null};

	// for DIUM sensors
	this.setupDone = false;
	this.currentAxis = 0x06; // x
}
exports.Sensor = Sensor;
util.inherits(Sensor, ee);


Sensor.prototype._update = function(value) {
	this._value = value;
}

Sensor.prototype.getValue = function() {
	return this._value;
}



