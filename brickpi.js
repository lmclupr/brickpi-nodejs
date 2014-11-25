var brickpi_capi = require('./build/Release/brickpi_capi');
var events = require('events');
var event = new events.EventEmitter();
var constants = require('./constants');

exports.event = event;

exports.MOTOR = constants.MOTOR;
exports.SENSOR_PORT = constants.SENSOR_PORT;
exports.SENSOR_TYPE = constants.SENSOR_TYPE;

function createRobot() {
    var robot = {
        motors: [],
        encoders: [0,0,0,0],
	retries: [0,0,0,0],

        sensors: [],
	values: [null, null, null, null, null],

	intervalId: null,
        run: function(callback) {
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

		    console.log("value: " + brickpi_capi.getSensor(t.sensors[i].port));

                    if (t.values[i] != brickpi_capi.getSensor(t.sensors[i].port)) {
                        t.values[i] = brickpi_capi.getSensor(t.sensors[i].port);
                        t.sensors[i]._changed(t.values[i]);
                    }
                }

            }, 10);

            return this;
	},
        setup: function() {
            brickpi_capi.clearTick();
            brickpi_capi.brickPiSetup();
            brickpi_capi.setAddress(0, 1);
            brickpi_capi.setAddress(1, 2);
            return this;
        },
        addMotor: function(motor) {
            brickpi_capi.setMotorEnable(motor.port);
            this.motors.push(motor);
            brickpi_capi.brickPiUpdateValues();
            return this;
        },
        addSensor: function(sensor) {
	    brickpi_capi.setSensorType(sensor.port, sensor.type);
            this.sensors.push(sensor);
	    brickpi_capi.brickPiUpdateValues();
            return this;
        },
	addDIMUSensor: function(sensor) {
	    brickpi_capi.setUpDIMUSensor(sensor.port);
	    return this;
	},
	stop: function() {
	    if (this.intervalId) clearInterval(this.intervalId);
	}
    }
    return robot;
}
exports.createRobot = createRobot;


function createMotor(params) {
    var motor = {
        port: params.port,
        name: params.name,
        speed: 0,
        position: null,
        callback: null,
	pausedSpeed: 0,
	paused: false,
	endPoints: [null, null],
        getPosition: function() {
            return this.position;
        },
        getName: function() {
            return this.name;
        },
        getCurrentSpeed: function() {
            return this.speed;
        },
        isPaused: function() {
            return this.paused;
        },
        getPort: function() {
            return this.port;
        },
	setEndPoints: function(a, b) {
	    var currentPosition = brickpi_capi.getEncoder(this.port);
	    console.log(currentPosition);
	    if (b > 0) console.log("lower end point must be negative");
	    if (a < 0) console.log("higher end point must be position");
	    this.endPoints = [a + currentPosition, b + currentPosition];
	    return this;
	},
        start: function(speed, callback) {
            this.speed = speed;
            brickpi_capi.setMotorSpeed(this.port, speed);
	    if (callback) {
		this.callback = callback;
	    }
            return this;
        },
        stop: function(err) {
            brickpi_capi.setMotorSpeed(this.port, 0);
            this.endEncoderValue = null;
            this.speed = 0;
	    if (this.callback) this.callback(err);
            event.emit('stop', this);
            return this;
        },
        endEncoderValue: null,
        stopIn: function(amount, callback) {
            this.callback = callback;
            var startEncoderValue = brickpi_capi.getEncoder(this.port);
            this.endEncoderValue = startEncoderValue + this.speed*amount/(Math.abs(this.speed));
            return this;
        },
	pause: function() {
	    if (!this.paused && (this.speed !== 0) && (this.endEncoderValue !== null)) {
		//console.log('speed:' + this.speed);
		this.pausedSpeed = this.speed;
		this.speed = 0;
		brickpi_capi.setMotorSpeed(this.port, 0);
		this.paused = true;
	    }
	    return this;
	},
	resume: function() {
	    if (this.paused) {
		//console.log('pausedSpeed:' + this.pausedSpeed);
		this.speed = this.pausedSpeed;
		this.paused = false;
		brickpi_capi.setMotorSpeed(this.port, this.speed);
	    }
	    return this;
	},
        _moved: function(encoderValue) {
            this.position = encoderValue;
	    event.emit('move', this);

            if (this.endEncoderValue) {
		if ((this.speed > 0) && (encoderValue >= this.endEncoderValue)) {
		    this.stop();
		} else if ((this.speed < 0) && (encoderValue <= this.endEncoderValue)) {
                    this.stop();
		}
	    }

	    // checking endpoints
	    if ((this.endPoints[0]) &&  (encoderValue > this.endPoints[0])) {
		console.log('end point reached');
                this.stop('end point reached');
            }

            if ((this.endPoints[1]) &&  (encoderValue < this.endPoints[1])) {
		console.log('endpoint reached');
                this.stop('end point reached');
	    }
        },
	_stuck: function(encoderValue) {
	    this.position = encoderValue;
	    event.emit('stuck', this);
	    this.stop('stuck');
	}
    };
    return motor;
}
exports.createMotor = createMotor;


function createSensor(params) {
    var sensor = {
	name: params.name,
	port: params.port,
	type: params.type,
	value: null,
	getValue: function() {
	    return this.value;
	},
        getName: function() {
            return this.name;
        },
        getType: function() {
            return this.type;
        },
	getPort: function() {
            return this.port;
        },
	_changed: function(value) {
//	    console.log('changed called with value: ' + value);
	    if (value !== this.value) {
		this.value = value;
		event.emit('change', this);
		if (this.type === constants.SENSOR_TYPE.TOUCH) {
		    event.emit('touch', this);
		}
	    } 
	}
    };
    return sensor;
}
exports.createSensor = createSensor;

function createDIMUSensor(params) {
    var sensor = {
        name: params.name,
        port: params.port,
        type: params.type,
        value: null,
        getValue: function() {
            return brickpi_capi.getDIMUSensor(this.port);
        },
        getName: function() {
            return this.name;
        },
        getType: function() {
            return this.type;
        },
        getPort: function() {
            return this.port;
        },
        _changed: function(value) {
//          console.log('changed called with value: ' + value);                                                                 
            if (value !== this.value) {
                this.value = value;
                event.emit('change', this);
                if (this.type === constants.SENSOR_TYPE.TOUCH) {
                    event.emit('touch', this);
                }
            }
        }
    };
    return sensor;
}
exports.createDIMUSensor = createDIMUSensor;
