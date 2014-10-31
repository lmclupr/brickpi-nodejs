var brickpi_capi = require('./build/Release/brickpi-capi');
var events = require('events');
var event = new events.EventEmitter();

exports.event = event;

function CreateRobot() {
    var robot = {
        motors: [],
        encoders: [],
        sensors: [],
        Run: function(callback) {
            var t = this;
            setInterval(function() {
                brickpi_capi.BrickPiUpdateValues();
                callback();

                for (var i=0; i<t.motors.length; i++) {
                    if (t.encoders[i] != brickpi_capi.GetEncoder(t.motors[i].port)) {
                        t.encoders[i] = brickpi_capi.GetEncoder(t.motors[i].port);
                        t.motors[i].Moved(t.encoders[i]);
                        event.emit('move', t.motors[i]);
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
            this.sensors.push(sensor);
            return this;
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
        callBack: null,
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