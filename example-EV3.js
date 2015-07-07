var brickpi = require('./Brickpi');

var robot = new brickpi.BrickPi({pollingInterval: 1000});
var ev3Color = new brickpi.Sensor({port: brickpi.PORTS.S1, type: brickpi.SENSOR_TYPE.EV3.COLOUR.M1});
var touch = new brickpi.Sensor({port: brickpi.PORTS.S3, type: brickpi.SENSOR_TYPE.NXT.TOUCH});

robot.addSensor(ev3Color).addSensor(touch).setup();

robot.on('ready', function() {
	robot.run();
});

robot.on('tick', function() {
    // called at every polling cycle.
    var value = ev3Color.getValue();
    console.log(value);

    value = touch.getValue();
    console.log(value);

});

setTimeout(function() {
	robot.stop();
}, 100000);
