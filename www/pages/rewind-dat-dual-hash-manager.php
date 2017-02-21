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
	<script src="/js/manager/hash-manager.js"></script>
	<? // Передача параметров от PHP-скриптов пожатым JS-скриптам ?>
	<script type="text/javascript">
		window.HLS_GLOBALS = {
			file_dat: '/video/' + '<?=$_GET['file']?>'
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
  
</body>
</html>