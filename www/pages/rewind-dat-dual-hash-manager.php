<!DOCTYPE html>
<html>
<!-- Media streaming example
  Reads an .mpd file created using mp4box and plays the file
-->     
<head>
	<meta charset="utf-8" />
	<title>Media streaming example</title>
	<script src="/js/jquery-1.10.2.min.js"></script>
	<script src="/js/underscore-min.js"></script>
	<script src="/js/hash/hash-md5.js"></script>
	<script src="/js/hls-init.js"></script>
	<script src="/js/jquery.hls-mpd.js"></script>
	<script src="/js/jquery.hls-m4s.js"></script>
	
	<? if (isset($_GET['peer'])) { ?>
		<script src="/js/peer.js"></script>
		<? if ($_GET['peer']=='local') { ?>
			<script src="/js/jquery.cookie.js"></script>
			<script src="/js/manager/hash-manager-peer-local.js"></script>
		<? } else { ?>
			<script src="/js/manager/hash-manager-peer-remote.js"></script>
		<? } ?>
	<? } else { ?>
		<script src="/js/manager/hash-manager.js"></script>
	<? } ?>
	
	<?
		$test_file = 'toystory_dash.dat';
		$filename = (isset($_GET['file'])) ? $_GET['file'] : $test_file;
		chdir('../video/');
		$filename = (file_exists($filename)) ? $filename : $test_file;
	?>
	
	
		
	<!-- Передача параметров от PHP-скриптов пожатым JS-скриптам -->
	<script type="text/javascript">

		<? if (isset($_GET['peer'])) { ?>
		window.WebRTC_GLOBALS = {
			remote_id: '<?=$_GET['peer'] ?>'
			}
		<? } ?>
		
		window.HLS_GLOBALS = {
			file_dat: '/video/<?=$filename ?>',
			}
		/*
		range
		toystory_dash.dat
		toystory_dash-dual.dat
		monaco_dash.dat

		m4s
		manifest-toystory-dual.dat
		manifest-toystory.dat

		test m4s локальные файлы
		test-manifest-toystory-dual.dat
		test-manifest-toystory.dat
		*/
			
	</script>
</head>

<body>
	<h2>rewind</h2>
	<div id="grid">
		<video id="myVideo" width="640" height="360" controls>No video available</video>
	</div>
	<div id="seek-div" style="cursor: pointer; margin-top: 4px">[seek->]</div>
	<div id="ws-send-div" style="cursor: pointer; margin-top: 4px">[ws-send->]</div>
	
	<? if (isset($_GET['peer'])) { ?>
	<div id="peer-div" style="cursor: pointer; margin-top: 4px">[peer->]</div>
	<b>Your PeerJS ID is</b> <span id="pid"></span>
		<? if ($_GET['peer']=='remote') { ?>
		<div>
		<a id="lid" style="display: none;" href="<?=$_SERVER["DOCUMENT_URI"] ?>" target="_blank">Удаленный клиент с соединением сюда</a>
		</div>
		<? } ?>
	<? } ?>
</body>
</html>