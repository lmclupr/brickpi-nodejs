var brickpi = require('brickpi-raspberry');
var async = require('async');

var robot = brickpi.createRobot();
var arm = brickpi.createMotor({port: brickpi.MOTOR.A, name: 'arm'});
var fore = brickpi.createMotor({port: brickpi.MOTOR.C, name: 'fore'});
var claw = brickpi.createMotor({port: brickpi.MOTOR.B, name: 'claw'});

robot.setup().addMotor(arm).addMotor(fore).addMotor(claw).run();

var ARM_SPEED = 150;
var CLAW_SPEED = 100;

// below is the core of the robot
lowerAndGrab(function() {
    raise(function() {
	robot.stop();
    });
});
//////////////////////////


function lowerAndGrab(callback) {
    async.parallel([
	function(callbackArm) {
	    arm.start(ARM_SPEED).stopIn(12000, callbackArm);
	}, 
	function(callbackFore) {
	    fore.start(ARM_SPEED).stopIn(12000, callbackFore);
	}, 
	function(callbackClaw) {
	    claw.start(CLAW_SPEED).stopIn(12000, callbackClaw);
	}
    ], function() {
	// call back is called when all 3 above functions have completed
	console.log('lowered');
	callback();
    });
}


function raise(callback) {
    async.parallel([
        function(callbackArm) {
            arm.start(-1*ARM_SPEED).stopIn(12000, callbackArm);
        },
        function(callbackFore) {
            fore.start(-1*ARM_SPEED).stopIn(12000, callbackFore);
        },
        function(callbackClaw) {
            claw.start(-1*CLAW_SPEED).stopIn(12000, callbackClaw);
        }
    ], function() {
	console.log('raised');
        callback();
    });
}