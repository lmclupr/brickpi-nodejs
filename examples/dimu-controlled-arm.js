var brickpi = require('./brickpi/brickpi');

var robot = brickpi.createRobot();
var arm = brickpi.createMotor({port: brickpi.MOTOR.A, name: 'arm'});
var fore = brickpi.createMotor({port: brickpi.MOTOR.C, name: 'fore'});
var claw = brickpi.createMotor({port: brickpi.MOTOR.B, name: 'claw'});

var dimu_arm = brickpi.createDIMUSensor({port: brickpi.SENSOR_PORT.FOUR, name: 'dimu_arm'});

var running = false;

robot.setup().addMotor(arm).addMotor(fore).addMotor(claw).addDIMUSensor(dimu_arm).run(function() {
    
    if (running) {
	var x = dimu_arm.getValue();
	if (x < -1.05) {
	    arm.start(250);
	} else if (x > -1.0) {
	    arm.start(-250)
	} else {
	    arm.stop();
	}
    }

});

var ARM_SPEED = 255;
var CLAW_SPEED = 255;

setTimeout(function() {
    running = true;
    fore.start(250).stopIn(14000, function() {
	fore.start(-250).stopIn(14000, function() {
//	    robot.stop();
	});
    });
}, 5000);

