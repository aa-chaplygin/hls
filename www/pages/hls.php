<!DOCTYPE html>
<html>
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
		<title>HLS</title>
		<link rel="stylesheet" href="/css/video-js.css">
		<script src="/js/video.js"></script>
		<script src="/js/videojs-contrib-hls.js"></script>
	</head>
	<body>
		
		<h2>HLS</h2>
		<div id="demo">
			<video id="example-video" width="640" height="480" class="video-js vjs-default-skin" controls>
				<source src="/video/test-720.m3u8" type="application/x-mpegURL">
			</video>
		</div>
		
		<script>
			var player = videojs('example-video');
		</script>
		
	</body>
</html>

