var brickpi = require('brickpi-raspberry');

var robot = new brickpi.BrickPi();
var motorA = new brickpi.Motor({port: brickpi.PORT.MA, name: 'motorA'});
var motorB = new brickpi.Motor({port: brickpi.PORT.MB, name: 'motorB'});
var motorC = new brickpi.Motor({port: brickpi.PORT.MC, name: 'motorC'});
var motorD = new brickpi.Motor({port: brickpi.PORT.MD, name: 'Turret motor'});
var touchA = new brickpi.Sensor({port: brickpi.PORT.ONE, type: brickpi.SENSOR_TYPE.NXT.TOUCH, name: 'Touch Sensor on upper arm'});

robot.addMotor(motorA).addMotor(motorB).addMotor(motorC).addSensor(touchA).addMotor(motorD).setup();

robot.on('ready', function() {
	motorA.resetPosition();
	motorB.resetPosition();
	robot.run();

	motorA.start(100).moveTo(5000, function(err) {
		// called when motorA has reached 5000 ticks (2500 degrees in rotation)
	});
});

setTimeout(function() {
	motorB.start(50);
}, 3000);

setTimeout(function() {
	motorB.stop();
}, 5000);

robot.on('tick', function() {
	// called at every polling cycle.
	var value = touchA.getValue();
});

setTimeout(function() {
	robot.stop();
}, 10000);
