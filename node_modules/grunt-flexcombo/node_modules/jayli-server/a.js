var ewait = require('ewait');

var all = new ewait.WaitForAll({
	timeout: 2000,
	// Wait for 2000ms max.
	event: 'flushed' // Wait for a custom event.
});

all.add([toilet1, toilet2, toilet3]);

all.once('done', function() {
	console.log('All done!');
});

all.once('timeout', function() {
	console.log('Timeout!');
});

all.wait();

