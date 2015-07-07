var brickpi = require('./Brickpi');

var robot = new brickpi.BrickPi({pollingInterval: 20});
var motorA = new brickpi.Motor({port: brickpi.PORTS.MA, name: 'motor A'});

robot.addMotor(motorA).setup();

robot.on('ready', function() {
	motorA.resetPosition();
	robot.run();

	motorA.start(250).moveTo(3720, function() {
		console.log("720 reached");
	});
});

setTimeout(function() {
	motorA.start(250).moveTo(0, function() {
		console.log('0 reached');
	});
}, 10000);


robot.on('tick', function() {
	// called at every polling cycle.
	var value = motorA.getPosition();
	console.log(value);
});

setTimeout(function() {
	robot.stop();
}, 20000);
