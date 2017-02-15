<!DOCTYPE html>
<html>
<!-- Media streaming example
  Reads an .mpd file created using mp4box and plays the file
-->     
<head>
  <meta charset="utf-8" />
  <title>Media streaming example</title>
  <script src="/js/mp4box.all.js"></script>
</head>

<body>
	
	<h2>MP4Box.js</h2>
	<div id="grid">
		<video id="myVideo" width="640" height="360" controls>No video available</video>
	</div>
	<div id="seek-div" style="cursor: pointer; margin-top: 4px">[seek->]</div>

	<!-- script section -->
	<script>
	
	var mpdUrl = '/video/monaco_dash.mpd';
	
	var mp4box = new MP4Box();
	mp4box.onReady = function (info) {
		console.log("Received File Information");
		console.log("AAA mp4box info: ", info);
	}
	mp4box.onMoovStart = function () {
		console.log("Starting to receive File Information");
	}
	
	/*
	var xhr3 = new XMLHttpRequest();
	// Set the desired range of bytes we want from the mp4 video file
	xhr3.open('GET', '/video/monaco.mp4');
	xhr3.send();
	xhr3.responseType = 'arraybuffer';

	xhr3.addEventListener("readystatechange", function () {
		if (xhr3.readyState == xhr3.DONE) { // wait for video to load
			mp4box.appendBuffer(new Uint8Array(xhr.response));
		}
	}, false);
	*/
	
  </script>
</body>
</html>