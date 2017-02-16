<!DOCTYPE html>
<html>
<!-- Media streaming example
  Reads an .mpd file created using mp4box and plays the file
-->     
<head>
  <meta charset="utf-8" />
  <title>Media streaming example</title>
</head>

<body>
	
	<h2>rewind</h2>
	<div id="grid">
		<video id="myVideo" width="640" height="360" controls>No video available</video>
	</div>
	<div id="seek-div" style="cursor: pointer; margin-top: 4px">[seek->]</div>

	<!-- script section -->
	<script>
	'use strict'
	
	// Url for .dat file
	var datUrl = '/video/manifest-toystory.dat';
	
	// Global Parameters from .mpd file
	var file;  // MP4 file
	var type;  // Type of file
	var codecs; //  Codecs allowed
	var vrid;
	var arid;
	var mediaTemp;
	var media;
	var mediaVideo;
	var mediaAudio;
	var codecsa;
	var codecsv;

	// Elements
	var videoElement = document.getElementById('myVideo');

	// Description of initialization segment, and approx segment lengths 
	var initialization;
	var initializationTemp;
	var initializationVideo;
	var initializationAudio;

	// Parameters to drive segment loop
	var index = 0; // Segment to get
	var indexVideo = 0;
	var indexAudio = 0;

	// Source and buffers
	var mediaSource;
	var videoSource;
	var audioSource;

	// Parameters to drive fetch loop
	var segCheck;
	var segCheckVideo;
	var segCheckAudio;
	var lastTime = 0;
	var lastTimeVideo = 0;
	var lastTimeAudio = 0;
	var bufferUpdated = false;
	var bufferVideoUpdated = false;
	var bufferAudioUpdated = false;
	var isUpdating = false;
	
	var segmentNum = 0;
	var serverNum = 0;
	
	var segments = [];
	var segmentsVideo = [];
	var segmentsAudio = [];
	var durations = [];
	var timeline = [];
	var durationsVideo = [];
	var timelineVideo = [];
	var durationsAudio = [];
	var timelineAudio = [];
	
	var xhrVideoSeg;
	var xhrAudioSeg;
	
	var seekTimeout;
	
	// Start loading dat:
	getDataJSON(datUrl);
	
	// Gets the dat file and parses it    
	function getDataJSON(url) {
		if (url !== "") {
			
			fetch(url)  
			.then(  
				function(response) {
					if (response.status !== 200) {  
						console.log('Looks like there was a problem. Status Code: ' +  response.status);  
						return;  
					}

					// Examine the text in the response  
					response.json().then(function(data) {  
						var tempoutput = data;
						// Get and display the parameters of the .dat file
						getFileData(tempoutput);
						// Set up video object, buffers, etc  
						setupVideo();
					});  
				}
			)  
			.catch(function(err) {  
				console.log('Fetch Error :-S', err);  
			});	
			
		}
	}
	
	// Retrieve parameters from our stored .dat file
	function getFileData(data) {
		
		if (typeof(data) == 'string')
		{
			data = JSON.parse(data);
		}
		console.log('AAA data = ', data);

		// Get DAT data from MP4box
		vrid = data.vrid;
		arid = data.arid;
		type = data.t;
		codecs = data.cv + ',' + data.ca;
		codecsa = data.ca;
		codecsv = data.cv;
		initializationTemp = data.i;
		mediaTemp = data.m;
		segmentsVideo = data.sv;
		segmentsAudio = data.sa;
		
		initializationVideo = initializationTemp.replace("$RepresentationID$", vrid);
		mediaVideo = mediaTemp.replace("$RepresentationID$", vrid);
		
		initializationAudio = initializationTemp.replace("$RepresentationID$", arid);
		mediaAudio = mediaTemp.replace("$RepresentationID$", arid);
		
		segmentsVideo.forEach(function(segmentItem) {
			durationsVideo.push(parseInt(segmentItem)/1000);
		});
		for (var i = 0; i < durationsVideo.length; i++) {
			timelineVideo[i] = (i==0) ? durationsVideo[i] : timelineVideo[i-1] + durationsVideo[i];
		}
		
		segmentsAudio.forEach(function(segmentItem) {
			durationsAudio.push(parseInt(segmentItem)/1000);
		});
		for (var i = 0; i < durationsAudio.length; i++) {
			timelineAudio[i] = (i==0) ? durationsAudio[i] : timelineAudio[i-1] + durationsAudio[i];
		}
		
		/*
		console.log('AAA кол-во segmentsVideo: ', segmentsVideo.length);
		console.log('AAA кол-во segmentsAudio: ', segmentsAudio.length);
		console.log('AAA initializationTemp: ', initializationTemp);
		console.log('AAA mediaTemp: ', mediaTemp);
		console.log('AAA codecs: ', codecs);
		console.log('AAA durationsVideo: ', durationsVideo);
		console.log('AAA timelineVideo: ', timelineVideo);
		console.log('AAA timelineAudio: ', timelineAudio);
		console.log('AAA кол-во timelineVideo: ', timelineVideo.length);
		console.log('AAA кол-во timelineAudio: ', timelineAudio.length);
		console.log('----------------------------');
		*/
		
	}

    // Create mediaSource and initialize video 
    function setupVideo() {

		//  Create the media source
		mediaSource = new window.MediaSource();

		var url = URL.createObjectURL(mediaSource);
		videoElement.src = url;


		// Wait for event that tells us that our media source object is ready for a buffer to be added.
		mediaSource.addEventListener('sourceopen', function (e) {
			videoSource = mediaSource.addSourceBuffer('video/mp4; codecs="' +  codecsv + '"');
			audioSource = mediaSource.addSourceBuffer('audio/mp4; codecs="' +  codecsa + '"');
			initVideo(initializationTemp);
		},false);

		// Remove the handler for the timeupdate event
		videoElement.addEventListener("ended", function () {
			videoElement.removeEventListener("timeupdate");
		}, false);

		// Seeking
		videoElement.addEventListener("seeking", function(data){
			
			if ( !seekTimeout ) {
				seekTimeout = setTimeout(function() {
					seekTimeout = null;
					
					// Расчет index по timeline:
					for (var i = 0; i < timelineVideo.length; i++) {
						if (videoElement.currentTime <= timelineVideo[i])
						{
							indexVideo = i;
							lastTimeVideo = (i==0) ? 0 : timelineVideo[i-1];
							break;
						}
					}

					for (var i = 0; i < timelineAudio.length; i++) {
						if (videoElement.currentTime <= timelineAudio[i])
						{
							indexAudio = i;
							lastTimeAudio = (i==0) ? 0 : timelineAudio[i-1];
							break;
						}
					}

					console.log('AAA seeking ', videoElement.currentTime, ' ', indexVideo, ' ', indexAudio);
					playSegment(mediaVideo, indexVideo, true);
					playSegment(mediaAudio, indexAudio, false);

					videoElement.removeEventListener("timeupdate", fileChecks);
					if (indexVideo < segmentsVideo.length || indexAudio < segmentsAudio.length) {
						videoElement.addEventListener("timeupdate", fileChecks);
					}
					indexVideo++;
					indexAudio++;
					fileChecks();
					
					
				}, 100);
			}
			
		});
		
		// Start playing
		videoElement.addEventListener("playing", function(data){
			console.log('-------------------');
		});
		
		// Принудительный seek в проблемное место:
		document.getElementById('seek-div').addEventListener('click', function (e) {
			console.log('AAA SEEK');
			videoElement.currentTime = 91;
		});	
    }

	//  Load video's initialization segment 
	function initVideo(url) {
		//console.log('AAA initVideo');
		
		// Init video request
		fetch(initializationVideo)  
		.then(  
			function(response) {
				if (response.status !== 200) {  
					console.log('Looks like there was a problem. Status Code: ' +  response.status);  
					return;  
				}
				response.arrayBuffer().then(function(data) {  
					videoSource.appendBuffer(new Uint8Array(data));
					videoSource.addEventListener("update",updateFunctVideo);
				});  
			}
		)
		.catch(function(err) {  
			console.log('Fetch Error :-S', err);  
		});	
		
		// Init audio request
		fetch(initializationAudio)  
		.then(  
			function(response) {
				if (response.status !== 200) {  
					console.log('Looks like there was a problem. Status Code: ' +  response.status);  
					return;  
				}
				response.arrayBuffer().then(function(data) {  
					audioSource.appendBuffer(new Uint8Array(data));
					audioSource.addEventListener("update",updateFunctAudio);
				});  
			}
		)
		.catch(function(err) {  
			console.log('Fetch Error :-S', err);  
		});	
	   
		//console.log('AAA segCheckVideo = ', segCheckVideo, ' segCheckAudio = ', segCheckAudio);
	}
    
	function updateFunctVideo() {
		//console.log('AAA updateFunctVideo ');
		bufferVideoUpdated = true;
		getStartedVideo(mediaTemp);
		videoSource.removeEventListener("update", updateFunctVideo);
	}
	
	function updateFunctAudio() {
		//console.log('AAA updateFunctAudio ');
		bufferAudioUpdated = true;
		getStartedAudio(mediaTemp);
		audioSource.removeEventListener("update", updateFunctAudio);
	}
	
	var videoIsStarted = false;
	var audioIsStarted = false;

	//  Play our file segments
	function getStartedVideo(url) {
		//console.log('AAA getStartedVideo');
		videoIsStarted = true;
		if (audioIsStarted)
		{
			console.log('AAA getStarted url = ', url);
			playSegment(mediaVideo, indexVideo, true);
			playSegment(mediaAudio, indexAudio, false);
			indexVideo++;
			indexAudio++;
			videoElement.addEventListener("timeupdate", fileChecks);
		}
	}
	
	//  Play our file segments
	function getStartedAudio(url) {
		//console.log('AAA getStartedAudio');
		audioIsStarted = true;
		if (videoIsStarted)
		{
			//console.log('AAA getStarted url = ', url);
			playSegment(mediaVideo, indexVideo, true);
			playSegment(mediaAudio, indexAudio, false);
			indexVideo++;
			indexAudio++;
			videoElement.addEventListener("timeupdate", fileChecks);
		}
	}
	
	//  Get video segments 
	function fileChecks() {
		if (bufferVideoUpdated == true && bufferAudioUpdated == true) {
			
			if (indexVideo < segmentsVideo.length) {
				//console.log('AAA fileChecks V ', videoElement.currentTime - lastTimeVideo - segCheckVideo, ' ',  videoElement.currentTime, ' ', lastTimeVideo, ' ', segCheckVideo);
				if ((videoElement.currentTime - lastTimeVideo) >= segCheckVideo) {
					playSegment(mediaVideo, indexVideo, true);
					lastTimeVideo = timelineVideo[indexVideo-1];
					indexVideo++;
				}
			}
			
			if (indexAudio < segmentsAudio.length) {
				//console.log('AAA fileChecks A ', videoElement.currentTime - lastTimeAudio - segCheckAudio, ' ',  videoElement.currentTime, ' ', lastTimeAudio, ' ', segCheckAudio);
				if ((videoElement.currentTime - lastTimeAudio) >= segCheckAudio) {
					playSegment(mediaAudio, indexAudio, false);
					lastTimeAudio = timelineAudio[indexAudio-1];
					indexAudio++;
				}
			}
			
			if (indexVideo >= segmentsVideo.length && indexAudio >= segmentsAudio.length)
			{
				console.log('AAA timeupdate off');
				videoElement.removeEventListener("timeupdate", fileChecks);
			}
			
			
		}
	}


	function playSegment(url, ind, isVideo) {
		if (url) { // Make sure we've got incoming params
			
			url = url.replace("$Number$", ind+1);
			if (isVideo)
			{
				console.log('AAA playSegment video index = ', ind, ' - ', durationsVideo[ind]);
			}
			else
			{
				//console.log('AAA playSegment audio index = ', ind, ' - ', durationsAudio[ind]);
			}
			
			var targetSource = (isVideo) ? videoSource : audioSource;
			
			fetch(url)  
			.then(  
				function(response) {
					if (response.status !== 200) {  
						console.log('Looks like there was a problem. Status Code: ' +  response.status);  
						return;  
					}
					response.arrayBuffer().then(function(data) {
						// Расчет для точной длины сегмента:
						if (isVideo)
						{
							segCheckVideo = durationsVideo[ind] * .50;
							//console.log('AAA segCheckVideo: ', ind, '  ', segCheckVideo);
						}
						else
						{
							segCheckAudio = durationsAudio[ind] * .50;
							//console.log('AAA segCheckAudio: ', ind, '  ', segCheckAudio);
						}

						// Add received content to the buffer
						if (isVideo)
						{
							//console.log('AAA appendBuffer Video: ', ind);
						}
						try {
							targetSource.appendBuffer(new Uint8Array(data));
						} catch(e) {
							console.log('AAA appendBuffer error: ');
							var inter = setInterval(function(){
								console.log('AAA int');
								try {
									console.log('AAA clearInterval');
									targetSource.appendBuffer(new Uint8Array(data));
									clearInterval(inter);
								} catch(e) {
									console.log('AAA appendBuffer error ');
								}
							}, 10);
						}
						
					});  
				}
			)
			.catch(function(err) {  
				console.log('Fetch Error :-S', err);  
			});	
			
			
			
		}
	}
    
  </script>
</body>
</html>