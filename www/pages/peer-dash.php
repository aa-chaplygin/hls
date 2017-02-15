<!DOCTYPE html>
<html>
	<head>
		<meta charset="UTF-8">
		<title>Peer5 Demo</title>
		<!-- peer5 client & plugin-->
		<script src="//api.peer5.com/peer5.js?id=gctwdnxjpf03p4yykp00"></script>
		<script src="//api.peer5.com/peer5.shakaplayer.plugin.js"></script>
		<!-- shakaplayer script-->
		<script src="//cdnjs.cloudflare.com/ajax/libs/shaka-player/2.0.1/shaka-player.compiled.js"></script>
	</head>
<body>
	<video id="video" width="640" controls autoplay></video>
	<script>
		var video = document.getElementById('video');
		var player = new shaka.Player(video);
		player.load("//wowza.peer5.com/vod/mp4:gopro.mp4/manifest_mvTime.mpd");
	</script>
</body>
</html>
