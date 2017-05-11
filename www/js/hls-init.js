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
							//console.log('AAA Type = M4S ', $(videoElement));
							$(videoElement).hlsM4S({
								data: tempoutput
							});
						} else {
							//console.log('AAA Type = MPD ', $(videoElement));
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
			console.clear();
			console.log('AAA SEEK');
			//videoElement.currentTime = 100;
			videoElement.currentTime = 60;
			//videoElement.pause();
		});
		
		
		// WebSocket
		var ws;
		
		//ws = new WebSocket("ws://hls.dev:8000/demo/server.php");
		ws = new WebSocket("ws://hls.dev:889/demo/simpleworking.php");
		//ws = new WebSocket("ws://echo.websocket.org");
		
		// первый вызовется, когда соединение будет установлено:
		ws.onopen = function() { console.log("AAA WS Connection opened...") };
		// второй - когда соединено закроется
		ws.onclose = function() { console.log("AAA WS Connection closed..."); ws.close();};
		// и, наконец, третий - каждый раз, когда браузер получает какие-то данные через веб-сокет
		ws.onmessage = function(evt) { console.log("AAA WS Connection message: ", evt.data) };
		ws.onerror = function() { console.log("AAA WS Connection error...") };
		
		document.getElementById('ws-send-div').addEventListener('click', function (e) {
			console.clear();
			//prepare json data
			var msg = {
				data: 123,
			};
			console.log('AAA WS-SEND ', JSON.stringify(msg));
			ws.send(JSON.stringify(msg));
			
		});

	})();

}

