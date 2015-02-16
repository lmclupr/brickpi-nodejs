var brickpi = require('brickpi-raspberry');

var robot = brickpi.createRobot();
var motorA = brickpi.createMotor({port: brickpi.MOTOR.A, name: 'motorA'});
var motorB = brickpi.createMotor({port: brickpi.MOTOR.B, name: 'motorB'});
var motorC = brickpi.createMotor({port: brickpi.MOTOR.C, name: 'motorC'});
var motorD = brickpi.createMotor({port: brickpi.MOTOR.D, name: 'Turret motor'});


var touchA = brickpi.createSensor({port: brickpi.SENSOR_PORT.ONE, type: brickpi.SENSOR_TYPE.TOUCH, name: 'Touch Sensor on upper arm'});

robot.setup().addMotor(motorA).addMotor(motorB).addMotor(motorC).addSensor(touchA).addMotor(motorD).run(function() {});

motorA.start(-100).stopIn(14000, function() {
    motorB.start(-100).stopIn(14000, function() {
	motorC.start(200).stopIn(13000, function() {
	    motorD.start(100).stopIn(140, function() {
		console.log('Finished sequence');
		robot.stop(); // this kills communication to brickpi.
	    });
	});
    });
});

brickpi.event.on('change', function(sensor) {
    console.log(sensor.getName() + ' changed to ' + sensor.GetValue());
});

brickpi.event.on('touch', function(sensor) {
    console.log('touched issued');
    if (sensor.getValue() === 1) {
	if (!motorB.isPaused()) {
	    motorB.pause();
	} else {
	    motorB.resume();
	}
    }
});

brickpi.event.on('move', function(motor) {
});

brickpi.event.on('stop', function(motor) {
});
