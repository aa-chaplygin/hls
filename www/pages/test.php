<!DOCTYPE html>
<html>
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
    var file;
    var type = "video/mp4";
    var codecs = "avc1.42E01E, mp4a.40.2";
	
	// Video parameters
    var bandwidth; // bitrate of video
	var size; // size of video
	
	// Description of initialization segment, and approx segment lengths 
    var initialization;

    // Elements
    var videoElement = document.getElementById('myVideo');

    // Source and buffers
    var mediaSource;
    var videoSource;

    // Parameters to drive segment loop
    var index = 0; // Segment index

    // Parameters to drive fetch loop
    var segCheck;
    var lastTime = 0;
    var bufferUpdated = false;

	//var bufferSize = 2000000;
	  var bufferSize = 1000000;
	var segmentsCount;
    
	getData('video/sample_dash-frag.xml');
	
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
			console.log("AAA parsing XML file:");
            var xmlData = parser.parseFromString(tempoutput, "text/xml", 0);

            // Get and display the parameters of the .mpd file
            getFileType(xmlData);
          }
        }
      }
    }

    // Retrieve parameters from our stored .mpd file
    function getFileType(data) {
        file = data.querySelectorAll("BaseURL")[0].textContent.toString();
		initialization = '0-' + bufferSize;
		
		// Получаем размер файла:
		var xhr = new XMLHttpRequest();
        xhr.open('HEAD', file);
        xhr.send();
		xhr.addEventListener("readystatechange", function () {
			if (xhr.readyState == xhr.DONE) {
				size = xhr.getResponseHeader('Content-Length');
				segmentsCount = Math.floor(size/bufferSize);
				// Set up video object, buffers, etc  
				setupVideo();
			}
		}, false);
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
    }

    //  Load video's initialization segment 
    function initVideo(range, url) {
		console.log('AAA initVideo ', range);
		var xhr = new XMLHttpRequest();
        // Set the desired range of bytes we want from the mp4 video file
        xhr.open('GET', url);
        xhr.setRequestHeader("Range", "bytes=" + range);
        xhr.send();
        xhr.responseType = 'arraybuffer';

		xhr.addEventListener("readystatechange", function () {
		   if (xhr.readyState == xhr.DONE) { // wait for video to load
			  // Add response to buffer
			  videoSource.appendBuffer(new Uint8Array(xhr.response));
			  // Wait for the update complete event before continuing
			  videoSource.addEventListener("update",updateFunct, false);
			}
		}, false);

    }
    
	function updateFunct() {
		// This is a one shot function, when init segment finishes loading, 
		// update the buffer flag, call getStarted, and then remove this event.
		bufferUpdated = true;

		if (videoElement.duration)
		{
			getStarted(file);
		}
		else
		{
			videoElement.addEventListener("loadedmetadata", function(){
				getStarted(file);
			});
		}

		//  Now that video has started, remove the event listener
		videoSource.removeEventListener("update", updateFunct);
	}

	//  Play our file segments
	function getStarted(url) {
		console.log('AAA getStarted ', url);
		console.log('AAA videoElement.duration = ', videoElement.duration);
		bandwidth = size/videoElement.duration;
		segCheck = (((bufferSize * 1) / bandwidth) * .5).toFixed(3);

		//  Start by loading the first segment of media
		playSegmentIndex(index, url);
		// Display current index
		index++;
		//  Continue in a loop where approximately every x seconds reload the buffer
		videoElement.addEventListener("timeupdate", fileChecks, false);
	}
	
	//  Get video segments 
	function fileChecks() {
		console.log('AAA fileChecks ', index);
		// If we're ok on the buffer, then continue
		if (bufferUpdated == true)
		{
			if (index < segmentsCount)
			{
				// Loads next segment when time is close to the end of the last loaded segment 
				if ((videoElement.currentTime - lastTime) >= segCheck)
				{
					console.log('AAA currentTime = ', videoElement.currentTime, '  ', lastTime);
					playSegmentIndex(index, file);
					lastTime = videoElement.currentTime;
					index++;
				}
			}
			else
			{
				console.log('AAA fileChecks stopped!');
				videoElement.removeEventListener("timeupdate", fileChecks, false);
			}
		}
	}
	
	//  Play segment plays a byte range (format nnnn-nnnnn) of a media file
	function playSegmentIndex(index, url) {
		
		var range = (index+1 == segmentsCount) ? bufferSize*(index+1)+1 + '-' + size : bufferSize*(index+1)+1 + '-' + bufferSize*(index+2)
		console.log('AAA playSegmentIndex ', range);
	  
		var xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.setRequestHeader("Range", "bytes=" + range);
        xhr.send();
        xhr.responseType = 'arraybuffer';
		xhr.addEventListener("readystatechange", function () {
			if (xhr.readyState == xhr.DONE) { //wait for video to load
				//  Calculate when to get next segment based on time of current one
				console.log('AAA segCheck = ', segCheck);
				// Add received content to the buffer
				videoSource.appendBuffer(new Uint8Array(xhr.response));
				console.log('AAA videoSource = ', videoSource);
			}
		}, false);
    }
	
  </script>
</body>
</html>