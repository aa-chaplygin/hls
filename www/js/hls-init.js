window.onload = function()
{
	(function() {

		// Url for .dat file
		var datUrl = window.HLS_GLOBALS.file_dat;

		// Elements
		var videoElement = document.getElementById('myVideo');

		// Gets json-data from the .dat file and run hls:    
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

		// Start loading dat:
		getDataJSON(datUrl);

		// Принудительный seek в проблемное место:
		document.getElementById('seek-div').addEventListener('click', function (e) {
			console.log('AAA SEEK');
			videoElement.currentTime = 23;
			//videoElement.pause();
		});	

	})();

}

