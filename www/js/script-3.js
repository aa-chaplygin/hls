
/*
var peer = new Peer({key: 'x7fwx2kavpy6tj4i'});
var connectedPeers = {};


// Показываем свой ID.
peer.on('open', function(id){
	console.log('AAA peer.open id ', id);
	$('#pid').text(id);
});

// Await connections from others
peer.on('connection', connect);

peer.on('error', function(err) {
	console.log('AAA peer.error ', err);
})

// Handle a connection object.
function connect(c) {
	console.log('AAA connect: ', c);
	// Handle a chat connection.
	if (c.label === 'chat') {
		var chatbox = $('<div></div>').addClass('connection').addClass('active').attr('id', c.peer);
		var header = $('<h1></h1>').html('Chat with <strong>' + c.peer + '</strong>');
		var messages = $('<div><em>Peer connected.</em></div>').addClass('messages');
		chatbox.append(header);
		chatbox.append(messages);

		// Select connection handler.
		chatbox.on('click', function() {
			if ($(this).attr('class').indexOf('active') === -1) {
				$(this).addClass('active');
			} else {
				$(this).removeClass('active');
			}
		});
		$('.filler').hide();
		$('#connections').append(chatbox);

		c.on('data', function(data) {
			messages.append('<div><span class="peer">' + c.peer + '</span>: ' + data + '</div>');
		});
		c.on('close', function() {
			alert(c.peer + ' has left the chat.');
			chatbox.remove();
			if ($('.connection').length === 0) {
				$('.filler').show();
			}
			delete connectedPeers[c.peer];
		});
	} else if (c.label === 'file') {
		c.on('data', function(data) {
			// If we're getting a file, create a URL for it.
			if (data.constructor === ArrayBuffer) {
				var dataView = new Uint8Array(data);
				var dataBlob = new Blob([dataView]);
				var url = window.URL.createObjectURL(dataBlob);
				$('#' + c.peer).find('.messages').append('<div><span class="file">' + c.peer + ' has sent you a <a target="_blank" href="' + url + '">file</a>.</span></div>');
			}
		});
	} else if (c.label === 'data') {
		c.on('data', function(data) {
			
			if (data.type == 'request')
			{
				console.log('AAA получили запрос на id: ', data.id);
				eachActiveConnection(function(c, $c) {
					var dataResponse = {
						type: 'response',
						id: data.id,
						data: '123123123'
					};
					if (c.label === 'data') {
						c.send(dataResponse);
						$c.find('.messages').append('<div><span class="data">Вы отправили данные.</span></div>');
					}

				});
			}
			if (data.type == 'response')
			{
				console.log('AAA получили ответ на id: ', id);
			}
			
		});
	}
	connectedPeers[c.peer] = 1;
}

*/

