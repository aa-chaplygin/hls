(function($){
	$(function(){
		
		/*
		// --- Test codecs ---
		window.MediaSource = window.MediaSource || window.WebKitMediaSource;
        function testTypes(types) {
            for (var i = 0; i < types.length; ++i)
                console.log("MediaSource.isTypeSupported(" + types[i] + ") : " + MediaSource.isTypeSupported(types[i]));
        }
        function onLoad() {
            console.log("Testing valid type strings.");
            var validTypes = [
                
                //[mime type; codecs]                            // [format],[video codec],[audio codec]
                'video/ogg',                                     // ogg, theora, Vorbis
                'video/ogg; codecs="theora, vorbis"',            // ogg, theora, Vorbis
                'video/webm',                                    // WebM, VP8, Vorbis
                'video/webm; codecs="vp8"',                      // WebM, VP8, Vorbis
                'video/webm; codecs="vorbis"',                   // WebM, VP8, Vorbis
                'video/webm; codecs="vp8, vorbis"',              // WebM, VP8, Vorbis
                //'video/webm',                                  // WebM, VP9, Vorbis
                'video/webm; codecs="vp9, vorbis"',              // WebM, VP9, Vorbis
                'audio/webm; codecs="vorbis"',                   // WebM,  - , Vorbis
                'video/mp4',                                     // MPEG4, AVC, aac
                'video/mp4; codecs="avc1.66.13,  mp4a.40.2"',    // MPEG4, AVC(H.264) Baseline 1.3, AAC-LC, [MPEG-4 AVC/H.264]
                'video/mp4; codecs="avc1.42e01e, mp4a.40.2"',    // MPEG4, AVC(H.264) Baseline 1.3, AAC-LC, [MPEG-4 AVC/H.264]
                'video/mp4; codecs="avc1.66.30,  mp4a.40.5"',    // MPEG4, AVC(H.264) Baseline 3.0, AAC-HC, [MPEG-4 AVC/H.264]
                'video/mp4; codecs="avc1.42001e, mp4a.40.5"',    // MPEG4, AVC(H.264) Baseline 3.0, AAC-HC, [MPEG-4 AVC/H.264]
                'video/mp4; codecs="avc1.42001f, mp4a.40.5"',    // MPEG4, AVC(H.264) Baseline 3.1, AAC-HC, [MPEG-4 AVC/H.264]
                'video/mp4; codecs="avc1.77.30,  mp4a.40.5"',    // MPEG4, AVC(H.264) Main 3.0, AAC-HC,     [MPEG-4 AVC/H.264]
                'video/mp4; codecs="avc1.4d001e, mp4a.40.5"',    // MPEG4, AVC(H.264) Main 3.0, AAC-HC,     [MPEG-4 AVC/H.264]
                'video/mp4; codecs="avc1.4d001f, mp4a.40.5"',    // MPEG4, AVC(H.264) Main 3.1, AAC-HC,     [MPEG-4 AVC/H.264]
                'video/mp4; codecs="avc1.640029, mp4a.40.5"',    // MPEG4, AVC(H.264) High 4.1, AAC-HC,     [MPEG-4 AVC/H.264]
                'audio/mp4; codecs="mp4a.40.2"',                 // MPEG4 AAC-LC
                'audio/mp4; codecs="mp4a.40.5"',                 // MPEG4 HE-AAC
                'audio/mp4; codecs="mp4a.67"',                   // MPEG2 AAC-LC
                'video/mp4; codecs="mp4a.40.2"',
                'video/mp4; codecs="avc1.4d001e, mp4a.40.2"',    // MPEG4 AVC(H.264) Main 3.0, AAC-LC
                'video/x-m4v',                                   // m4v,
                'video/quicktime',                               // mov,
                'video/mp4; codecs="mp4v.20.8, mp4a.40.3"',      // mp4, mpeg4 visual, mp3
                'video/mp4; codecs="mp4v.20.8, samr"',           // mp4(3gp), mpeg4 visual, amr
                'application/x-mpegurl',                         // HLS, AVC, AAC
                'application/vnd.apple.mpegurl',                 // HLS, AVC, AAC
                'application/vnd.ms-ss',                         // SmoothStreaming
                'application/vnd.ms-sstr+xml',                   // SmoothStreaming
            ];
            
            testTypes(validTypes);
        }
		
		//onLoad();
		
		// --- end test codecs ---
		*/
		
		
		var video = document.querySelector('video.player');

		//var assetURL = 'video/frag.mp4';
		//var assetURL = 'video/sample_dashinit.mp4';
		//var assetURL = 'video/test-720.mp4';
		//var assetURL = 'video/test-1080.mp4';
		//var assetURL = 'https://wowza.peer5.com/vod/mp4:orion.mp4/media_w71466839_0.ts';
		var assetURL = 'video/media.mp4';
		//var assetURL = 'video/output.mp4';
		//var assetURL = 'video/toystory.mp4';
		

		var mimeCodec = 'video/mp4; codecs="avc1.42E01E, mp4a.40.2"';
		//var mimeCodec = 'video/mp4; codecs="avc1.4d400d, mp4a.40.2"';
		//var mimeCodec = 'video/mp4; codecs="avc1.64001f, mp4a.40.2"';
		//var mimeCodec = 'video/mp4; codecs="avc1.100.31, mp4a.40.2"';
		//var mimeCodec = 'video/mp2t; codecs="avc1.100.31, mp4a.40.2"';
		//var mimeCodec = 'video/mp4; codecs="avc1.64001f, mp4a.40.2"';
		//var mimeCodec = 'video/mp4; codecs="avc1.4D401F, mp4a.40.2"';		// media
		//var mimeCodec = 'video/mp4; codecs="avc1.4D401E, mp4a.40.2"';		// toystory
		
		
		// Запуск с использованием MediaSource
		/*
		if ('MediaSource' in window) {
			  var mediaSource = new MediaSource();
			  //mediaSource.addEventListener('addsourcebuffer', addSourceBuffer);
			  //mediaSource.addEventListener('sourceended', sourceEnded);
			  
			  console.log('AAA mediaSource.readyState = ', mediaSource.readyState); // closed
			  video.src = URL.createObjectURL(mediaSource);
			  mediaSource.addEventListener('sourceopen', sourceOpen);
		}
		*/

		/*
		function addSourceBuffer(a) {
			console.log('AAA addSourceBuffer', a);
		}
	   
		function sourceEnded() {
			console.log('AAA sourceEnded');
		}
		
		function updateFunct() {
			console.log('AAA update');
		}
		*/
	   
		
		function sourceOpen (_) {
			//console.log('AAA sourceOpen mediaSource = ', this);
			console.log('AAA mediaSource.readyState = ', this.readyState); // open
			var mediaSource = this;
			var sourceBuffer = mediaSource.addSourceBuffer(mimeCodec);

			console.log('AAA sourceOpen assetURL = ', assetURL);
			getBuf(assetURL, function (buf) {
				console.log('AAA getBuf arraybuffer xhr.response = ', buf);
				console.log('AAA mediaSource = ', mediaSource);
				
				sourceBuffer.addEventListener('updateend', function (_) {
					console.log('AAA updateend');
					console.log('AAA mediaSource.readyState = ', mediaSource.readyState);
					
					//mediaSource.endOfStream();
					//video.play();
					//console.log('AAA mediaSource.readyState = ', mediaSource.readyState); // ended
				});
			   
				//sourceBuffer.appendBuffer(buf);
				sourceBuffer.appendBuffer(new Uint8Array(buf));
				
				
				
			});

		};
		
		// Запуск без MediaSource
		getBuf(assetURL, function (buf) {
			console.log('AAA getBuf arraybuffer xhr.response = ', buf);
			var file = new Blob([buf], {type: 'video/mp4'});
			video.src = URL.createObjectURL(file);
		});

		function getBuf (url, cb) {
		  var xhr = new XMLHttpRequest;
		  xhr.open('get', url);
		  xhr.responseType = 'arraybuffer';
		  //xhr.responseType = 'blob';
		  xhr.onload = function () {
			  cb(xhr.response);
			  
			  /*
				var uInt8Array = new Uint8Array(this.response);
				var i = uInt8Array.length;
				var binaryString = new Array(i);
				
				while (i--)
				{
					binaryString[i] = String.fromCharCode(uInt8Array[i]);
					console.log('AAA binaryString = ', binaryString[i]);
				}
				
				var data = binaryString.join('');
				var base64 = window.btoa(data);
				console.log('AAA base64 = ', base64);
				//document.getElementById("myImage").src="data:image/png;base64,"+base64;
				*/
		  };
		  xhr.send();
		};
		
	});
}) (jQuery);




