var brickpi_capi = require('./build/Release/brickpi_capi');
var ee = require('events').EventEmitter;
var util = require('util');
var constants = require('./constants');

exports.MOTOR = constants.MOTOR;
exports.SENSOR_PORT = constants.SENSOR_PORT;
exports.SENSOR_TYPE = constants.SENSOR_TYPE;

function Robot() {
    this.motors = [];
    this.encoders = [0,0,0,0];
    this.retries = [0,0,0,0];

    this.sensors = [];
    this.values = [null, null, null, null, null];

    this.intervalId = null;
    this.run = function(callback) {
        var t = this;
	brickpi_capi.brickPiSetupSensors();
        this.intervalId = setInterval(function() {
            brickpi_capi.brickPiUpdateValues();
            if (callback) callback();
	    
            for (var i=0; i<t.motors.length; i++) {
		var currentEncoderValue = brickpi_capi.getEncoder(t.motors[i].port);
		
                if (t.encoders[i] !== currentEncoderValue) {
                    t.encoders[i] = currentEncoderValue;
		    t.motors[i]._moved(currentEncoderValue);
                } else if (t.motors[i].speed !== 0) {
		    if (t.retries[i] < 4) {
			t.retries[i]++;
		    } else {
			t.retries[i] = 0;
			t.motors[i]._stuck(t.encoders[i]);
		    }
		}
	    }
	    
	    for (var i=0; i<t.sensors.length; i++) {
		t.sensors[i]._updateValue();
            }
	    
        }, 10);
	
        return this;
    };
    this.setup = function() {
        brickpi_capi.clearTick();
        brickpi_capi.brickPiSetup();
        brickpi_capi.setAddress(0, 1);
        brickpi_capi.setAddress(1, 2);
        return this;
    };
    this.addMotor = function(motor) {
        brickpi_capi.setMotorEnable(motor.port);
        this.motors.push(motor);
        brickpi_capi.brickPiUpdateValues();
        return this;
    };
    this.addSensor = function(sensor) {
	if (sensor.type === constants.SENSOR_TYPE.DIMU) {
		brickpi_capi.setUpDIMUSensor(sensor.port);
	} else {
		brickpi_capi.setSensorType(sensor.port, sensor.type);
		brickpi_capi.brickPiUpdateValues();
	}
	this.sensors.push(sensor);
        return this;
    };
    this.stop = function() {
	if (this.intervalId) clearInterval(this.intervalId);
    };
}
exports.Robot = Robot;


function Motor(params) {
    this.port = params.port;
    this.name = params.name;
    this.speed = 0;
    this.position = null;
    this.callback = null;
    this.pausedSpeed = 0;
    this.paused = false;
    this.getPosition = function() {
        return this.position;
    };
    this.getName = function() {
        return this.name;
    };
    this.getCurrentSpeed = function() {
        return this.speed;
    };
    this.isPaused = function() {
        return this.paused;
    };
    this.getPort = function() {
        return this.port;
    };
    this.start = function(speed, callback) {
        this.speed = speed;
        brickpi_capi.setMotorSpeed(this.port, speed);
	if (callback) {
	    this.callback = callback;
	}
        return this;
    };
    this.stop = function(err) {
        brickpi_capi.setMotorSpeed(this.port, 0);
        this.endEncoderValue = null;
        this.speed = 0;
	if (this.callback) this.callback(err);
        this.emit('stop', this);
        return this;
    };
    this.endEncoderValue = null,
    this.stopIn = function(amount, callback) {
        this.callback = callback;
        var startEncoderValue = brickpi_capi.getEncoder(this.port);
        this.endEncoderValue = startEncoderValue + this.speed*amount/(Math.abs(this.speed));
        return this;
    };
    this.pause = function() {
	if (!this.paused && (this.speed !== 0) && (this.endEncoderValue !== null)) {
	    //console.log('speed:' + this.speed);
	    this.pausedSpeed = this.speed;
	    this.speed = 0;
	    brickpi_capi.setMotorSpeed(this.port, 0);
		this.paused = true;
	}
	return this;
    };
    this.resume = function() {
	if (this.paused) {
	    //console.log('pausedSpeed:' + this.pausedSpeed);
	    this.speed = this.pausedSpeed;
	    this.paused = false;
	    brickpi_capi.setMotorSpeed(this.port, this.speed);
	}
	return this;
    };
    this._moved = function(encoderValue) {
        this.position = encoderValue;
	this.emit('move', this);
	
        if (this.endEncoderValue) {
	    if ((this.speed > 0) && (encoderValue >= this.endEncoderValue)) {
		this.stop();
	    } else if ((this.speed < 0) && (encoderValue <= this.endEncoderValue)) {
                this.stop();
	    }
	}
    };
    this._stuck = function(encoderValue) {
	this.position = encoderValue;
	this.emit('stopped', this);
	this.stop('stopped');
    }
    ee.call(this);
}
util.inherits(Motor, ee);
exports.Motor = Motor;

function Sensor(params) {
    ee.call(this);

    this.name = params.name;
    this.port = params.port;
    this.type = params.type;
    this.value = null;
    this.getValue = function() {
	return this.value;
    };
    this.getName = function() {
        return this.name;
    };
    this.getType = function() {
        return this.type;
    };
    this.getPort = function() {
        return this.port;
    };
    this._updateValue = function() {
	if (this.type === constants.SENSOR_TYPE.DIMU) {
		var z = brickpi_capi.getDIMUSensor(this.port, 0);
		brickpi_capi.brickPiUpdateValues();
		var x = brickpi_capi.getDIMUSensor(this.port, 1);
		brickpi_capi.brickPiUpdateValues();
		var y = brickpi_capi.getDIMUSensor(this.port, 2);
		this.value = {'x': x, 'y': y, 'z': z};
		this.emit('change', this);
	} else {
		var value = brickpi_capi.getSensor(this.port);
		if (value != this.value) {
		    this.emit('change', this);
		    this.value = value;
		}
	}
    }
}
util.inherits(Sensor, ee);
exports.Sensor = Sensor;

