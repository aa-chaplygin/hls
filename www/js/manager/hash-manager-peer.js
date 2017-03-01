/*
	Manager
*/
var Manager = (function() {
	
	var
		$window = $(window),
		managerItem = this,
		segmentsData,
		type,
		
		indexedDB	= window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB,
		//IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction,
		
		db,
		segmentStore,
		baseName	= "exampleDatHash",
		storeName	= "segments",
		indexName	= "by_hash",
		fieldName	= "hash",
	
		peer,
		localClientID,
		remoteClientID,
		remoteClientNames;
	
	function connectDB()
	{
		//console.log('AAA Открываем базу данных:');
		//indexedDB.deleteDatabase("exampleDatHash");
		var indexDBRequest = indexedDB.open(baseName, 1);
		
		indexDBRequest.onupgradeneeded = function (event) {
			//console.log('AAA DB Базы ранее не существовало ');
			db = event.target.result;
			// Создаем хранилище объектов для БД: keyPath - уникальное свойство, которое будет однозначно идентифицировать запись в хранилище
			segmentStore = db.createObjectStore(storeName, {keyPath: fieldName});
			// Свойства, по каким производится поиск, оформляются в виде индексов (имя, поле, {уникальность ключа}) 
			segmentStore.createIndex(indexName, fieldName, {unique: true});
			// Отслеживаем завершение создания базы:
			segmentStore.transaction.oncomplete = function (event) {
			}
		};
		indexDBRequest.onsuccess = function (event) {
			//console.log('AAA DB Подключились к существующей БД ', managerItem);
			db = event.target.result;
			$window.trigger('Manager:connect', {type: 'success'});
		};
		indexDBRequest.onerror = function(event) {
			//console.log('AAA DB Подключиться к БД не удалось, обрабатываем ошибку');
			$window.trigger('Manager:connect', {type: 'error'});
		}
	}
	
	function initPeer()
	{
		var clientID = window.WebRTC_GLOBALS.client_id;
		
		/*
		var localClientName = '111asdasdasd111';
		var remoteClientName = '222asdasdasd222';
		localClientID = (clientID == 1) ? localClientName : remoteClientName;
		remoteClientID = (clientID == 1) ? remoteClientName : localClientName;
		*/
	   
		/*
		if ($.cookie('hls-peer'))
		{
			var dataCookie = $.cookie('hls-peer').split(',');
			console.log('AAA есть кукис ', typeof (dataCookie));
		}
		else
		{
			console.log('AAA создаем кукис');
			var dataCookie = [clientID];
			$.cookie('hls-peer', dataCookie.join(','));
		}
		 */
	  
		var clientNames = [
				'111asdasdasd111',
				'222asdasdasd222',
				'333asdasdasd333'
			];
		localClientID = clientNames[clientID-1];
		clientNames.splice(clientID-1,1);
		remoteClientNames =  clientNames;
		

		// Регистрируем свой peer
		var keyID = localClientID;
		peer = new Peer(keyID, {key: 'x7fwx2kavpy6tj4i'});

		// Показываем свой ID.
		peer.on('open', function(id){
			console.log('AAA peer.open id: ', id);
			$('#pid').text(id);
			// тут отправить пиринг-инфу на сервер
		});

		// Await connections from others
		peer.on('connection', connect);

		peer.on('error', function(err) {
			console.log('AAA peer.error ', err);
		})
		
		// Make sure things clean up properly.
		window.onunload = window.onbeforeunload = function(e) {
			console.log('AAA window.onunload window.onbeforeunload');
			if (!!peer && !peer.destroyed) {
				peer.destroy();
			}
		};
	}
	
	function initData(data)
	{
		console.log('AAA MMM segmentsData = ', data);
		segmentsData = data.segmentsData;
		type = data.type;
		connectDB();
		initPeer();
	}
	
	function getSegment(hashValue, callback)
	{
		console.log('AAA MMM getSegment = ', hashValue);
		
		//if (hashValue == '1baa160a7645ffe7496d118bf8d9452a' || hashValue == '6df1da140fea9152364cf00629c15488')
		//if (hashValue == '1baa160a7645ffe7496d118bf8d9452a')
		if (hashValue != '61c85e432083be705ff75a2b10fcd213' && hashValue != '8014b59ef499b499fdd501528d25cada')
		{
		
			remoteClientID = remoteClientNames[Math.floor(Math.random() * remoteClientNames.length)];
			var requestedPeer = remoteClientID;
			console.log('AAA --->>> Peer Устанавливаем соединение для передачи данных c ', requestedPeer);

			// Соединение для передачи данных.
			var dataConnection = peer.connect(requestedPeer, {
				label: 'data',
				reliable: true
			});
			dataConnection.on('open', function() {
				//console.log('AAA d = ', dataConnection.id);
				//console.log('AAA conns = ', peer.connections);

				console.log('AAA dataConnection.open = ', dataConnection);

				// Отправляем данные
				var peerId = dataConnection.peer;
				console.log('AAA  Отправляем запрос клиенту -> ', peerId);
				var conns = peer.connections[peerId];
				var conn = conns[conns.length-1];
				var dataRequest = {
						type: 'request',
						id: '123',
						hashValue: hashValue,
						clientID: peer.id
					};
				if (conn.label === 'data') {
					conn.send(dataRequest);
				}

			});
			dataConnection.on('data', function(data) {
				console.log('AAA dataConnection ', data.type);
				if (data.type == 'response')
				{
					console.log('AAA получили ответ от id: ', data.clientID, ' на hashValue: ', data.hashValue);
					console.log('AAA Закрываем соединение с id: --> ', data.clientID);
					console.log('AAA peer.connections: --> ', peer.connections);

					// Закрываем соединение
					var peerId = data.clientID;
					var conns = peer.connections[peerId];
					var conn = conns[conns.length-1];
					conn.close();

					console.log('AAA полученные данные: ', data.data);
					var dataSegment = data.data;
					if ($.isFunction(callback))
					{
						callback(dataSegment);
					}

				}
			});
			dataConnection.on('error', function(err) {
				console.log('AAA dataConnection.error ', err);
			});
			dataConnection.on('close', function() {
				console.log('AAA dataConnection.close ', dataConnection);
				delete peer.connections[dataConnection.peer];
			});
			
		}
		else
		{
			//console.log('AAA Извлекаем данные из базы: ', db);
			var tx = db.transaction(storeName, "readonly");
			var store = tx.objectStore(storeName);
			var index = store.index(indexName);
			var requestDB = index.get(hashValue);
			var segmentsDBItem;

			requestDB.onsuccess = function(event) {
				segmentsDBItem = requestDB.result;
				// проверка в БД
				if (segmentsDBItem)
				{
					console.log('AAA есть данные в БД ', segmentsDBItem);
					var dataSegment = new Uint8Array(segmentsDBItem.data);
					if ($.isFunction(callback))
					{
						callback(dataSegment);
					}
				}
				else
				{
					console.log('AAA нет данных в БД, делаем запрос');

					if (type == 'mpd')
					{
						var segmentItem = _.find(segmentsData.segments, function(item){ return item.h == hashValue; });
						var url = (segmentItem.t == 'v') ? segmentsData.file : segmentsData.fileAudio;
						var range = segmentItem.r;
					}
					else // type == 'm4s'
					{
						var segmentItem = _.find(segmentsData.segments, function(item){ return item.h == hashValue; });

						if (segmentItem.i == 'i')
						{
							var url = (segmentItem.t == 'v') ? segmentsData.fileVideoInit : segmentsData.fileAudioInit;
						}
						else
						{
							var urlTemplate = (segmentItem.t == 'v') ? segmentsData.fileVideo : segmentsData.fileAudio;
							var url = urlTemplate.replace("$Number$", segmentItem.i);
						}
					}

					//if (range || url) {
					if (segmentItem.r || url) {

						// Запрос на разные домены:
						/*
						serverNum = segmentNum % 4 + 1;
						url = 'http://n' + serverNum + '.hls.dev/'+ url;
						console.log('AAA playSegment ', ind, ' ', url);
						segmentNum++;
						*/

						var xhr = new XMLHttpRequest();
						// Set the desired range of bytes we want from the mp4 video file
						xhr.open('GET', url);
						xhr.responseType = 'arraybuffer';
						if (type == 'mpd')
						{
							//console.log('AAA Range = ', range);
							xhr.setRequestHeader("Range", "bytes=" + range);
						}

						xhr.send();

						xhr.addEventListener("readystatechange", function () {
							if (xhr.readyState == xhr.DONE && xhr.response != null /*&& xhr.status == 200*/) { // wait for video data to load
								var dataSegment = new Uint8Array(xhr.response);

								/*
								var t0 = performance.now();
								var hashData = hashGet(dataSegment);
								var t1 = performance.now();
								console.log('AAA xhr.response hash = ', Math.round(t1 - t0), 'msec. ', hashData);
								*/

								// Сохраняем данные в базе
								//console.log('AAA Сохраняем данные в базе:');
								var tx = db.transaction("segments", "readwrite");
								var store = tx.objectStore("segments");
								var requestAddSegment = store.put({hash:hashValue, data: xhr.response});
								requestAddSegment.onsuccess= function(){
									//console.log('AAA Данные сегмента сохранились');
								}
								requestAddSegment.onerror= function(){
									//console.log('AAA Во время сохранения данных произошла ошибка');
								}

								if ($.isFunction(callback))
								{
									callback(dataSegment);
								}
							}
						}, false);
					}
				}
			}

			requestDB.onerror = function(event) {
				console.log('AAA requestDB error ', event);
			}
		}
		
	}
	
	function hashGet(str)
	{
		var bytesCount = 30000;
		var dataStr;
		
		if (str.length < bytesCount)
		{
			dataStr = str;
		}
		else
		{
			dataStr = [];
			var step = Math.floor(str.length/bytesCount);
			var j = 0;
			while (j < str.length)
			{
				dataStr.push(str[j]);
				j += step;
			}
		}

	   return Hash.hash(dataStr);
	}
	
	// Handle a connection object.
	function connect(targetConnection) {
		console.log('AAA -->>-- targetConnection: ', targetConnection);
		console.log('AAA -->>-- targetConnection peer =  ', peer.connections);
		
		// Handle a chat connection.
		if (targetConnection.label === 'data') {
			
			targetConnection.on('data', function(data) {
				if (data.type == 'request')
				{
					console.log('AAA получили запрос от ', data.clientID, ' на hashValue: ', data.hashValue);
					console.log('AAA Извлекаем данные из базы на клиенте ', peer.id);
					
					var tx = db.transaction(storeName, "readonly");
					var store = tx.objectStore(storeName);
					var index = store.index(indexName);
					var requestDB = index.get(data.hashValue);
					var segmentsDBItem;
					
					requestDB.onsuccess = function(event) {
						segmentsDBItem = requestDB.result;
						if (segmentsDBItem)
						{
							//console.log('AAA -->> есть данные в БД ', segmentsDBItem);
							var dataSegment = new Uint8Array(segmentsDBItem.data);
							
							// Возвращаем ответ:
							var peerId = targetConnection.peer;
							var conns = peer.connections[peerId];
							var conn = conns[conns.length-1];
							var dataResponse = {
									type: 'response',
									id: data.id,
									hashValue: data.hashValue,
									clientID: peer.id,
									data: dataSegment
								};
							if (conn.label === 'data') {
								conn.send(dataResponse);
							}
							
						}
					}
					
					requestDB.onerror = function(event) {
						console.log('AAA requestDB error ', event);
					}
				}
			});
			
			targetConnection.on('close', function() {
				console.log('AAA -->>-- targetConnection.close ====>>> ', targetConnection);
			});
		}
		
	}
	
	/*
		Public
	*/
	return {
		initData: initData,
		getSegment: getSegment
	};
	
})();
