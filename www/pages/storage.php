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
	
	<div id="grid">
		<video id="myVideo" width="640" height="360" controls>No video available</video>
	</div>

	<!-- script section -->
	<script>
	'use strict'
	// Global Parameters from .mpd file
	var file;  // MP4 file
	var type;  // Type of file
	var codecs; //  Codecs allowed

	// Video parameters
	var bandwidth; // bitrate of video

	// Elements
	var videoElement = document.getElementById('myVideo');

	// Description of initialization segment, and approx segment lengths 
	var initialization;
	var segDuration;

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

	getData('/video/toystory_dash.mpd');
	
	
	
	/*
	var indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
	var IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
	window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
	console.log('AAA indexedDB = ', window.indexedDB);
	*/

	var request = indexedDB.open('exampleDBHLS', 1);
	var db;
	
	request.onupgradeneeded = function(event){
		db = request.result;
		console.log('AAA DB Базы ранее не существовало ', db);
		
		var store = db.createObjectStore("segments", {
			keyPath: "id"
		});
		
		store.createIndex("by_id", "id");
		
		/*
		store.add ({title:'Графика на Javascript', author:'Чекко', id:343});
		store.add ({title:'Javascript: сильные стороны', author:'Крокфорд', id:124});
		*/
	}
	
	request.onsuccess = function(event){
		db = request.result;
		console.log('AAA DB Подключились к существубщей БД ', db);
		
		/*
		var tx = db.transaction("segments", "readwrite");
		var store = tx.objectStore("segments");

		//var request2 = store.add({title:'Javascript: карманный справочник', author:'Флэнаган', id:68});
		var request2 = store.put({title:'Javascript: карманный справочник', author:'Флэнаган', id:68});

		request2.onsuccess= function(){
			console.log('AAA Данные сохранились');
		}
		request2.onerror= function(){
			console.log('AAA Во время сохранения данных произошла ошибка');
		}
		*/

	}
	
	request.onerror = function(event){
		console.log('AAA DB Подключиться к БД не удалось, обрабатываем ошибку');
	}
	

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
					//console.log("AAA parsing XML file:");
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
		file = '/video/' + data.querySelectorAll("BaseURL")[0].textContent.toString();
		var rep = data.querySelectorAll("Representation");
		type = rep[0].getAttribute("mimeType");
		codecs = rep[0].getAttribute("codecs");
		bandwidth = rep[0].getAttribute("bandwidth");

		var ini = data.querySelectorAll("Initialization");
		initialization = ini[0].getAttribute("range");
		segments = data.querySelectorAll("SegmentURL");

		var segList = data.querySelectorAll("SegmentList");
		segDuration = segList[0].getAttribute("duration");
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
			
			index = Math.floor(videoElement.currentTime/ (segDuration/1000));
			console.log('AAA seeking ', videoElement.currentTime, ' ', videoElement.duration, ' ', segDuration, ' ', index);
			
			playSegment(segments[index].getAttribute("mediaRange").toString(), file, index);
			lastTime = index*segDuration/1000;
			videoElement.removeEventListener("timeupdate", fileChecks);
			if (index < segments.length) {
				videoElement.addEventListener("timeupdate", fileChecks);
			}
			index++;
		});
	  
    }
	
	//  Load video's initialization segment 
	function initVideo(range, url) {
		console.log('AAA initVideo');
		var xhr = new XMLHttpRequest();

		// Set the desired range of bytes we want from the mp4 video file
		xhr.open('GET', url);
		xhr.setRequestHeader("Range", "bytes=" + range);
		segCheck = (timeToDownload(range) * .65).toFixed(3);
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
		//  This is a one shot function, when init segment finishes loading, update the buffer flag, call getStarted, and then remove this event.
		bufferUpdated = true;
		getStarted(file); // Get video playback started
		//  Now that video has started, remove the event listener
		videoSource.removeEventListener("update", updateFunct);
	}

	//  Play our file segments
	function getStarted(url) {
		console.log('AAA getStarted');
		//  Start by loading the first segment of media
		playSegment(segments[index].getAttribute("mediaRange").toString(), url);
		index++;
		
		//  Continue in a loop where approximately every x seconds reload the buffer
		videoElement.addEventListener("timeupdate", fileChecks);
	}
	
	//  Get video segments 
	function fileChecks() {
		//console.log('AAA fileChecks ', videoElement.currentTime);
		
		// If we're ok on the buffer, then continue
		if (bufferUpdated == true) {
			if (index < segments.length) {
				//console.log('AAA fileChecks ', videoElement.currentTime - lastTime - segCheck, ' ', lastTime);
				// Loads next segment when time is close to the end of the last loaded segment 
				if ((videoElement.currentTime - lastTime) >= segCheck) {
					playSegment(segments[index].getAttribute("mediaRange").toString(), file, index);
					lastTime = videoElement.currentTime;
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
		console.log('AAA playSegment index = ', ind);
		
		var segmentData;
		
		//if (ind==2)
		if (ind)
		{
			console.log('AAA Извлекаем данные из базы:');
			var tx = db.transaction("segments", "readwrite");
			var store = tx.objectStore("segments");
			var index = store.index("by_id");
			//var request2 = index.get(2);
			var request2 = index.get(ind);
			
			request2.onsuccess = function() {
				var matching = request2.result;
				if (matching !== undefined) {
					segmentData = matching.data;
					console.log('AAA segmentData = ', segmentData);
					
					// Add received content to the buffer
					try {
						videoSource.appendBuffer(new Uint8Array(segmentData));
					} catch(e) {
						console.log('AAA appendBuffer error ', e);
						var inter = setInterval(function(){
							console.log('AAA int');
							try {
								videoSource.appendBuffer(new Uint8Array(segmentData));
								console.log('AAA clearInterval');
								clearInterval(inter);
							} catch(e) {
								console.log('AAA appendBuffer error ');
							}
						}, 1);
					}
					
				} else {
					var xhr = new XMLHttpRequest();
					if (range || url) { // Make sure we've got incoming params
						xhr.open('GET', url);
						xhr.setRequestHeader("Range", "bytes=" + range);
						xhr.send();
						xhr.responseType = 'arraybuffer';

						xhr.addEventListener("readystatechange", function () {
							if (xhr.readyState == xhr.DONE) { //wait for video to load
								//  Calculate when to get next segment based on time of current one
								segCheck = (timeToDownload(range) * .65).toFixed(3);

								if (ind==2)
								{
									console.log('AAA Сохраняем данные в базе:');
									var tx = db.transaction("segments", "readwrite");
									var store = tx.objectStore("segments");
									var requestAddSegment = store.put({id:ind, data: xhr.response});
									requestAddSegment.onsuccess= function(){
										console.log('AAA Данные сегмента сохранились');
									}
									requestAddSegment.onerror= function(){
										console.log('AAA Во время сохранения данных произошла ошибка');
									}
								}

								// Add received content to the buffer
								try {
									videoSource.appendBuffer(new Uint8Array(xhr.response));
								} catch(e) {
									console.log('AAA appendBuffer error ', e);
									var inter = setInterval(function(){
										console.log('AAA int');
										try {
											videoSource.appendBuffer(new Uint8Array(xhr.response));
											console.log('AAA clearInterval');
											clearInterval(inter);
										} catch(e) {
											console.log('AAA appendBuffer error ');
										}
									}, 1);
								}
							}
						}, false);
					}
				}
			};	
		}
		else
		{
			var xhr = new XMLHttpRequest();
			if (range || url) { // Make sure we've got incoming params
				xhr.open('GET', url);
				xhr.setRequestHeader("Range", "bytes=" + range);
				xhr.send();
				xhr.responseType = 'arraybuffer';

				xhr.addEventListener("readystatechange", function () {
					if (xhr.readyState == xhr.DONE) { //wait for video to load
						//  Calculate when to get next segment based on time of current one
						segCheck = (timeToDownload(range) * .65).toFixed(3);

						if (ind==2)
						{
							console.log('AAA Сохраняем данные в базе:');
							var tx = db.transaction("segments", "readwrite");
							var store = tx.objectStore("segments");
							var requestAddSegment = store.put({id:ind, data: xhr.response});
							requestAddSegment.onsuccess= function(){
								console.log('AAA Данные сегмента сохранились');
							}
							requestAddSegment.onerror= function(){
								console.log('AAA Во время сохранения данных произошла ошибка');
							}
						}

						// Add received content to the buffer
						try {
							videoSource.appendBuffer(new Uint8Array(xhr.response));
						} catch(e) {
							console.log('AAA appendBuffer error ', e);
							var inter = setInterval(function(){
								console.log('AAA int');
								try {
									videoSource.appendBuffer(new Uint8Array(xhr.response));
									console.log('AAA clearInterval');
									clearInterval(inter);
								} catch(e) {
									console.log('AAA appendBuffer error ');
								}
							}, 1);
						}
					}
				}, false);
			}
		}
		
		
	}
    
	function timeToDownload(range) {
		var vidDur = range.split("-");
		// Time = size * 8 / bitrate
		return (((vidDur[1] - vidDur[0]) * 8) / bandwidth);
	}

  </script>
</body>
</html>