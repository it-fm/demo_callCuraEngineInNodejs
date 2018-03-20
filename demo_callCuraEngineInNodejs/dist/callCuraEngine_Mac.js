"use strict";

var child_process = require('child_process');
var spawn = child_process.spawn;

var sliceProgress, filamentLength, filamentWeight, printTime;

var curaEnginePath = "../CuraEngine/Mac/CuraEngine";
var configPath = "../CuraEngine/Config/normal_quality.def.json";
var gcodePath = getGcodePath();
var stlPath = "../test.stl";

//exec "$curaEnginePath" slice -v -p -j "$configPath" -o "$gcodePath" -l "$stlPath"

var wmic = spawn(curaEnginePath, ['slice', '-v', '-p', '-j', configPath, '-o', gcodePath, '-l', stlPath]);

wmic.stdout.on('data', function (data) {});

wmic.stderr.on('data', function (data) {

	var array = data.toString().split('\n');

	array.map(function (item) {

		if (item.length < 10) {
			return;
		}

		if (item.indexOf('Progress:inset+skin:') === 0 || item.indexOf('Progress:export:') === 0) {

			var start = item.indexOf('0.');
			var end = item.indexOf('%');
			sliceProgress = Number(item.slice(start, end));
			console.log('slice progress = ' + sliceProgress);
		} else if (item.indexOf(';Filament used:') === 0) {

			filamentLength = Number(item.replace(';Filament used:', '').replace('m', ''));
			filamentWeight = Math.PI * (1.75 / 2) * (1.75 / 2) * filamentLength * 1.24;
			sliceProgress = 1;
		} else if (item.indexOf('Print time:') === 0) {

			//add empirical parameter : 1.07
			printTime = Number(item.replace('Print time:', '')) * 1.07;
			sliceProgress = 1;
		}
	});
});

wmic.on('close', function (code) {

	console.log('**************************************');

	//0:ok  1:error
	console.log('child process exited with code ' + code);

	console.log('slice progress = ' + sliceProgress);
	console.log('filamentLength = ' + filamentLength);
	console.log('filamentWeight = ' + filamentWeight);
	console.log('printTime = ' + printTime);

	console.log('**************************************');
});

function getGcodePath() {

	var date = new Date();
	var gcodeFileName = date.getHours() + "-" + date.getMinutes() + "-" + date.getSeconds();
	return "../" + gcodeFileName + ".gcode";
}
//# sourceMappingURL=callCuraEngine_Mac.js.map
