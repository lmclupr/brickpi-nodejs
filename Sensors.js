// module that contains the sensor class
var util = require('util');
var ee = require('events').EventEmitter;

Sensor = function(params) {
    ee.call(this);
    this.name = params.name;
    this.decription = params.description;

    this.type = params.type;
    this.port = params.port;
    this.value = {};
}

var checkForChange = function(newValue,value) {
	if(typeof newValue === 'object') {
		for(var attr in newValue) {
			if(newValue[attr] != value[attr]) {
				return true;
			}
		}
	}
	else {
		if(value != newValue) {
			return true;
		}
	}
}

Sensor.prototype._update = function(newValue) {
	var self = this;

	var oldValue = this.value;
	
	this.value = newValue;

	process.nextTick(function() {
		self.emit('updated',self.name,self.value);
	});
	
	if(checkForChange(newValue,oldValue)) {
		process.nextTick(function() {
			self.emit('changed',self.name,self.value);
		});
		
	}
}

Sensor.prototype.getValue = function() {
	return this.value;
}

util.inherits(Sensor, ee);
exports.Sensor = Sensor;



