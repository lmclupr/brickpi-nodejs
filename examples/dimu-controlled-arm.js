var brickpi = require('./brickpi/brickpi');

var robot = new brickpi.Robot();
var arm = new brickpi.Motor({port: brickpi.MOTOR.A, name: 'arm'});
var fore = new brickpi.Motor({port: brickpi.MOTOR.C, name: 'fore'});
var claw = new brickpi.Motor({port: brickpi.MOTOR.B, name: 'claw'});
var dimu_arm = new brickpi.Sensor({type: brickpi.SENSOR_TYPE.DIMU, port: brickpi.SENSOR_PORT.FOUR, name: 'dimu_arm'});

var running = false;

robot.setup().addMotor(arm).addMotor(fore).addMotor(claw).addSensor(dimu_arm).run();

var ARM_SPEED = 255;
var CLAW_SPEED = 255;


dimu_arm.on('change', function() {
    if (running) {
	var acc = dimu_arm.getValue();
	if (acc.x < -1.05) {
	    arm.start(250);
	} else if (acc.x > -1.0) {
	    arm.start(-250)
	} else {
	    arm.stop();
	}
    }
});


setTimeout(function() {
    running = true;
    fore.start(250).stopIn(14000, function() {
	fore.start(-250).stopIn(14000, function() {
	    robot.stop();
	});
    });
}, 5000);

