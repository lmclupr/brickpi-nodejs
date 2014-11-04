var brickpi_capi = require('./build/Release/brickpi_capi');
var events = require('events');
var event = new events.EventEmitter();
var constants = require('./constants');

exports.event = event;

exports.MOTOR = constants.MOTOR;
exports.SENSOR_PORT = constants.SENSOR_PORT;
exports.SENSOR_TYPE = constants.SENSOR_TYPE;

console.log(constants.SENSOR_PORT.ONE);

function CreateRobot() {
    var robot = {
        motors: [],
        encoders: [],
        sensors: [],
	values: [],
	intervalId: null,
        Run: function(callback) {
            var t = this;
	    brickpi_capi.BrickPiSetupSensors();
            this.intervalId = setInterval(function() {
                brickpi_capi.BrickPiUpdateValues();
                callback();

                for (var i=0; i<t.motors.length; i++) {
                    if (t.encoders[i] != brickpi_capi.GetEncoder(t.motors[i].port)) {
                        t.encoders[i] = brickpi_capi.GetEncoder(t.motors[i].port);
                        t.motors[i].Moved(t.encoders[i]);
                        event.emit('move', t.motors[i]);
                    } else if (t.motors[i].speed !== 0) {
			// the motor speed is non null, yet, the motor isn't moving
			// i.e. it is stuck.  issue event.
			console.log('motor is stucked');
			event.emit('stuck', t.motors[i]);
		    }

                }

		for (var i=0; i<t.sensors.length; i++) {
                    if (t.values[i] != brickpi_capi.GetSensor(t.sensors[i].port)) {
                        t.values[i] = brickpi_capi.GetSensor(t.sensors[i].port);
                        t.sensors[i].Changed(t.values[i]);
                        event.emit('change', t.sensors[i]);
                    }
                }
            }, 10);

            return this;
	},
        Setup: function() {
            brickpi_capi.ClearTick();
            brickpi_capi.BrickPiSetup();
            brickpi_capi.SetAddress(0, 1);
            brickpi_capi.SetAddress(1, 2);
            return this;
        },
        AddMotor: function(motor) {
            brickpi_capi.SetMotorEnable(motor.port);
            this.motors.push(motor);
            brickpi_capi.BrickPiUpdateValues();
            return this;
        },
        AddSensor: function(sensor) {
	    brickpi_capi.SetSensorType(sensor.port, sensor.type);
            this.sensors.push(sensor);
	    brickpi_capi.BrickPiUpdateValues();
            return this;
        },
	Stop: function() {
	    if (this.intervalId) clearInterval(this.intervalId);
	}
    }
    return robot;
}
exports.CreateRobot = CreateRobot;


function CreateMotor(params) {
    var motor = {
        port: params.port,
        name: params.name,
        speed: 0,
        position: null,
        callback: null,
	pausedSpeed: 0,
	paused: false,
	GetState: function() {
	    return {
		name: this.name,
		port: this.port,
		position: this.position,
		paused: this.paused,
		speed: this.speed,
	    };
	},
        Start: function(speed) {
            this.speed = speed;
            brickpi_capi.SetMotorSpeed(this.port, speed);
            return this;
        },
        Stop: function() {
            brickpi_capi.SetMotorSpeed(this.port, 0);
            this.endEncoderValue = null;
            this.speed = 0;
            event.emit('stop', this);
            return this;
        },
        endEncoderValue: null,
        StopIn: function(amount, callback) {
            this.callback = callback;
            var startEncoderValue = brickpi_capi.GetEncoder(this.port);
            this.endEncoderValue = startEncoderValue + this.speed*amount/(Math.abs(this.speed));
            return this;
        },
	Pause: function() {
	    console.log('speed:' + this.speed);
	    this.pausedSpeed = this.speed;
	    brickpi_capi.SetMotorSpeed(this.port, 0);
	    this.paused = true;
	    return this;
	},
	Resume: function() {
	    console.log('pausedSpeed:' + this.pausedSpeed);
	    this.speed = this.pausedSpeed;
	    this.paused = false;
	    brickpi_capi.SetMotorSpeed(this.port, this.speed);
	    return this;
	},
        Moved: function(encoderValue) {
            this.position = encoderValue;
            if (!this.endEncoderValue) return;
            if ((this.speed > 0) && (encoderValue >= this.endEncoderValue)) {
		this.Stop();
		this.callback();
            } else if ((this.speed < 0) && (encoderValue <= this.endEncoderValue)) {
                this.Stop();
                this.callback();
            }
        },
    };
    return motor;
}
exports.CreateMotor = CreateMotor;


function CreateSensor(params) {
    var sensor = {
	name: params.name,
	port: params.port,
	type: params.type,
	value: null,
	GetState: function() {
	    return {
		name: this.name,
		port: this.port,
		type: this.type,
		value: this.value,
	    };
	},
	Changed: function(value) {
//	    console.log('changed called with value: ' + value);
	    if (value !== this.value) {
		this.value = value;
		if (this.type === constants.SENSOR_TYPE.TOUCH) {
		    event.emit('touch', this);
		}
	    } 
	}
    };
    return sensor;
}
exports.CreateSensor = CreateSensor;