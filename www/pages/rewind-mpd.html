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
	
	// Url for .mpd file
	//var mpdUrl = '/video/stream.mpd';
	////var mpdUrl = '/video/test-720_dash.mpd';
	//var mpdUrl = '/video/toystory_dash.mpd';
	var mpdUrl = '/video/monaco_dash.mpd';
	//var mpdUrl = '/video/gonka_dash.mpd';
	//var mpdUrl = '/video/fox_dash.mpd';
	//var mpdUrl = '/video/ocean_dash.mpd';
	
	
	// Global Parameters from .mpd file
	var file;  // MP4 file
	var type;  // Type of file
	var codecs; //  Codecs allowed

	// Elements
	var videoElement = document.getElementById('myVideo');

	// Description of initialization segment, and approx segment lengths 
	var initialization;

	// Parameters to drive segment loop
	var index = 0; // Segment to get
	var segments;

	// Source and buffers
	var mediaSource;
	var videoSource;

	// Parameters to drive fetch loop
	var segCheck;
	var lastTime = 0;
	var bufferUpdated = false;
	var isUpdating = false;
	
	var segmentNum = 0;
	var serverNum = 0;
	
	var durations = [];
	var timeline = [];

	// Start loading mpd:
	getData(mpdUrl);
	
	// Gets the mpd file and parses it    
	function getData(url) {
		if (url !== "") {
			var xhr = new XMLHttpRequest(); // Set up xhr request
			xhr.open("GET", url, true); // Open the request          
			xhr.responseType = "text"; // Set the type of response expected
			xhr.send();

			//  Asynchronously wait for the data to return
			xhr.onreadystatechange = function () {
				if (xhr.readyState == xhr.DONE) {
					var tempoutput = xhr.response;
					var parser = new DOMParser(); //  Create a parser object 

					// Create an xml document from the .mpd file for searching
					//console.log('AAA tempoutput = ', tempoutput);
					var xmlData = parser.parseFromString(tempoutput, "text/xml", 0);

					// Get and display the parameters of the .mpd file
					getFileType(xmlData);

					// Set up video object, buffers, etc  
					setupVideo();
				}
			}

		}
	}

	// Retrieve parameters from our stored .mpd file
	function getFileType(data) {

		// Get MPD data from MP4box
		file = '/video/' + data.querySelectorAll("BaseURL")[0].textContent.toString();

		var rep = data.querySelectorAll("Representation");
		type = rep[0].getAttribute("mimeType");
		codecs = rep[0].getAttribute("codecs");

		var ini = data.querySelectorAll("Initialization");
		initialization = ini[0].getAttribute("range");
		segments = data.querySelectorAll("SegmentURL");

		var timelineList = data.querySelectorAll("SegmentTimeline S");
		
		// Заводим массив с длительностью сегментов:
		var
			i = 0,
			durValue,
			repeat;
		
		timelineList.forEach(function(itemTimeline) {
			durValue = parseInt(itemTimeline.getAttribute("d"))/1000;
			repeat = parseInt(itemTimeline.getAttribute("r"));
			durations[i] = durValue;
			i++;
			if (repeat)
			{
				for (var j = 0; j < repeat; j++) {
					durations[i] = durValue;
					i++;
				}
			}
		});
		
		for (var i = 0; i < durations.length; i++) {
			timeline[i] = (i==0) ? durations[i] : timeline[i-1] + durations[i];
		}
		
		var sumDur = 0;
		var srDur;
		for (var i = 0; i < durations.length; i++) {
			sumDur += durations[i];
		}
		srDur = sumDur/durations.length;
		
		console.log('AAA file: ', file);
		console.log('AAA количество segments: ', segments.length);
		console.log('AAA durations: ', durations);
		//console.log('AAA srDur: ', srDur);
		//console.log('AAA timeline: ', timeline.length);
		console.log('AAA timeline: ', timeline);
		console.log('----------------------------');
		
		
		
	}

    // Create mediaSource and initialize video 
    function setupVideo() {

		//  Create the media source
		mediaSource = new window.MediaSource();

		var url = URL.createObjectURL(mediaSource);
		videoElement.src = url;

		// Wait for event that tells us that our media source object is ready for a buffer to be added.
		mediaSource.addEventListener('sourceopen', function (e) {
			videoSource = mediaSource.addSourceBuffer(type + '; codecs="' +  codecs + '"');
			initVideo(initialization, file);           
		},false);

		// Remove the handler for the timeupdate event
		videoElement.addEventListener("ended", function () {
			videoElement.removeEventListener("timeupdate");
		}, false);


		// Seeking
		videoElement.addEventListener("seeking", function(data){
			
			// Расчет index по timeline (с разными длительностями сегментов):
			for (var i = 0; i < timeline.length; i++) {
				if (videoElement.currentTime <= timeline[i])
				{
					index = i;
					lastTime = (i==0) ? 0 : timeline[i-1];
					break;
				}
			}

			console.log('AAA seeking ', videoElement.currentTime, ' ', videoElement.duration, ' ', index);
			playSegment(segments[index].getAttribute("mediaRange").toString(), file, index);

			videoElement.removeEventListener("timeupdate", fileChecks);
			if (index < segments.length) {
				videoElement.addEventListener("timeupdate", fileChecks);
			}
			index++;
			fileChecks();
			
		});
		
		// Принудительный seek в проблемное место:
		document.getElementById('seek-div').addEventListener('click', function (e) {
			console.log('AAA SEEK');
			
			videoElement.currentTime = 2736.6200000000013;
			
			//videoElement.pause();
			//45.33372
			//51.000436
			//101.129069
			//119.872819
			//1813.540000
			
			//monaco
			//1656.213757
			//3276.16006 546 1199104129-1202671738
			//1450.698181 241 520308427-521978876
			//3750
			//3457.497333
			
			//fox6
			//6330.607929
			//2742.635903
			//5814.913924
		});	
		
    }

	//  Load video's initialization segment 
	function initVideo(range, url) {
		console.log('AAA initVideo');
		var xhr = new XMLHttpRequest();

		// Set the desired range of bytes we want from the mp4 video file
		xhr.open('GET', url);
		xhr.setRequestHeader("Range", "bytes=" + range);
		segCheck = durations[0] * .50;
		console.log('AAA segCheck = ', segCheck);
		xhr.send();
		xhr.responseType = 'arraybuffer';

		xhr.addEventListener("readystatechange", function () {
			if (xhr.readyState == xhr.DONE) { // wait for video to load
				// Add response to buffer
				videoSource.appendBuffer(new Uint8Array(xhr.response));
				// Wait for the update complete event before continuing
				videoSource.addEventListener("update",updateFunct);
			}
		}, false);
	}
    
	function updateFunct() {
		//console.log('AAA updateFunct');
		// This is a one shot function, when init segment finishes loading, update the buffer flag, call getStarted, and then remove this event.
		bufferUpdated = true;
		getStarted(file); // Get video playback started
		// Now that video has started, remove the event listener
		videoSource.removeEventListener("update", updateFunct);
	}

	//  Play our file segments
	function getStarted(url) {
		console.log('AAA getStarted');
		// Start by loading the first segment of media
		playSegment(segments[index].getAttribute("mediaRange").toString(), url, index);
		index++;
		
		//  Continue in a loop where approximately every x seconds reload the buffer
		videoElement.addEventListener("timeupdate", fileChecks);
	}
	
	//  Get video segments 
	function fileChecks() {
		// If we're ok on the buffer, then continue
		if (bufferUpdated == true) {
			if (index < segments.length) {
				//console.log('AAA fileChecks ', videoElement.currentTime - lastTime - segCheck, ' ',  videoElement.currentTime, ' ', lastTime, ' ', segCheck);
				// Loads next segment when time is close to the end of the last loaded segment 
				if ((videoElement.currentTime - lastTime) >= segCheck) {
					playSegment(segments[index].getAttribute("mediaRange").toString(), file, index);
					// Расчет для точной длины сегмента:
					lastTime = timeline[index-1];
					index++;
				}
			} else {
				console.log('AAA timeupdate off');
				videoElement.removeEventListener("timeupdate", fileChecks);
			}
		}
	}

	//  Play segment plays a byte range (format nnnn-nnnnn) of a media file    
	function playSegment(range, url, ind) {
		if (range || url) { // Make sure we've got incoming params
			
			console.log('AAA playSegment index = ', ind, ' - ', durations[ind]);
			
			// Запрос на разные домены:
			/*
			serverNum = segmentNum % 4 + 1;
			url = 'http://n' + serverNum + '.hls.dev/'+ url;
			console.log('AAA playSegment ', ind, ' ', url);
			segmentNum++;
			*/
			
			var xhr = new XMLHttpRequest();
			xhr.open('GET', url);
			xhr.setRequestHeader("Range", "bytes=" + range);
			xhr.responseType = 'arraybuffer';
			xhr.send();
			
			xhr.addEventListener("readystatechange", function () {
				if (xhr.readyState == xhr.DONE) { //wait for video to load
					//  Calculate when to get next segment based on time of current one
					// Расчет для точной длины сегмента:
					segCheck = durations[ind] * .50;
					console.log('AAA segCheck: ', segCheck);
					
					// Add received content to the buffer
					try {
						//console.log('AAA xhr.DONE ', ind);
						videoSource.appendBuffer(new Uint8Array(xhr.response));
					} catch(e) {
						console.log('AAA appendBuffer error: ');
						var inter = setInterval(function(){
							console.log('AAA int');
							try {
								console.log('AAA clearInterval');
								videoSource.appendBuffer(new Uint8Array(xhr.response));
								clearInterval(inter);
							} catch(e) {
								console.log('AAA appendBuffer error ');
							}
						}, 10);
					}
				}
			}, false);
		}
	}
    
  </script>
</body>
</html>