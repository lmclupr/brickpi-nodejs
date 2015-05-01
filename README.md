brickpi-raspberry
==============

BrickPi Nodejs API module

#Introduction

This is an Nodejs module that allows controlling the BrickPi board from a Nodejs script. Coupling Dexter Industries amazing BrickiPi board 
with the power of Nodejs makes for a powerful way to build and program LEGO robots.

#NOTE

This module is under active development.  The API changes often.

## Changes

I re-coded the entire module so as to use pure Javascript to communicate with the BrickPi board, therefore no longer relying on 
Dexter Industries C librairies. 

Added PID controllers to the motors for smooth operation.

## Install

You'll need a BrickPi compatible Raspian distribution.

Then:

```bash
$ npm install brickpi-raspberry
```

## Examples



### Running Motors and Sensors

```javascript
var brickpi = require('brickpi-raspberry');

var robot = new brickpi.BrickPi();
var motorA = new brickpi.Motor({port: brickpi.PORT.MA, name: 'motorA'});
var motorB = new brickpi.Motor({port: brickpi.PORT.MB, name: 'motorB'});
var touchA = new brickpi.Sensor({port: brickpi.PORT.ONE, type: brickpi.SENSOR_TYPE.NXT.TOUCH, name: 'Touch Sensor on upper arm'});

robot.addMotor(motorA).addMotor(motorB).addSensor(touchA).setup();

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

```

## API Documentation

### Robot Object

#### Creation

Use the BrickPi() object contructor.  An options object can be passed to the constructor.

#### Adding Sensors and Motors

Use the addMotor() and addSensor() methods to add motors and sensors.

#### Setup

To initialize the BirckPi object, use the setup() method.  This method will sestablish the serial port connection to the BrickPi board, set timeouts and configure the sensors.

#### Running the robot

Use the run() method the start your robot.  This launches a polling loop that updates motors speeds and encoders and fetches fresh sensor values.

#### Stopping the robot

The stop() method will do that.  This will stop the communication polling to the Brickpi, ending all processes and exiting the nodescript.


### Motor Object

#### Creation

Motor() is used to create the motor object.  Specify port aand optionally name:

```javascript
var motorA = new brickpi.Motor({port: brickpi.MOTOR.A, name: 'motor A'});
``` 

#### Methods

start(speed) starts the motor at given speed.

stop() stops the motor.

stopIn(ticks, callback) will stop the motor in the given amount of ticks.  Ticks is an absolute value.  The callback will be called when the motor has reached the desired position and stopped.

moveTo(ticks, callback) will get the motor position to the desired tick value (2 ticks equal 1 degree).  Once the desired position is reached, the callback is invoked.

### Sensor Object

#### Creation

To create a sensor, use Sensor() providing a name, port and type.

```javascript
var sensorA = new brickpi.Sensor({port: brickpi.SENSOR_PORT.ONE, type: bricpi.SENSOR_TYPE.TOUCH, name: 'motor A'});
```

TOUCH, ULTRASONIC_CONT, ULTRASONIC_SS, COLOR_FULL, DIMU

#### Methods

getName(), getValue() returns sensor name and sensor value respectively.  In the case of the DIMU sensor, a structure is returned:
{x: x, y: y, z: z}


#### Note
For now, the Dexter dIMU sensor will only return the acceleration only in an object ex: {x: 1.2, y:0.1 z:0.2}


## Events

'change' event is fired when a sensor's value has changed.  

'stop' when a motor has stopped.

'move' when a motor has moved.

'stopped' when a motor stopped moving because of some external obstruction.  i.e. the motor's speed is non-null, yet, it isn't turning/
 

## A Simple Project Example

```javascript

var brickpi = require('brickpi-raspberry');

var robot = new brickpi.Robot();
var motorA = new brickpi.Motor({port: brickpi.MOTOR.A, name: 'motorA'});
var motorB = new brickpi.Motor({port: brickpi.MOTOR.B, name: 'motorB'});
var motorC = new brickpi.Motor({port: brickpi.MOTOR.C, name: 'motorC'});
var motorD = new brickpi.Motor({port: brickpi.MOTOR.D, name: 'Turret motor'});


var touchA = new brickpi.Sensor({port: brickpi.SENSOR_PORT.ONE, type: brickpi.SENSOR_TYPE.TOUCH, nam\
e: 'Touch Sensor on upper arm'});

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

motorA.on('move', function() {
});

motorB.on('stop', function() {
});

```

## Limitations
This module is improving quickly.  Stay posted.


This is my first go at this module.  I have only implemented the LEGO NXT Touch, Color and Ultrasonic sensors for now.
I just added the Dexter dIMU sensor, but only the acceleration bit.

Stay posted, I'll be adding some more soon.
