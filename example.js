var brickpi = require('brickpi-raspberry');

var robot = brickpi.CreateRobot();
var motorA = brickpi.CreateMotor({port: brickpi.MOTOR.A, name: 'motorA'});
var motorB = brickpi.CreateMotor({port: brickpi.MOTOR.B, name: 'motorB'});
var motorC = brickpi.CreateMotor({port: brickpi.MOTOR.C, name: 'motorC'});
var motorD = brickpi.CreateMotor({port: brickpi.MOTOR.D, name: 'Turret motor'});


var touchA = brickpi.CreateSensor({port: brickpi.SENSOR_PORT.ONE, type: brickpi.SENSOR_TYPE.TOUCH, name: 'Touch Sensor on upper arm'});

//var distanceB = brickpi.CreateSensor({port: brickpi.SENSOR_PORT.ONE, type: brickpi.SENSOR_TYPE.ULTRASONIC_CONT, name: 'Distance to ground'});


robot.Setup().AddMotor(motorA).AddMotor(motorB).AddMotor(motorC).AddSensor(touchA).AddMotor(motorD).Run(function() {});

motorA.Start(-100).StopIn(14000, function() {
    motorB.Start(-100).StopIn(14000, function() {
	motorC.Start(200).StopIn(13000, function() {
	    motorD.Start(100).StopIn(140, function() {
		console.log('Finished sequence');
		robot.Stop(); // this kills communication to brickpi.
	    });
	});
    });
});

// motorA - raises +lowers
//motorB.Start(-100).StopIn(14000); // - raises +lowers
//motorC.Start(-200).StopIn(14000); // -opens + closes

brickpi.event.on('change', function(sensor) {
    console.log(sensor.name + ' changed to ' + sensor.value);
});

brickpi.event.on('touched', function(sensor) {
    console.log('touched issued');
    if (sensor.value === 1) {
	if (!motorB.paused) {
	    motorB.Pause();
	} else {
	    motorB.Resume();
	}
    }
});

brickpi.event.on('move', function(motor) {
//    console.log(motor.name + " moved to " + motor.position);
});

brickpi.event.on('stop', function(motor) {
    console.log(motor.name + ' stopped at position ' + motor.position);
});
