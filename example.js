var brickpi = require('./Brickpi');

var robot = new brickpi.BrickPi();
var motorA = new brickpi.Motor({port: brickpi.PORTS.MA, name: 'motor A'});
var motorB = new brickpi.Motor({port: brickpi.PORTS.MB, name: 'motor B'});
var touchA = new brickpi.Sensor({port: brickpi.PORTS.S1, type: brickpi.SENSOR_TYPE.NXT.TOUCH, name: 'Touch A'});

robot.addMotor(motorA).addMotor(motorB).addSensor(touchA).setup();

robot.on('ready', function() {
	motorA.resetPosition();
	robot.run();

	motorA.start(100).moveTo(5000, function(err) {
		// called when motorA has reached 5000 ticks (2500 degrees in rotation)
	});
});

setTimeout(function() {
	motorB.start(150);
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
