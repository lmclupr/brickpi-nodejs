var cv = require('opencv');
var cam = require('camelittle');
var c = new cam({
    controls: {
	'Brightness': 125,
	'Contrast': 125,
	'Saturation': 125,
    }
});

function scan(callback) {
    if (callback === null) {
	console.log('callback required');
	return;
    }
    
    c.grab({
	device: '/dev/video0',
	resolution: '640x480',
    }, function(err, image) {
	if (err) {
	    callback(null, err);
	    return;
	}
	
	if (image == null) {
	    callback(null, err);
	    return;
	}

	cv.readImage(new Buffer(image, 'binary'), function(err, im) {
	    if (err) {
		callback(null, err);
		return;
	    }
	    if (!((im.size()[0]>0) && (im.size()[1]>0))) {
		callback(null, err);
		return;
	    }
	    
	    im.convertGrayscale();
	    var circles = im.houghCircles(1, 1000, 100, 100, 10, 1000);
	    
	    console.log(circles);
	    if (circles == null) circles = [];
	    callback(circles, null);
	});
    });
}

exports.scan = scan;
