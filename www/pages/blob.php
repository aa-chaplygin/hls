<!DOCTYPE html>
<html>
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
		<title>blob</title>
	</head>
	<body>
		<h2>blob</h2>
		<div id="demo">
			<video class="player" width="640" height="360" controls></video>
		</div>
		
		<script>
			var video = document.querySelector('video.player');

			var assetURL = '/video/frag.mp4';
			//var assetURL = '/video/media.mp4';
			//var assetURL = '/video/output.mp4';
			//var assetURL = '/video/toystory.mp4';
			
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
			  };
			  xhr.send();
			};
		</script>
		
	</body>
</html>

