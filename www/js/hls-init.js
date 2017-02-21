window.onload = function()
{
	(function() {
		'use strict'


		console.log('AAA hls-init');

		// Url for .dat file
		var datUrl = window.HLS_GLOBALS.file_dat;

		// Elements
		var videoElement = document.getElementById('myVideo');

		// Start loading dat:
		getDataJSON(datUrl);

		// Gets the dat file and parses it    
		function getDataJSON(url) {
			if (url !== "") {
				var xhr = new XMLHttpRequest(); // Set up xhr request
				xhr.open("GET", url, true); // Open the request          
				xhr.responseType = "json"; // Set the type of response expected
				xhr.send();
				//  Asynchronously wait for the data to return
				xhr.onreadystatechange = function () {
					if (xhr.readyState == xhr.DONE) {
						var tempoutput = xhr.response;

						if (typeof(tempoutput) == 'string') {
							tempoutput = JSON.parse(tempoutput);
						}

						if (tempoutput.vrid) {
							console.log('AAA Type = M4S ', $(videoElement));
							$(videoElement).hlsM4S({
								data: tempoutput
							});
						} else {
							console.log('AAA Type = MPD ', $(videoElement));
							$(videoElement).hlsMPD({
								data: tempoutput
							});
						}
					}
				}
			}
		}

		// Принудительный seek в проблемное место:
		document.getElementById('seek-div').addEventListener('click', function (e) {
			console.log('AAA SEEK');
			videoElement.currentTime = 50;
			//videoElement.pause();
		});	

	})();

}

