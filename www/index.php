<!DOCTYPE html>
<html>
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
		<title>HLS</title>
		<link rel="stylesheet" href="/css/reset.css">
		<link rel="stylesheet" href="/css/styles.css">
	</head>
	<body>
		
		<h1><?=$_SERVER ["HTTP_HOST"] ?></h1>
		
		<ul>
		<? if ($_SERVER ["HTTP_HOST"] == 'hls.dev') { ?>
			
			<!--
			<li><a href="pages/rewind-mpd-dat.html">Тестирование перемотки MPD DAT(JSON)</a></li>
			<li><a href="pages/rewind-mpd-dat-hash.html">Тестирование перемотки MPD DAT(JSON) hash</a></li>
			<li><a href="pages/rewind-dat-hash-manager.html">Тестирование перемотки DAT(JSON) hash MANAGER</a></li>
			<li><a href="pages/rewind-fetch.html">Тестирование Fetch-API</a></li>
			<li><a href="pages/storage.html">Тестирование STORAGE</a></li>
			<li><a href="pages/mp4box.html">Тестирование MP4box.js</a></li>
			-->
			
			<li><a href="pages/video.html">Обычное видео в теге video</a></li>
			
			<h2>Примеры потокового видео:</h2>
			<li><a href="pages/hls.html">Видео HLS</a></li>
			<li><a href="pages/peer-dash.html">Peer DASH</a></li>
			<li><a href="pages/peer-hls.html">Peer HLS</a></li>
			
			<h2>Тестирование объекта blob</h2>
			<li><a href="pages/blob.html">Видео напрямую из объекта blob</a></li>
			
			<h2>Тестирование перемотки</h2>
			<li><a href="pages/rewind-mpd.html">Тестирование перемотки MPD (xml-данные одна дорожка)</a></li>
			<li><a href="pages/rewind-m4s.html">Тестирование перемотки M4S (json-данные две дорожки)</a></li>
			
			<h2>Тестирование файлов DAT(JSON) с запросами через hash MANAGER</h2>
			<li>
				<ul>
					<div>Range</div>
					<li><a href="pages/rewind-dat-dual-hash-manager.php?file=monaco_dash.dat">RANGE длинный файл одна дорожка - monaco_dash.dat</a></li>
					<li><a href="pages/rewind-dat-dual-hash-manager.php?file=toystory_dash.dat">RANGE одна дорожка - toystory_dash.dat</a></li>
					<li><a href="pages/rewind-dat-dual-hash-manager.php?file=toystory_dash-dual.dat">RANGE две дорожки - toystory_dash-dual.dat</a></li>
					<div>M4S</div>
					<li><a href="pages/rewind-dat-dual-hash-manager.php?file=test-manifest-toystory.dat">M4S удалённый файл, одна дорожка - test-manifest-toystory.dat</a></li>
					<li><a href="pages/rewind-dat-dual-hash-manager.php?file=test-manifest-toystory-dual.dat">M4S локальный файл, две дорожки - test-manifest-toystory-dual.dat</a></li>
					<li><a href="pages/rewind-dat-dual-hash-manager.php?file=manifest-toystory.dat">M4S локальный файл, одна дорожка - manifest-toystory.dat</a></li>
					<div>использование PeerJS</div>
					<li><a href="pages/rewind-dat-dual-hash-manager.php?peer=local">Локально Peer Client - RANGE одна дорожка - toystory_dash.dat</a></li>
					<li><a href="pages/rewind-dat-dual-hash-manager.php?peer=remote">Удалённо Peer Client - RANGE одна дорожка - toystory_dash.dat</a></li>
				</ul>
			</li>
			<h2>Тестирование WebRTC</h2>
			<li><a href="pages/webrtc.html">Тестирование WebRTC</a></li>
			<h2>Тестирование PeerJS</h2>
			<li><a href="pages/webrtc-2.html">Hello, world</a></li>
			<li><a href="pages/webrtc-chat.html">Chat</a></li>
			<li><a href="pages/webrtc-data.php?client=1">data-client-1</a></li>
			<li><a href="pages/webrtc-data.php?client=2">data-client-2</a></li>
			
		<? } else { ?>
			
			<h2>Тестирование файлов DAT(JSON) с запросами через hash MANAGER</h2>
			<li>
				<ul>
					<div>Range</div>
					<li><a href="pages/rewind-dat-dual-hash-manager.php?file=toystory_dash.dat">RANGE одна дорожка - toystory_dash.dat</a></li>
					<li><a href="pages/rewind-dat-dual-hash-manager.php?file=toystory_dash-dual.dat">RANGE две дорожки - toystory_dash-dual.dat</a></li>
					<div>M4S</div>
					<li><a href="pages/rewind-dat-dual-hash-manager.php?file=test-manifest-toystory.dat">M4S удалённый файл, одна дорожка - test-manifest-toystory.dat</a></li>
					<li><a href="pages/rewind-dat-dual-hash-manager.php?file=test-manifest-toystory-dual.dat">M4S локальный файл, две дорожки - test-manifest-toystory-dual.dat</a></li>
					<li><a href="pages/rewind-dat-dual-hash-manager.php?file=manifest-toystory.dat">M4S локальный файл, одна дорожка - manifest-toystory.dat</a></li>
					<div>использование PeerJS</div>
					<li><a href="pages/rewind-dat-dual-hash-manager.php?peer=local">Локально Peer Client - RANGE одна дорожка - toystory_dash.dat</a></li>
					<li><a href="pages/rewind-dat-dual-hash-manager.php?peer=remote">Удалённо Peer Client - RANGE одна дорожка - toystory_dash.dat</a></li>
				</ul>
			</li>
		
		<? } ?>
			
		</ul>
		
	</body>
</html>