$(document).ready(function() {
	
	var peer;
	var connectedPeers = {};
	
	// Регистрируем свой peer
	$('.peer-reg').click(function() {
		
		var keyID = ($(this).attr('id') == 1) ? '111asdasdasd' : '222asdasdasd';
		peer = new Peer(keyID, {key: 'x7fwx2kavpy6tj4i'});
		
		// Показываем свой ID.
		peer.on('open', function(id){
			console.log('AAA peer.open id ', id);
			console.log('AAA peer ', peer);
			$('#pid').text(id);
		});

		// Await connections from others
		peer.on('connection', connect);

		peer.on('error', function(err) {
			console.log('AAA peer.error ', err);
		})
	});
	
	// Connect to a peer
	$('#connect').click(function() {
		var requestedPeer = $('#rid').val();
		console.log('AAA requestedPeer = ', requestedPeer);
		if (!connectedPeers[requestedPeer]) {
			
			console.log('AAA устанавливаем соединение с ', requestedPeer);
			/*
			// Соединение для чата.
			var c = peer.connect(requestedPeer, {
				label: 'chat',
				serialization: 'none',
				metadata: {message: 'hi i want to chat with you!'}
			});
			c.on('open', function() {
				connect(c);
			});
			c.on('error', function(err) { alert(err); });
			
			// Соединение для передачи файлов.
			var f = peer.connect(requestedPeer, {
				label: 'file',
				reliable: true
			});
			f.on('open', function() {
				connect(f);
			});
			f.on('error', function(err) { alert(err); });
			*/
			// Соединение для передачи данных.
			var d = peer.connect(requestedPeer, {
				label: 'data',
				reliable: true
			});
			d.on('open', function() {
				connect(d);
			});
			d.on('error', function(err) { alert(err); });
			
		}
		else
		{
			console.log('AAA соединение уже установлено');
		}
		connectedPeers[requestedPeer] = 1;
	});

	/*
	// Отправка сообщений
	$('#send').submit(function(e) {
		e.preventDefault();
		// For each active connection, send the message.
		var msg = $('#text').val();
		eachActiveConnection(function(c, $c) {
			if (c.label === 'chat') {
				c.send(msg);
				$c.find('.messages').append('<div><span class="you">You: </span>' + msg + '</div>');
			}
		});
		$('#text').val('');
		$('#text').focus();
	});
	
	// Отправка файлов
	var box = $('#box');
	box.on('dragenter', doNothing);
	box.on('dragover', doNothing);
	box.on('drop', function(e){
		e.originalEvent.preventDefault();
		var file = e.originalEvent.dataTransfer.files[0];
		eachActiveConnection(function(c, $c) {
			if (c.label === 'file') {
				console.log('AAA drop file', file);
				c.send(file);
				$c.find('.messages').append('<div><span class="file">You sent a file.</span></div>');
			}
		});
	});
	
	function doNothing(e){
		e.preventDefault();
		e.stopPropagation();
	}
	*/
   
	// Отправка данных
	$('#send-data').click(function() {
		
		/*
		eachActiveConnection(function(c, $c) {
			console.log('AAA eachActiveConnection');
			var dataRequest = {
					type: 'request',
					id: '123'
				};
			if (c.label === 'data') {
				c.send(dataRequest);
				$c.find('.messages').append('<div><span class="data">Вы отправили данные.</span></div>');
			}
		});
		*/
	   
		var peerId = (peer.id == "111asdasdasd") ? "222asdasdasd" : "111asdasdasd";
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
  
	// Close a connection.
	$('#close').click(function() {
		eachActiveConnection(function(c) {
			c.close();
		});
	});
	
	// Handle a connection object.
	function connect(c) {
		console.log('AAA connect: ', c);
		// Handle a chat connection.
		/*
		if (c.label === 'chat') {
			var chatbox = $('<div></div>').addClass('connection').addClass('active').attr('id', c.peer);
			var header = $('<h1></h1>').html('Chat with <strong>' + c.peer + '</strong>');
			var messages = $('<div><em>Peer connected.</em></div>').addClass('messages');
			chatbox.append(header);
			chatbox.append(messages);

			// Select connection handler.
			chatbox.on('click', function() {
				if ($(this).attr('class').indexOf('active') === -1) {
					$(this).addClass('active');
				} else {
					$(this).removeClass('active');
				}
			});
			$('.filler').hide();
			$('#connections').append(chatbox);

			c.on('data', function(data) {
				messages.append('<div><span class="peer">' + c.peer + '</span>: ' + data + '</div>');
			});
			c.on('close', function() {
				alert(c.peer + ' has left the chat.');
				chatbox.remove();
				if ($('.connection').length === 0) {
					$('.filler').show();
				}
				delete connectedPeers[c.peer];
			});
		} else if (c.label === 'file') {
			c.on('data', function(data) {
				// If we're getting a file, create a URL for it.
				if (data.constructor === ArrayBuffer) {
					var dataView = new Uint8Array(data);
					var dataBlob = new Blob([dataView]);
					var url = window.URL.createObjectURL(dataBlob);
					$('#' + c.peer).find('.messages').append('<div><span class="file">' + c.peer + ' has sent you a <a target="_blank" href="' + url + '">file</a>.</span></div>');
				}
			});
		} else if (c.label === 'data') {
		*/
		if (c.label === 'data') {
			c.on('data', function(data) {

				if (data.type == 'request')
				{
					console.log('AAA получили запрос на id: ', data.id);
					/*
					eachActiveConnection(function(c, $c) {
						var dataResponse = {
							type: 'response',
							id: data.id,
							data: 'response -> 123123123'
						};
						if (c.label === 'data') {
							c.send(dataResponse);
							$c.find('.messages').append('<div><span class="data">Вы отправили данные.</span></div>');
						}
					});
					*/
				   
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
				}

			});
		}
		connectedPeers[c.peer] = 1;
	}

	

	// Goes through each active peer and calls FN on its connections.
	function eachActiveConnection(fn) {
		var actives = $('.active');
		console.log('AAA actives = ', actives);
		var checkedIds = {};
		actives.each(function() {
			var peerId = $(this).attr('id');
			console.log('AAA actives peerId: ', peerId);
			if (!checkedIds[peerId]) {
				var conns = peer.connections[peerId];
				console.log('AAA actives conns: ', conns);
				for (var i = 0, ii = conns.length; i < ii; i += 1) {
					var conn = conns[i];
					fn(conn, $(this));
				}
			}
			checkedIds[peerId] = 1;
		});
	}
  
});


// Make sure things clean up properly.
window.onunload = window.onbeforeunload = function(e) {
	console.log('AAA window.onunload window.onbeforeunload');
	if (!!peer && !peer.destroyed) {
		peer.destroy();
	}
};
