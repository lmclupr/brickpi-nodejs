var brickpi = require('./Brickpi');

var robot = new brickpi.BrickPi({pollingInterval: 1000});
var irLink = new brickpi.Sensor({port: brickpi.PORTS.S3, type: brickpi.SENSOR_TYPE.I2C, name: 'irlink'});

robot.addSensor(irLink).setup();

robot.on('ready', function() {
	robot.run();
});

robot.on('tick', function() {
    // called at every polling cycle.
    var value = irLink.getValue();
    console.log(value);
});

setTimeout(function() {
	robot.stop();
}, 10000);
