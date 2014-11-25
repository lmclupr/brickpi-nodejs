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

var robot = brickpi.createRobot();
var motorA = brickpi.createMotor({port: brickpi.MOTOR.A, name: 'Upper arm'});

var touchA = brickpi.createSensor({port: brickpi.SENSOR_PORT.ONE, type: brickpi.SENSOR_TYPE.TOUCH, name: 'Touch Sensor on upper arm'});

robot.setup().addMotor(motorA).addSensor(touchA).run(function() {});

motorA.start(-100).stopIn(720, function(err) {
  // callback called when motor has reached end point
});

brickpi.on.event('touch', function(sensor) {
  // touch sensor was touched.
});

brickpi.on.event('stop', function(motor) {
   console.log("Motor " + motor.getName() + " has stopped");
});
```

## API Documentation

### Robot Object

#### Creation

Use the createRobot() object contructor.

#### Setup

To initialize the robot object, use the setup() method.

#### Adding Sensors and Motors

Use the addMotor() and addSensor() methods to add motors and sensors.

#### Running the robot

Use the run() method the start your robot.  This launches a polling loop that calls BricpiUpdateValue at a 10msec interval.

The run method can take an optional Callback function that will get called at each 10msec cycle so you can run code at each interval.

#### Stopping the robot

The stop() method will do that.  This will stop the communication polling to the Brickpi, ending all processes and exiting the nodescript.


### Motor Object

#### Creation

createMotor() is used to create the motor object.  Specify port aand optionally name:

```javascript
var motorA = createMotor({port: brickpi.MOTOR.A, name: 'motor A'});
``` 

#### Methods

getName(), getPort(), isPaused(), getCurrentSpeed() return:

name, port, position (in ticks), paused (boolean), speed

start(speed) starts the motor at given speed.

stop() stops the motor.

stopIn(ticks, callback) will stop the motor in the given amount of ticks.  Ticks is an absolute value.  The callback will be called when the motor has reached the desired position and stopped.

pause()  pauses the motor.  Only makes sense when StopIn was called before.

resume() resumes the motor's travel to the end tick.


### Sensor Object

#### Creation

To create a sensor, use createSensor() providing a name, port and type.

```javascript
var sensorA = createSensor({port: brickpi.SENSOR_PORT.ONE, type: bricpi.SENSOR_TYPE.TOUCH, name: 'motor A'});
```

TOUCH, ULTRASONIC_CONT, ULTRASONIC_SS, COLOR_FULL

#### Methods

getName(), getValue() returns sensor name and sensor value respectively


### Dexter IMU (dIMU) Sensor Object

The dIMU sensor is a different beast then other Lego NXT sensors.  As such, a different constructor is used.

#### Creation & Usage

Use createDIMUSensor() providing name and port only.

```javascript
var dimuA = createDIMUSensor({port: brickpi.SENSOR_PORT.TWO, name: 'dimu x axis'});
```

Use addDIMUSensor() to add the sensor to the robot.

And finally, use getValue() to read the value.  

#### Note

For now, the Dexter dIMU sensor will only return the acceleration on the X axis only.


## Events

'change' event is fired when a sensor's value has changed.  

'touch' event is fired when a touch sensor was pressed or depressed.

'stop' when a motor has stopped.

'move' when a motor has moved.

'stuck' when a motor stopped moving because of some external obstruction.  i.e. the motor's speed is non-null, yet, it isn't turning/
 

## A Simple Project Example

```javascript

var brickpi = require('brickpi-raspberry');

var robot = brickpi.createRobot();
var motorA = brickpi.createMotor({port: brickpi.MOTOR.A, name: 'motorA'});
var motorB = brickpi.createMotor({port: brickpi.MOTOR.B, name: 'motorB'});
var motorC = brickpi.createMotor({port: brickpi.MOTOR.C, name: 'motorC'});
var motorD = brickpi.createMotor({port: brickpi.MOTOR.D, name: 'Turret motor'});


var touchA = brickpi.createSensor({port: brickpi.SENSOR_PORT.ONE, type: brickpi.SENSOR_TYPE.TOUCH, nam\
e: 'Touch Sensor on upper arm'});

robot.setup().addMotor(motorA).addMotor(motorB).addMotor(motorC).addSensor(touchA).addMotor(motorD).ru\
n(function() {});

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

brickpi.event.on('change', function(sensor) {
    console.log(sensor.getName() + ' changed to ' + sensor.GetValue());
});

brickpi.event.on('touch', function(sensor) {
    console.log('touched issued');
    if (sensor.getValue() === 1) {
        if (!motorB.isPaused()) {
            motorB.pause();
        } else {
            motorB.resume();
        }
    }
});

brickpi.event.on('move', function(motor) {
});

brickpi.event.on('stop', function(motor) {
});

```

## Limitations

This is my first go at this module.  I have only implemented the LEGO NXT Touch, Color and Ultrasonic sensors for now.
I just added the Dexter dIMU sensor, but only the X axis Accelerometer.

Stay posted, I'll be adding some more soon.