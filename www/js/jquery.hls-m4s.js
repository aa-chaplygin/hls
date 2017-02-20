;(function($, window, document, undefined){ 

	var pluginName = 'hlsM4S';
	
	var pluginClass = function($elements, options) {
		var self = this;
		
		/*
			Init
			--------------------------------------------------------------------------------------------------
		*/		
		var config = $.extend(true, {}, $.fn[pluginName].defaults, options);
		config.$context = $elements;
		
		// Elements
		var videoElement = config.$context;
		var videoElementDom = config.$context[0];
		var $window = $(window);
		
		// Global Parameters from .mpd file
		var type;  // Type of file
		var vrid;
		var arid;
		var mediaTemp;
		var mediaVideo;
		var mediaAudio;
		var codecsa;
		var codecsv;
		
		// Description of initialization segment, and approx segment lengths 
		var initializationTemp;
		var initializationVideo;
		var initializationAudio;
		
		var initializationVideoHash;
		var initializationAudioHash;
		
		// Parameters to drive segment loop
		var indexVideo = 0;
		var indexAudio = 0;

		// Source and buffers
		var mediaSource;
		var videoSource;
		var audioSource;

		// Parameters to drive fetch loop
		var segCheckVideo;
		var segCheckAudio;
		var lastTimeVideo = 0;
		var lastTimeAudio = 0;
		var bufferVideoUpdated = false;
		var bufferAudioUpdated = false;

		var segmentsData = {};
		var segmentsVideo = [];
		var segmentsAudio = [];
		var durationsVideo = [];
		var timelineVideo = [];
		var durationsAudio = [];
		var timelineAudio = [];
		
		var startNumberVideoSegment;
		var startNumberAudioSegment;
		
		var segmentNum = 0;
		var serverNum = 0;
		
		var seekTimeout;
		var isDualTracks;
		
		var videoIsStarted = false;
		var audioIsStarted = false;
		
		console.log('AAA M4S data = ', config.data)
		getFileData(config.data);
		
		function getFileData(data)
		{
			// Get DAT data from M4S
			type = data.t;
			initializationTemp = data.i;
			mediaTemp = data.m;
			
			// video data
			vrid = data.vrid;
			codecsv = data.cv;
			initializationVideo = initializationTemp.replace("$RepresentationID$", vrid);
			mediaVideo = mediaTemp.replace("$RepresentationID$", vrid);
			segmentsVideo = data.sv;
			initializationVideoHash = data.ihv;
			startNumberVideoSegment = data.snv;
						
			segmentsVideo.forEach(function(segmentItem) {
				durationsVideo.push(parseInt(segmentItem.d)/1000);
			});
			for (var i = 0; i < durationsVideo.length; i++) {
				timelineVideo[i] = (i==0) ? durationsVideo[i] : timelineVideo[i-1] + durationsVideo[i];
			}
			
			// audio data
			isDualTracks = !!data.arid;
			if (isDualTracks)
			{
				arid = data.arid;
				codecsa = data.ca;
				initializationAudio = initializationTemp.replace("$RepresentationID$", arid);
				mediaAudio = mediaTemp.replace("$RepresentationID$", arid);
				segmentsAudio = data.sa;
				initializationAudioHash = data.iha;
				startNumberAudioSegment = data.sna;
				
				segmentsAudio.forEach(function(segmentItem) {
					durationsAudio.push(parseInt(segmentItem.d)/1000);
				});
				for (var i = 0; i < durationsAudio.length; i++) {
					timelineAudio[i] = (i==0) ? durationsAudio[i] : timelineAudio[i-1] + durationsAudio[i];
				}
			}
			
			$window.on('Manager:connect', function(event, data) {
				console.log('AAA Manager:connect ', data.type);
				if (data && data.type == 'success') {
					setupVideo(); // Set up video object
				} else {
					console.log('AAA Нет подключения к DB');
				}
			});
			
			segmentsData.segments = [];
			segmentsData.fileVideo = mediaVideo;
			segmentsData.fileVideoInit = initializationVideo;
			segmentsData.segments.push({t: 'v', i: 'i', h: initializationVideoHash});
			segmentsVideo.forEach(function(segmentItem, ind) {
				segmentsData.segments.push({
					t: 'v',
					i: ind + startNumberVideoSegment,
					h: segmentItem.h
				});
			});
			
			if (isDualTracks)
			{
				segmentsData.fileAudio = mediaAudio;
				segmentsData.fileAudioInit = initializationAudio;
				segmentsData.segments.push({t: 'a', i: 'i', h: initializationAudioHash});
				segmentsAudio.forEach(function(segmentItem, ind) {
					segmentsData.segments.push({
						t: 'a',
						i: ind + startNumberAudioSegment,
						h: segmentItem.h
					});
				});
			}
			
			Manager.initData({
				type: 'm4s',
				segmentsData: segmentsData
			});
				
		
		}
		
		// Create mediaSource and initialize video 
		function setupVideo() {
			
			// Detect MediaSource support
			if ('MediaSource' in window) {
				// Create the media source
				mediaSource = new window.MediaSource();
			}
			else
			{
				console.log('AAA MediaSource is not supported!');
				return false;
			}

			var url = URL.createObjectURL(mediaSource);
			videoElement.attr('src', url);

			// Wait for event that tells us that our media source object is ready for a buffer to be added.
			mediaSource.addEventListener('sourceopen', function (e) {
				videoSource = mediaSource.addSourceBuffer('video/mp4; codecs="' +  codecsv + '"');
				if (isDualTracks)
				{
					audioSource = mediaSource.addSourceBuffer('audio/mp4; codecs="' +  codecsa + '"');
				}
				initVideo();
			},false);

			// Remove the handler for the timeupdate event
			videoElement.on("ended", function () {
				videoElement.off("timeupdate");
			}, false);

			// Seeking
			videoElement.on("seeking", function(data){

				if ( !seekTimeout ) {
					seekTimeout = setTimeout(function() {
						seekTimeout = null;

						console.log('AAA seek');

						// Расчет index по timeline:
						for (var i = 0; i < timelineVideo.length; i++) {
							if (videoElementDom.currentTime <= timelineVideo[i])
							{
								indexVideo = i;
								lastTimeVideo = (i==0) ? 0 : timelineVideo[i-1];
								break;
							}
						}

						if (isDualTracks)
						{
							for (var i = 0; i < timelineAudio.length; i++) {
								if (videoElementDom.currentTime <= timelineAudio[i])
								{
									indexAudio = i;
									lastTimeAudio = (i==0) ? 0 : timelineAudio[i-1];
									break;
								}
							}
						}

						console.log('AAA seeking ', videoElementDom.currentTime, ' ', indexVideo, ' ', indexAudio);
						playSegment(indexVideo, true);
						if (isDualTracks)
						{
							playSegment(indexAudio, false);
						}
						
						videoElement.off("timeupdate", fileChecks);
						//if (indexVideo < segmentsVideo.length || indexAudio < segmentsAudio.length) {
						if (indexVideo < segmentsVideo.length && (!isDualTracks || indexAudio < segmentsAudio.length)) {
							videoElement.on("timeupdate", fileChecks);
						}
						indexVideo++;
						if (isDualTracks)
						{
							indexAudio++;
						}
						fileChecks();

					}, 100);
				}

			});
		}
		
		//  Load video's initialization segment 
		function initVideo() {
			console.log('AAA initVideo');
			
			segCheckVideo = durationsVideo[0] * .50;
			console.log('AAA segCheckVideo: ', segCheckVideo);

			// Init video request
			Manager.getSegment(initializationVideoHash, function(data){
				videoSource.appendBuffer(data);
				videoSource.addEventListener("update", updateFunctVideo);
			});
			
			if (isDualTracks)
			{
				segCheckAudio = durationsAudio[0] * .50;
				console.log('AAA segCheckAudio: ', segCheckAudio);
				console.log('AAA initializationAudioHash: ', initializationAudioHash);
				
				// Init audio request
				Manager.getSegment(initializationAudioHash, function(data){
					audioSource.appendBuffer(data);
					audioSource.addEventListener("update", updateFunctAudio);
				});
			}
			
		}
		
		function updateFunctVideo() {
			console.log('AAA updateFunctVideo ');
			bufferVideoUpdated = true;
			getStartedVideo();
			videoSource.removeEventListener("update", updateFunctVideo);
		}

		function updateFunctAudio() {
			console.log('AAA updateFunctAudio ');
			bufferAudioUpdated = true;
			getStartedAudio();
			audioSource.removeEventListener("update", updateFunctAudio);
		}
		
		
		//  Play our file segments
		function getStartedVideo() {
			console.log('AAA getStartedVideo');
			videoIsStarted = true;
			if (audioIsStarted || !isDualTracks)
			{
				console.log('AAA getStarted url = ', indexVideo);
				
				playSegment(indexVideo, true);
				indexVideo++;
				
				if (isDualTracks)
				{
					playSegment(indexAudio, false);
					indexAudio++;
				}
				videoElement.on("timeupdate", fileChecks);
			}
		}

		//  Play our file segments
		function getStartedAudio(url) {
			//console.log('AAA getStartedAudio');
			audioIsStarted = true;
			if (videoIsStarted)
			{
				//console.log('AAA getStarted url = ', url);
				playSegment(indexVideo, true);
				indexVideo++;
				playSegment(indexAudio, false);
				indexAudio++;
				videoElement.on("timeupdate", fileChecks);
			}
		}
		
		function fileChecks() {
			
			//if (bufferVideoUpdated == true && bufferAudioUpdated == true) {
			if (bufferVideoUpdated == true && ( !isDualTracks || bufferAudioUpdated == true )) {

				if (indexVideo < segmentsVideo.length) {
					//console.log('AAA fileChecks V ', videoElementDom.currentTime - lastTimeVideo - segCheckVideo, ' ',  videoElementDom.currentTime, ' ', lastTimeVideo, ' ', segCheckVideo);
					if ((videoElementDom.currentTime - lastTimeVideo) >= segCheckVideo) {
						playSegment(indexVideo, true);
						lastTimeVideo = timelineVideo[indexVideo-1];
						indexVideo++;
					}
				}

				if (isDualTracks)
				{
					if (indexAudio < segmentsAudio.length) {
						//console.log('AAA fileChecks A ', videoElementDom.currentTime - lastTimeAudio - segCheckAudio, ' ',  videoElementDom.currentTime, ' ', lastTimeAudio, ' ', segCheckAudio);
						if ((videoElementDom.currentTime - lastTimeAudio) >= segCheckAudio) {
							playSegment(indexAudio, false);
							lastTimeAudio = timelineAudio[indexAudio-1];
							indexAudio++;
						}
					}
				}

				//if (indexVideo >= segmentsVideo.length && indexAudio >= segmentsAudio.length)
				if (indexVideo >= segmentsVideo.length && (!isDualTracks || indexAudio >= segmentsAudio.length))
				{
					console.log('AAA timeupdate off');
					videoElement.off("timeupdate", fileChecks);
				}


			}
		}
		
		function playSegment(ind, isVideo) {
			console.log('AAA playSegment = ', ind);
			
			var
				url,
				hashValue,
				targetSource = (isVideo) ? videoSource : audioSource;
			
			if (isVideo)
			{
				//url = mediaVideo.replace("$Number$", ind + startNumberVideoSegment);
				//console.log('AAA playSegment video index = ', ind, ' - ', url);
				hashValue = _.find(segmentsData.segments, function(item){ return (item.t == 'v' && item.i == ind + startNumberVideoSegment); }).h;
				console.log('AAA playSegment video hashValue = ', hashValue);
			}
			else
			{
				//url = mediaAudio.replace("$Number$", ind + startNumberAudioSegment);
				//console.log('AAA playSegment audio index = ', ind, ' - ', url);
				hashValue = _.find(segmentsData.segments, function(item){ return (item.t == 'a' && item.i == ind + startNumberAudioSegment); }).h;
				console.log('AAA playSegment audio hashValue = ', hashValue);
			}

			Manager.getSegment(hashValue, function(data){
				// Расчет для точной длины сегмента:
				if (isVideo)
				{
					segCheckVideo = durationsVideo[ind] * .50;
					console.log('AAA segCheckVideo: ', ind, '  ', segCheckVideo);
				}
				else
				{
					segCheckAudio = durationsAudio[ind] * .50;
					console.log('AAA segCheckAudio: ', ind, '  ', segCheckAudio);
				}
				// Add received content to the buffer
				try {
					//console.log('AAA xhr.DONE ', ind);
					targetSource.appendBuffer(data);
				} catch(e) {
					console.log('AAA appendBuffer error: ');
					var inter = setInterval(function(){
						console.log('AAA int');
						try {
							console.log('AAA clearInterval');
							targetSource.appendBuffer(data);
							clearInterval(inter);
						} catch(e) {
							console.log('AAA appendBuffer error ');
						}
					}, 10);
				}
			});
		}
		
		
		/*
			Attaching instance
		*/
		config.$context.data(pluginName, self);
	
	} // End of plugin class
		
	$.fn[pluginName] = function(options) {
		return this.each(function () {
			var $this = $(this);
			if (!$this.data(pluginName))
			{
				new pluginClass($this, options);
			}
		});	
	}
		
	$.fn[pluginName].defaults = {
		$context: null,
		data: null
	}
	
})(jQuery, window, document);
