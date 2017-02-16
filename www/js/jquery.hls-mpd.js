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
		var file;  // MP4 file
		var type;  // Type of file
		var codecs; //  Codecs allowed
		
		// Elements
		var videoElement = config.$context;
		var videoElementDom = config.$context[0];
		
		
		// Source and buffers
		var mediaSource;
		var videoSource;
		
		// Description of initialization segment, and approx segment lengths 
		var initialization;
		var initializationHash;
		
		var segments = [];
		var segmentsCount;

		var durations = [];
		var timeline = [];
		var hashes = [];
		
		// Parameters to drive segment loop
		var index = 0; // Segment to get

		// Parameters to drive fetch loop
		var segCheck;
		var lastTime = 0;
		var bufferUpdated = false;
		
		var seekTimeout;
		
		var $window = $(window);
		
		console.log('AAA MPD data = ', config.data)
		getFileData(config.data);
		
		function getFileData(data)
		{
			// Get DAT data from MP4box
			file = '/video/' + config.data.u;
			type = config.data.t;
			codecs = config.data.c;
			initialization = config.data.i;
			initializationHash = config.data.ih;
			segmentsCount = config.data.s.length;

			segments.push([config.data.i, config.data.ih]);

			(config.data.s).forEach(function(segmentItem) {
				durations.push(parseInt(segmentItem.d)/1000);
				hashes.push(segmentItem.h);
				segments.push([segmentItem.r, segmentItem.h]);
			});

			for (var i = 0; i < durations.length; i++) {
				timeline[i] = (i==0) ? durations[i] : timeline[i-1] + durations[i];
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

						console.log('AAA seeking ', videoElementDom.currentTime, ' ', videoElementDom.duration, ' ', index);
						playSegment(index);

						videoElement.off("timeupdate", fileChecks);
						if (index < segmentsCount) {
							videoElement.on("timeupdate", fileChecks);
						}
						index++;
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
		}
		
		function updateFunct() {
			console.log('AAA updateFunct');
			// This is a one shot function, when init segment finishes loading, update the buffer flag, call getStarted, and then remove this event.
			bufferUpdated = true;
			getStarted(); // Get video playback started
			// Now that video has started, remove the event listener
			videoSource.removeEventListener("update", updateFunct);
		}
		
		//  Play our file segments
		function getStarted() {
			console.log('AAA getStarted');
			// Start by loading the first segment of media
			playSegment(index);
			index++;
			//  Continue in a loop where approximately every x seconds reload the buffer
			videoElement.on("timeupdate", fileChecks);
		}
		
		//  Play segment plays a byte range (format nnnn-nnnnn) of a media file    
		function playSegment(ind) {
			Manager.getSegment(hashes[ind], function(data){
				segCheck = durations[ind] * .50;
				//console.log('AAA segCheck: ', segCheck);

				// Add received content to the buffer
				try {
					//console.log('AAA xhr.DONE ', ind);
					videoSource.appendBuffer(data);
				} catch(e) {
					console.log('AAA appendBuffer error: ');
					var inter = setInterval(function(){
						console.log('AAA int');
						try {
							console.log('AAA clearInterval');
							videoSource.appendBuffer(data);
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
			if (bufferUpdated == true) {
				if (index < segmentsCount) {
					// Loads next segment when time is close to the end of the last loaded segment 
					if ((videoElementDom.currentTime - lastTime) >= segCheck) {
						playSegment(index);
						// Расчет для точной длины сегмента:
						lastTime = timeline[index-1];
						index++;
					}
				} else {
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
