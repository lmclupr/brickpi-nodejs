var brickpi = require('../brickpi/brickpi-nodejs/Brickpi');
var async = require('async');
var cam = require('./cam');

var robot = new brickpi.BrickPi({pollingInterval: 20});
var arm = new brickpi.Motor({port: brickpi.PORTS.MA, name: 'arm', easein: true});
var fore = new brickpi.Motor({port: brickpi.PORTS.MC, name: 'fore', easein: true});
var claw = new brickpi.Motor({port: brickpi.PORTS.MB, name: 'claw'});
var turret = new brickpi.Motor({port: brickpi.PORTS.MD, name: 'turret', easein: true});

robot.addMotor(arm).addMotor(fore).addMotor(claw).addMotor(turret).setup();

var ARM_SPEED = 150;
var CLAW_SPEED = 100;
var TURRET_SPEED = -130;
var TURRET_SLOW = -100;

var count = 0;

robot.on('tick', function() {
});

robot.on('ready', function() {
    fore.resetPosition();
    arm.resetPosition();
    claw.resetPosition();
    turret.resetPosition();
    robot.run();

    fore.start(150).moveTo(-14500, function() {
	FindTarget();
    });
    
    function FindTarget() {
	cam.scan(function(targets, err) {
	    if (err) {
		FindTarget();
		return;
	    }

	    if (!targets) {
		FindTarget();
		return;
	    }

	    if (targets.length === 0) {
		console.log('target not found, rotating a little');
		turret.start(TURRET_SPEED).stopIn(5000, function(err) {
		    FindTarget();
		});
	    } else {
		console.log('Target found');

		var target = targets[0];

		var x = target[0];
		var y = target[1];

		if ((y < 100) || (y > 420)) {
		    console.log('Target is too close or too far to pick up, moving on');
		    turret.start(TURRET_SPEED).stopIn(4000, function(err) {
			FindTarget();
                    });
		    return;
		}

		if (x > 360) {
		    console.log('too much to the left');
		    turret.start(TURRET_SLOW).stopIn(500, function(err) {
			FindTarget();
		    });
		    return;
		}

		if (x < 280) {
		    console.log('too much to the right');
                    turret.start(-1*TURRET_SLOW).stopIn(500, function(err) {
                        FindTarget();
                    });
                    return;
		}

		console.log('just right');
		console.log('Calculating fore and arm position for pick up');

		var normalizedDistance = (y - 100)/(420-100);  // 0 is farthest, 1 is closest

		var armPosition = 15000 - (15000 - 11300)*normalizedDistance;
		var forePosition = (-16000)*(1-normalizedDistance);

		async.series([
		    function(callback) {
			claw.start(200).moveTo(-10000, callback);
		    },
		    function(callback) {
			fore.start(150).moveTo(forePosition, callback);
		    },
		    function(callback) {
			arm.start(150).moveTo(armPosition, callback);
		    }
		], function(err, result) {
		    RaiseAndDrop(BackToStart);
		});
	    }
	});
    }
});


function BackToStart() {
    async.series([
	function(callback) {
	    fore.start(150).moveTo(0, callback);
	}, 
	function(callback) {
	    claw.start(200).moveTo(0, callback);
	},
	function(callback) {
	    arm.start(150).moveTo(0, callback);
	},
	function(callback) {
	    turret.start(100).moveTo(0, callback);
	}
    ], function() {
	robot.stop();
    });
}

function RaiseAndDrop(callback) {
    async.series([
	function(callback) {
	    claw.start(100).moveTo(-5000, callback);
	},
	function(callback) {
	    arm.start(150).moveTo(5000, callback);
	},
	function(callback) {
	    fore.start(150).moveTo(-10000, callback);
	},
	function(callback) {
	    turret.start(150).moveTo(0, callback);
	},
	function(callback) {
	    claw.start(150).moveTo(-10000, callback);
	}
    ], function() {
	callback();
    });
}