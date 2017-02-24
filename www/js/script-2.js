$(document).ready(function() {

	// Create a new Peer with our demo API key, with debug set to true so we can see what's going on.
	peer1 = new Peer({ key: 'lwjd5qra8257b9'});
	// Create another Peer with our demo API key to connect to.
	peer2 = new Peer({ key: 'lwjd5qra8257b9'});

	// The `open` event signifies that the Peer is ready to connect with other
	// Peers and, if we didn't provide the Peer with an ID, that an ID has been
	// assigned by the server.
	
	peer1.on('open', function(id){
		console.log('AAA peer1 open : ', id);
		peerId1 = id;
		var c = peer2.connect(peerId1);
		c.on('open', function() {
			console.log('AAA c.open');
			c.send('111 ');
		});
		c.on('data', function(data) {
			console.log('AAA c.data = ', data);
			// When we receive '222', send ' 333'.
			$('#helloworld').append(data);
			c.send('333 ');
		});
	});
	
   
	// Wait for a connection from the second peer.
	peer1.on('connection', function(connection) {
		console.log('AAA peer1 connection = ', connection);
		// This `connection` is a DataConnection object with which we can send data.
		// The `open` event firing means that the connection is now ready to transmit data.
		connection.on('open', function() {
			console.log('AAA connection.open');
			// Send '222' on the connection.
			connection.send('222 ');
		});
		// The `data` event is fired when data is received on the connection.
		connection.on('data', function(data) {
			console.log('AAA connection.data = ',data);
			// Append the data to body.
			$('#helloworld').append(data);
			
		});
	});
	
});
