var brickpi = require('./Brickpi');

var robot = new brickpi.BrickPi({pollingInterval : 250});

var ultrasonic = new brickpi.Sensor({port: brickpi.PORTS.S1, type: brickpi.SENSOR_TYPE.NXT.ULTRASONIC.CONT, name: "Ultrasonic 2"});
var touch = new brickpi.Sensor({port: brickpi.PORTS.S2, type: brickpi.SENSOR_TYPE.NXT.TOUCH, name: 'Touch A'});
var color = new brickpi.Sensor({port: brickpi.PORTS.S3, type: brickpi.SENSOR_TYPE.NXT.COLOR.FULL, name: 'Color C'});

robot.addSensor(ultrasonic).addSensor(touch).addSensor(color).setup();

robot.on('ready', function() {
	robot.run();
});

touch.on('changed',function(name,value) {
	console.log("Touch Sensor [" + name + "] changed to " + value);
});

ultrasonic.on('changed',function(name,value) {
	console.log("Ultrasonic Sensor [" + name + "] changed to " + value);
});

setTimeout(function() {
	robot.stop();
}, 30000);
