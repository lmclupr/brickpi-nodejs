var brickpi = require('./brickpi');

var robot = brickpi.CreateRobot();
var motorA = brickpi.CreateMotor({port: 0, name: 'motorA'});
var motorB = brickpi.CreateMotor({port: 1, name: 'motorB'});
var motorC = brickpi.CreateMotor({port: 2, name: 'motorC'});

robot.Setup().AddMotor(motorA).AddMotor(motorB).AddMotor(motorC).Run(function() {});

motorA.Start(-200).StopIn(14000, function() {
    motorB.Start(+200).StopIn(14000, function() {
	motorC.Start(+200).StopIn(13000, function() {
	    console.log('Finished sequence');
	});
    });
});  // motorA - raises +lowers
//motorB.Start(-100).StopIn(14000); // - raises +lowers
//motorC.Start(-200).StopIn(14000); // -opens + closes


brickpi.event.on('move', function(motor) {
//    console.log(motor.name + " moved to " + motor.position);
});

brickpi.event.on('stop', function(motor) {
    console.log(motor.name + ' stopped at position ' + motor.position);
});
