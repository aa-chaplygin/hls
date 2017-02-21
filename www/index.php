<!DOCTYPE html>
<html>
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
		<title>HLS</title>
		<link rel="stylesheet" href="/css/reset.css">
		<link rel="stylesheet" href="/css/styles.css">
	</head>
	<body>
		
		<ul>
			<? /*
			<li><a href="pages/video.html">Обычное видео в теге video</a></li>
			<li><a href="pages/blob.html">Видео напрямую из объекта blob</a></li>
			<li><a href="pages/hls.html">Видео HLS</a></li>
			<li><a href="pages/peer-dash.html">Peer DASH</a></li>
			<li><a href="pages/peer-hls.html">Peer HLS</a></li>
			
			<li><a href="pages/rewind-mpd.html">Тестирование перемотки MPD</a></li>
			<li><a href="pages/rewind-m4s.html">Тестирование перемотки M4S</a></li>
			<li><a href="pages/rewind-mpd-dat.html">Тестирование перемотки MPD DAT(JSON)</a></li>
			<li><a href="pages/rewind-mpd-dat-hash.html">Тестирование перемотки MPD DAT(JSON) hash</a></li>
			<li><a href="pages/rewind-dat-hash-manager.html">Тестирование перемотки DAT(JSON) hash MANAGER</a></li>
			
			<li><a href="pages/rewind-fetch.html">Тестирование Fetch-API</a></li>
			<li><a href="pages/storage.html">Тестирование STORAGE</a></li>
			<li><a href="pages/mp4box.html">Тестирование MP4box.js</a></li>
			*/ ?>
			<h2>Тестирование файлов DAT(JSON) с запросами через hash MANAGER</h2>
			<li>
				<ul>
					<div>Range</div>
					<li><a href="pages/rewind-dat-dual-hash-manager.php?file=monaco_dash.dat">RANGE длинный файл - monaco_dash.dat</a></li>
					<li><a href="pages/rewind-dat-dual-hash-manager.php?file=toystory_dash.dat">RANGE - toystory_dash.dat</a></li>
					<li><a href="pages/rewind-dat-dual-hash-manager.php?file=toystory_dash-dual.dat">RANGE dual - toystory_dash-dual.dat</a></li>
					<div>M4S</div>
					<li><a href="pages/rewind-dat-dual-hash-manager.php?file=test-manifest-toystory.dat">M4S - test-manifest-toystory.dat</a></li>
					<li><a href="pages/rewind-dat-dual-hash-manager.php?file=test-manifest-toystory-dual.dat">M4S dual - test-manifest-toystory-dual.dat</a></li>
					<li><a href="pages/rewind-dat-dual-hash-manager.php?file=manifest-toystory.dat">M4S - manifest-toystory.dat</a></li>
				</ul>
			</li>
		</ul>
		
	</body>
</html>
