<!DOCTYPE html>
<html>

<head>
	<meta charset="utf-8" />
	<title>WebRTC example</title>
	<script src="/js/jquery-1.10.2.min.js"></script>
	<script src="/js/peer.js"></script>
	<script src="/js/script-webrtc-data.js"></script>
	<!-- Передача параметров от PHP-скриптов пожатым JS-скриптам -->
	<script type="text/javascript">
		window.WebRTC_GLOBALS = {
			client_id: '<?=$_GET['client'] ?>'
			}
	</script>
</head>

<body>
	
	<h2>WebRTC</h2>
	
	<div id="actions">
		<b>Your PeerJS ID is</b> <span id="pid"></span>
	</div>
	
	<div id="wrap" style="margin-top: 20px;">
		<div id="connections">
			<span class="filler">У вас нет созданных соединений</span>
		</div>
	</div>
	
	<div id="send-data" style="cursor: pointer;">Send data --> </div>
	
</body>
</html>