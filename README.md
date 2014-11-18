brickpi-raspberry
==============

BrickPi Nodejs API module

#NOTE
This module is under active development.  The API changes often.


This is an Nodejs module that allows controlling the BrickPi board from a Nodejs script.  The module wraps the Dexter Industries' C drivers in addition to adding native Javascript functionality.

This module requires the WiringPi library to be installed on the Raspberry Pi.


## Install

You'll need a BrickPi compatible Raspian distribution (see Dexter INdustries webpage) and WiringPi library installed.

Then:

```bash
$ npm install brickpi-raspberry
```

## Examples



### Running Motors and Sensors

```javascript
var brickpi = require('brickpi-raspberry');

var robot = brickpi.CreateRobot();
var motorA = brickpi.CreateMotor({port: brickpi.MOTOR.A, name: 'Upper arm'});

var touchA = brickpi.CreateSensor({port: brickpi.SENSOR_PORT.ONE, type: brickpi.SENSOR_TYPE.TOUCH, name: 'Touch Sensor on upper arm'});

robot.Setup().AddMotor(motorA).AddSensor(touchA).Run(function() {});

motorA.Start(-100).StopIn(720, function(err) {
  // callback called when motor has reached end point
});

brickpi.on.event('touch', function(sensor) {
  // touch sensor was touched.
});

brickpi.on.event('stop', function(motor) {
   console.log("Motor " + motor.GetName() + " has stopped");
});
```

## API Documentation

### Robot Object

#### Creation

Use the CreateRobot() object contructor.

#### Setup

To initialize the robot object, use the Setup() method.

#### Adding Sensors and Motors

Use the AddMotor() and AddSensor() methods to add motors and sensors.

#### Running the robot

Use the Run() method the start your robot.  This launches a polling loop that calls BricpiUpdateValue at a 10msec interval.

The Run method can take an optional Callback function that will get called at each 10msec cycle so you can run code at each interval.

#### Stopping the robot

The Stop() method will do that.  This will stop the polling, ending all processes and exiting the nodescript.


### Motor Object

#### Creation

CreateMotor() is used to create the motor object.  Specify port aand optionally name:

```javascript
var motorA = CreateMotor({port: 0, name: 'motor A'});
``` 

#### Methods

GetName(), GetPort(), isPaused(), GetCurrentSpeed() return:

name, port, position (in ticks), paused (boolean), speed


Start(speed) starts the motor at given speed.

Stop() stops the motor.

StopIn(ticks, callback) will stop the motor in the given amount of ticks.  Ticks is an absolute value.  The callback will be called when the motor has reached the desired position and stopped.

Pause()  pauses the motor.  Only makes sense when StopIn was called before.

Resume() resumes the motor's travel to the end tick.


### Sensor Object

#### Creation

To create a sensor, use CreateSensor() providing a name, port and type.

#### Methods

GetState() returns an object that contains the state of the sensor, including name, port, type and current value.


## Events

'change' event is fired when a sensor's value has changed.  

'touch' event is fired when a touch sensor was pressed or depressed.

'stop' when a motor has stopped.

'move' when a motor has moved.

'stuck' when a motor stopped moving because of some external obstruction.  i.e. the motor's speed is non-null, yet, it isn't turning/
 

## Limitations

This is my first go at this module.  I have only implemented the LEGO NXT Touch, Color and Ultrasonic sensors for now.
Stay posted, I'll be adding some more soon.