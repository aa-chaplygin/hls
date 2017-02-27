$(document).ready(function() {
	
	var clientID = window.WebRTC_GLOBALS.client_id;
	var localClientID = (clientID == 1) ? '111asdasdasd' : '222asdasdasd';
	var remoteClientID = (clientID == 1) ? '222asdasdasd' : '111asdasdasd';
	
	var peer;
	var connectedPeers = {};
	
	// Регистрируем свой peer
	var keyID = localClientID;
	peer = new Peer(keyID, {key: 'x7fwx2kavpy6tj4i'});
		
	// Показываем свой ID.
	peer.on('open', function(id){
		console.log('AAA peer ', peer);
		console.log('AAA peer.open id ', id);
		$('#pid').text(id);
	});

	// Await connections from others
	peer.on('connection', connect);

	peer.on('error', function(err) {
		console.log('AAA peer.error ', err);
	})
		
	// Отправка данных
	$('#send-data').click(function() {
		
		var requestedPeer = remoteClientID;
		console.log('AAA  Устанавливаем соединение для передачи данных c ', requestedPeer);
		
		// Соединение для передачи данных.
		var d = peer.connect(requestedPeer, {
			label: 'data',
			reliable: true
		});
		d.on('open', function() {
			connect(d);
			
			// Отправляем данные
			var peerId = remoteClientID;
			console.log('AAA  Отправляем данные ', peerId);
			var conns = peer.connections[peerId];
			var conn = conns[0];
			var dataRequest = {
					type: 'request',
					id: '123'
				};
			if (conn.label === 'data') {
				conn.send(dataRequest);
			}
			
		});
		d.on('error', function(err) { alert(err); });
		
	});
	
	// Handle a connection object.
	function connect(c) {
		console.log('AAA connect: ', c);
		// Handle a chat connection.
		if (c.label === 'data') {
			c.on('data', function(data) {

				if (data.type == 'request')
				{
					console.log('AAA получили запрос на id: ', data.id);
					var peerId = (peer.id == "111asdasdasd") ? "222asdasdasd" : "111asdasdasd";
					var conns = peer.connections[peerId];
					var conn = conns[0];
					var dataResponse = {
							type: 'response',
							id: data.id,
							data: 'response -> 123123123'
						};
					if (conn.label === 'data') {
						conn.send(dataResponse);
					}
				   
				}
				if (data.type == 'response')
				{
					console.log('AAA получили ответ на id: ', data.id);
					console.log('AAA получили ответ на id: ', data.data);
					
					// Закрываем соединение
					var peerId = (peer.id == "111asdasdasd") ? "222asdasdasd" : "111asdasdasd";
					var conns = peer.connections[peerId];
					var conn = conns[0];
					console.log('AAA Закрываем соединение conn = ', conn);
					conn.close();
				}

			});
		}
		connectedPeers[c.peer] = 1;
	}
	
	// Make sure things clean up properly.
	window.onunload = window.onbeforeunload = function(e) {
		console.log('AAA window.onunload window.onbeforeunload');
		if (!!peer && !peer.destroyed) {
			peer.destroy();
		}
	};
  
});


