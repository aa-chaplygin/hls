;(function($, window, document, undefined){ 

	var pluginName = 'hlsMPD';
	
	var pluginClass = function($elements, options) {
		var self = this;
		
		/*
			Init
			--------------------------------------------------------------------------------------------------
		*/		
		var config = $.extend(true, {}, $.fn[pluginName].defaults, options);
		config.$context = $elements;
		
		// Global Parameters from .mpd file
		var type;  // Type of file
		var file;  // MP4 file
		var fileAudio;  // MP4 file
		var codecs;
		var codecsAudio;
		
		// Elements
		var videoElement = config.$context;
		var videoElementDom = config.$context[0];
		
		
		// Source and buffers
		var mediaSource;
		var videoSource;
		var audioSource;
		
		// Description of initialization segment, and approx segment lengths 
		var initialization;
		var initializationHash;
		var initializationAudio;
		var initializationAudioHash;
		
		var segments = [];
		var segmentsCount;
		var segmentsAudioCount;

		var durations = [];
		var durationsAudio = [];
		var timeline = [];
		var timelineAudio = [];
		var hashes = [];
		var hashesAudio = [];
		
		// Parameters to drive segment loop
		var index = 0; // Segment to get
		var indexAudio = 0;

		// Parameters to drive fetch loop
		var segCheck;
		var segCheckAudio;
		var lastTime = 0;
		var lastTimeAudio = 0;
		var bufferUpdated = false;
		var bufferAudioUpdated = false;
		
		var seekTimeout;
		var isDualTracks;
		
		var videoIsStarted = false;
		var audioIsStarted = false;
		
		var $window = $(window);
		
		console.log('AAA MPD data = ', config.data)
		getFileData(config.data);
		
		function getFileData(data)
		{
			// Get DAT data from MP4box
			type = config.data.t;
			
			// video data
			file = '/video/' + config.data.u;
			codecs = config.data.c;
			initialization = config.data.i;
			initializationHash = config.data.ih;
			segmentsCount = config.data.s.length;

			segments.push([config.data.i, config.data.ih, 'v']);

			(config.data.s).forEach(function(segmentItem) {
				durations.push(parseInt(segmentItem.d)/1000);
				hashes.push(segmentItem.h);
				segments.push([segmentItem.r, segmentItem.h, 'v']);
			});

			for (var i = 0; i < durations.length; i++) {
				timeline[i] = (i==0) ? durations[i] : timeline[i-1] + durations[i];
			}
			
			// audio data
			isDualTracks = !!data.ia;
			if (isDualTracks)
			{
				console.log('AAA isDualTracks ');
				fileAudio = '/video/' + config.data.ua;
				codecsAudio = config.data.ca;
				initializationAudio = config.data.ia;
				initializationAudioHash = config.data.iha;
				segmentsAudioCount = config.data.sa.length;
				
				segments.push([config.data.ia, config.data.iha, 'a']);
				
				(config.data.sa).forEach(function(segmentItem) {
					durationsAudio.push(parseInt(segmentItem.d)/1000);
					hashesAudio.push(segmentItem.h);
					segments.push([segmentItem.r, segmentItem.h, 'a']);
				});
				
				for (var i = 0; i < durationsAudio.length; i++) {
					timelineAudio[i] = (i==0) ? durationsAudio[i] : timelineAudio[i-1] + durationsAudio[i];
				}
				
			}

			$window.on('Manager:connect', function(event, data) {
				console.log('AAA --------------->>>>>>> Manager:connect ', data.type);
				if (data && data.type == 'success') {
					setupVideo(); // Set up video object
				} else {
					console.log('AAA --------------->>>>>>> Нет подключения к DB');
				}
			});

			Manager.initData(
				{
				type: 'mpd',
				segmentsData: {
						file: file,
						fileAudio: fileAudio,
						segments: segments
					}
				}
			);
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
				videoSource = mediaSource.addSourceBuffer(type + '; codecs="' +  codecs + '"');
				if (isDualTracks)
				{
					audioSource = mediaSource.addSourceBuffer('audio/mp4; codecs="' +  codecsAudio + '"');
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

						// Расчет index по timeline (с разными длительностями сегментов):
						for (var i = 0; i < timeline.length; i++) {
							if (videoElementDom.currentTime <= timeline[i])
							{
								index = i;
								lastTime = (i==0) ? 0 : timeline[i-1];
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

						console.log('AAA seeking ', videoElementDom.currentTime, ' ', index, ' ', indexAudio);
						playSegment(index, true);
						if (isDualTracks)
						{
							playSegment(indexAudio, false);
						}

						videoElement.off("timeupdate", fileChecks);
						//if (index < segmentsCount) {
						if (index < segmentsCount && (!isDualTracks || indexAudio < segmentsAudioCount)) {
							videoElement.on("timeupdate", fileChecks);
						}
						index++;
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

			segCheck = durations[0] * .50;
			//console.log('AAA segCheck: ', segCheck);

			Manager.getSegment(initializationHash, function(data){
				// Add response to buffer
				videoSource.appendBuffer(data);
				// Wait for the update complete event before continuing
				videoSource.addEventListener("update",updateFunct);
			});
			
			if (isDualTracks)
			{
				segCheckAudio = durationsAudio[0] * .50;
				console.log('AAA segCheckAudio: ', segCheckAudio);
				
				// Init audio request
				Manager.getSegment(initializationAudioHash, function(data){
					audioSource.appendBuffer(data);
					audioSource.addEventListener("update", updateFunctAudio);
				});
			}
		}
		
		function updateFunct() {
			console.log('AAA updateFunct');
			bufferUpdated = true;
			getStarted();
			videoSource.removeEventListener("update", updateFunct);
		}
		
		function updateFunctAudio() {
			console.log('AAA updateFunctAudio');
			bufferAudioUpdated = true;
			getStartedAudio();
			audioSource.removeEventListener("update", updateFunctAudio);
		}
		
		//  Play our file segments
		function getStarted() {
			console.log('AAA getStarted');
			videoIsStarted = true;
			if (audioIsStarted || !isDualTracks)
			{
				// Start by loading the first segment of media
				playSegment(index, true);
				index++;
				
				if (isDualTracks)
				{
					playSegment(indexAudio, false);
					indexAudio++;
				}
				
				//  Continue in a loop where approximately every x seconds reload the buffer
				videoElement.on("timeupdate", fileChecks);
			}
		}
		
		//  Play our file segments
		function getStartedAudio() {
			console.log('AAA getStartedAudio');
			audioIsStarted = true;
			if (videoIsStarted)
			{
				playSegment(index, true);
				index++;
				playSegment(indexAudio, false);
				indexAudio++;
				videoElement.on("timeupdate", fileChecks);
			}
		}
		
		//  Play segment plays a byte range (format nnnn-nnnnn) of a media file    
		function playSegment(ind, isVideo) {
			console.log('AAA playSegment ',ind , '  ',isVideo );
			
			var 
				hashValue = (isVideo) ? hashes[ind] : hashesAudio[ind],
				targetSource = (isVideo) ? videoSource : audioSource;
			
			Manager.getSegment(hashValue, function(data){
				// Расчет для точной длины сегмента:
				if (isVideo)
				{
					segCheck = durations[ind] * .50;
					//console.log('AAA segCheck: ', ind, '  ', segCheck);
				}
				else
				{
					segCheckAudio = durationsAudio[ind] * .50;
					//console.log('AAA segCheckAudio: ', ind, '  ', segCheckAudio);
				}

				// Add received content to the buffer
				try {
					//console.log('AAA xhr.DONE ', data);
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
		
		//  Get video segments 
		function fileChecks() {
			// If we're ok on the buffer, then continue
			//if (bufferUpdated == true) {
			if (bufferUpdated == true && ( !isDualTracks || bufferAudioUpdated == true )) {
				
				if (index < segmentsCount) {
					// Loads next segment when time is close to the end of the last loaded segment 
					if ((videoElementDom.currentTime - lastTime) >= segCheck) {
						playSegment(index, true);
						// Расчет для точной длины сегмента:
						lastTime = timeline[index-1];
						index++;
					}
				}
				
				if (isDualTracks)
				{
					if (indexAudio < segmentsAudioCount) {
						if ((videoElementDom.currentTime - lastTimeAudio) >= segCheckAudio) {
							playSegment(indexAudio, false);
							lastTimeAudio = timelineAudio[indexAudio-1];
							indexAudio++;
						}
					}
				}
				
				if (index >= segmentsCount && (!isDualTracks || indexAudio >= segmentsAudioCount))
				{
					console.log('AAA timeupdate off');
					videoElement.off("timeupdate", fileChecks);
				}
				
			}
		}

		
		/*
			Public methods
		*/
		// Постановка на паузу
		self.Pause = function() {
			console.log('AAA self.Pause');
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
