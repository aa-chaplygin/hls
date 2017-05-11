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
		indexedHashesKeys,
		limitSize = 20000000,
	
		peer,
		//myAPIKey = 'lwjd5qra8257b9',
		//myAPIKey = 'x7fwx2kavpy6tj4i',
		myAPIKey = 'nemmvtgx9kzc9pb9',
		waitPeerDataTime = 2000,
		localClientID,
		remoteClientID;


	var 
		//redisServerPrefix = 'http://redis.crisp.dev.fs.ai/scripts/redis/';
		redisServerPrefix = '/scripts/redis/';
		//redisServerPrefix = '/scripts/dat-file/';
		//redisServerPrefix = '/scripts/mysql/';

	function initData(data)
	{
		console.log('AAA MMM initData data: ', data);
		segmentsData = data.segmentsData;
		type = data.type;
		connectDB();
		initPeer();
	}
	
	function connectDB()
	{
		var indexDBRequest = indexedDB.open(baseName, 1);
		
		indexDBRequest.onupgradeneeded = function (event) {
			console.log('AAA MMM connectDB Базы ранее не существовало ');
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
			console.log('AAA MMM connectDB Подключились к существующей БД ', managerItem);
			db = event.target.result;
			$window.trigger('Manager:connect', {type: 'success'});
			
			var getAllHashesKeys = db.transaction(storeName, "readonly").objectStore(storeName).getAllKeys();
			getAllHashesKeys.onsuccess = function(event) {
				indexedHashesKeys = getAllHashesKeys.result;
				// Отправляем даные на сервер об имеющихся ключах в локальной indexedDB
				if (localClientID)
				{
					sendClientDataHashes();
				}
			}
			
		};
		indexDBRequest.onerror = function(event) {
			//console.log('AAA DB Подключиться к БД не удалось, обрабатываем ошибку');
			$window.trigger('Manager:connect', {type: 'error'});
		}
	}
	
	function initPeer()
	{
		// Регистрируем свой peer
		peer = new Peer({key: myAPIKey});

		// Показываем свой ID.
		peer.on('open', function(id){
			console.log('AAA peer.open id: ', id);
			localClientID = id;
			remoteClientID = window.WebRTC_GLOBALS.remote_id;
			// Выводим инфу о своём peerId и ссылкой на себя:
			$('#pid').text(localClientID);
			$('#lid').show().attr('href', $('#lid').attr('href') + '?peer=' + localClientID);
			// Отправляем даные на сервер об имеющихся ключах в локальной indexedDB
			if (indexedHashesKeys)
			{
				sendClientDataHashes();
			}
		});

		// Await connections from others
		peer.on('connection', connect);

		peer.on('error', function(err) {
			console.log('AAA peer.error type:', err.type, '   message:', err.message);
		});
		
		peer.on('disconnected', function() {
			//console.log('AAA peer.disconnected ');
		});
		
		// Make sure things clean up properly.
		window.onunload = window.onbeforeunload = function(e) {
			//console.log('AAA window.onunload window.onbeforeunload');
			if (!!peer && !peer.destroyed) {
				peer.destroy();
				$.ajax(redisServerPrefix +"hashes-test-del.php",{
					type: "POST",
					data: {id: localClientID},
					success: function() {},
					error : function() {}
				});
			}
		};
	}
	
	function getSegment(hashValue, callback, getFromPeer)
	{
		
		getFromPeer = (typeof(getFromPeer) !== 'undefined') ?  getFromPeer : true;
		console.log('AAA MMM getSegment: ', hashValue, ' getFromPeer: ', getFromPeer);
		
		// 1. Пытаемся отыскать данные в локальной БД:
		console.log('AAA Извлекаем данные из базы: ', db.name);
		getDataDB(hashValue,
			function(segmentsDBItem){
				console.log('AAA есть данные в локальной БД ', segmentsDBItem);
				if ($.isFunction(callback))
				{
					var dataSegment = new Uint8Array(segmentsDBItem.data);
					callback(dataSegment);
				}
			},
			function(){
				// Для стартовых сегментов не делаем запрос пиринга, а запрасываем их с сервера:
				if (!getFromPeer)
				{
					console.log('AAA Для стартового сегмента делаем запрос на сервер');
					requestDataFromServer(hashValue, callback);
				}
				// 2. Определяем peerId с запрашиваемым хеш-сегментом, в случае такогового запрашиваем данные через пиринг:
				else
				{
					console.log('AAA нет данных в БД, делаем запрос на пиринг');
					if (remoteClientID == 'remote')
					{
						console.log('AAA Определяем список peerId клиентов с заданным хешем ', hashValue);
						$.ajax(redisServerPrefix + "hashes-test-getpeers.php",{
							type: "POST",
							data: {hash: hashValue},
							success: function(data) {
								var peers = JSON.parse(data);
								console.log('AAA get peers success !!! : ', peers);
								if (peers.length>0)
								{
									// Определяем peerID клиента с данными хеша:
									var requestedPeer = peers[0];

									// 3. Запрашиваем хеш через пиринг:
									requestDataFromPeer(requestedPeer, hashValue, callback, function callbackErr(){
										console.log('AAA requestDataFromPeer error');
										peers.splice(0, 1);
										if(peers.length > 0)
										{
											// запрашиваем у другого пира:
											console.log('AAA --->>> Запрашиваем у пира: ', peers[0], ' seg = ', hashValue);
											requestDataFromPeer(peers[0], hashValue, callback, callbackErr);
										}
										else
										{
											console.log('AAA закончились данные для пиринга, делаем запрос на сервер');
											requestDataFromServer(hashValue, callback);
										}
									});
								}
								else
								{
									console.log('AAA нет данных для пиринга, делаем запрос на сервер');
									requestDataFromServer(hashValue, callback);
								}

							},
							error : function() {
								console.log('AAA нет данных для пиринга, делаем запрос на сервер');
								requestDataFromServer(hashValue, callback);
							}
						});
					}
					else
					{
						console.log('AAA Запрашиваем хеш через пиринг у клиента с id: ', remoteClientID);
						var requestedPeer = remoteClientID;
						
						// 3. Запрашиваем хеш через пиринг:
						requestDataFromPeer(requestedPeer, hashValue, callback, function callbackErr(){
							console.log('AAA requestDataFromPeer error');
							console.log('AAA делаем запрос на сервер');
							requestDataFromServer(hashValue, callback);
						});
					}
				}
			}
		);
	}
	
	// Получение данных из indexedDB:
	function getDataDB(hashValue, successCallback, errorCallback)
	{
		var
			tx = db.transaction(storeName, "readonly"),
			store = tx.objectStore(storeName),
			index = store.index(indexName),
			requestDB = index.get(hashValue),
			segmentsDBItem;
	
		requestDB.onsuccess = function(event) {
			segmentsDBItem = requestDB.result;
			if (segmentsDBItem)
			{
				if ($.isFunction(successCallback))
				{
					successCallback(segmentsDBItem);
				}
			}
			else
			{
				if ($.isFunction(errorCallback))
				{
					errorCallback();
				}
			}
			
		}
		
		requestDB.onerror = function(event) {
			if ($.isFunction(errorCallback))
			{
				console.log('AAA requestDB error ', event);
				errorCallback();
			}
		}
	}
	
	// Сохранение данных в indexedDB:
	function saveDataDB(hashValue, dataResponse, successCallback, errorCallback)
	{
		// Сохраняем данные в базе
		var
			tx = db.transaction(storeName, "readwrite"),
			store = tx.objectStore(storeName),
			requestAddSegment = store.put({hash:hashValue, data: dataResponse});
	
		requestAddSegment.onsuccess= function(){
			if ($.isFunction(successCallback))
			{
				console.log('AAA Данные сегмента сохранились');
				successCallback();
			}
		}
		requestAddSegment.onerror= function(){
			if ($.isFunction(errorCallback))
			{
				console.log('AAA Во время сохранения данных произошла ошибка');
				errorCallback();
			}
		}
	}

	// Удаление из indexedDB пары ключ-значение
	function deleteHashClientData(hashes)
	{
		console.log('AAA deleteHashClientData: ', hashes);
		var tx = db.transaction(storeName, "readwrite");
		hashes.forEach(function(hashValue) {
			tx.objectStore(storeName).delete(hashValue);
		});
		
		// Составляем и отправляем на сервер новый обновленный список сегментов, имеющихся у клиента
		var getAllHashesKeys = db.transaction(storeName, "readonly").objectStore(storeName).getAllKeys();
		getAllHashesKeys.onsuccess = function(event) {
			sendAllHashesClientData(localClientID, getAllHashesKeys.result);
		}
		
	}

	// Запрос данных от пиринга
	function requestDataFromPeer(requestedPeer, hashValue, callback, callbackError)
	{
		getDataFromPeer(requestedPeer, hashValue,
			function(dataResponse){
				saveDataDB(hashValue, dataResponse,
					function(){
						// Отправляем инфу о сегменте на сервер:
						addHashClientData(localClientID, hashValue);
					},
					function(){}
				);

				if ($.isFunction(callback))
				{
					var dataSegment = new Uint8Array(dataResponse);
					callback(dataSegment);
				}
			},
			function(){
				if ($.isFunction(callbackError))
				{
					callbackError();
				}
			}
		);
	}
	
	// Получение данных от пиринга
	function getDataFromPeer(requestedPeer, hashValue, successCallback, errorCallback)
	{
		var dataReceived = false;
		
		// Соединение для передачи данных.
		var dataConnection = peer.connect(requestedPeer, {
			label: 'data',
		});
		
		setTimeout(function(){
			if (!dataReceived)
			{
				console.log('AAA dataConnection setTimeout error');
				if ($.isFunction(errorCallback))
				{
					errorCallback();
				}
			}
		}, waitPeerDataTime);

		dataConnection.on('data', function(data) {
			console.log('AAA dataConnection.on data');
			dataReceived = true;
			
			if (data.type == 'response')
			{
				var thisConnection = this;
				console.log('AAA получили ответ от id: ', data.clientID, ' на hashValue: ', data.hashValue);
				//console.log('AAA peer.connections: --> ', peer.connections);

				// Закрываем соединение
				var peerId = data.clientID;
				var conns = peer.connections[peerId];
				var conn = _.find(conns, function(c){ return c.id == thisConnection.id; });
				console.log('AAA Закрываем соединение: ', conn);
				conn.close();

				var dataResponse = data.data;
				if ($.isFunction(successCallback))
				{
					successCallback(dataResponse);
				}
			}
		});

		dataConnection.on('close', function() {
			console.log('AAA dataConnection.on close');
			//console.log('AAA dataConnection.close ', this.peer,'', this.id);

			// Удаляем подключение если в нем нет открытых соединений
			var peerConnections = peer.connections[this.peer];
			//console.log('AAA peerConnections 111 = ', peerConnections);

			var isOpenPresent = false;

			_.each(peerConnections, function(c,i){
				if (c.open)
				{
					isOpenPresent = true;
				}
			});

			//console.log('AAA isOpenPresent = ', isOpenPresent);
			if (!isOpenPresent)
			{
				//console.log('AAA Удаляем подключение = ');
				delete peer.connections[this.peer];
			}
			//console.log('AAA peerConnections 222 = ', peer.connections);
		});

		dataConnection.on('open', function() {
			console.log('AAA dataConnection.on open');

			// Отправляем данные
			var thisConnection = this;
			var peerId = thisConnection.peer;
			var conns = peer.connections[peerId];
			var conn = _.find(conns, function(c){ return c.id == thisConnection.id; });

			console.log('AAA conn: ', conn);
			console.log('AAA dataConnection.open peerId: ', peerId, ' connectionID: ', thisConnection.id);

			var dataRequest = {
					type: 'request',
					//connectionID: thisConnection.id,
					hashValue: hashValue,
					clientID: peer.id
				};
			if (conn.label == 'data') {
				console.log('AAA отправляем данные dataRequest = ', dataRequest);
				conn.send(dataRequest);
			}

		});

		dataConnection.on('disconnected', function(err) {
			console.log('AAA dataConnection on disconnected ');
		});

		peer.on('error', function(err) {
			console.log('AAA dataConnection.on error');
			if ($.isFunction(errorCallback))
			{
				errorCallback();
			}
		});
		
	}
	
	// Запрос данных с сервера
	function requestDataFromServer(hashValue, callback)
	{
		getDataFromServer(hashValue,
			function(dataResponse){

				saveDataDB(hashValue, dataResponse,
					function(){
						// Отправляем инфу о сегменте на сервер:
						if (localClientID)
						{
							addHashClientData(localClientID, hashValue);
						}
						else
						{
							var inter = setInterval(function(){
								if (localClientID)
								{
									addHashClientData(localClientID, hashValue);
									clearInterval(inter);
								}
							}, 10);
						}

					},
					function(){}
				);

				if ($.isFunction(callback))
				{
					var dataSegment = new Uint8Array(dataResponse);
					callback(dataSegment);
				}

			}
		);
	}
	
	// Получение данных с сервера
	function getDataFromServer(hashValue, successCallback)
	{
		console.log('AAA getDataFromServer ', hashValue);
		
		var
			url,
			segmentItem,
			range,
			urlTemplate;
		
		if (type == 'mpd') // type == 'range'
		{
			segmentItem = _.find(segmentsData.segments, function(item){ return item.h == hashValue; });
			url = (segmentItem.t == 'v') ? segmentsData.file : segmentsData.fileAudio;
			range = segmentItem.r;
		}
		else // type == 'm4s'
		{
			segmentItem = _.find(segmentsData.segments, function(item){ return item.h == hashValue; });

			if (segmentItem.i == 'i')
			{
				url = (segmentItem.t == 'v') ? segmentsData.fileVideoInit : segmentsData.fileAudioInit;
			}
			else
			{
				urlTemplate = (segmentItem.t == 'v') ? segmentsData.fileVideo : segmentsData.fileAudio;
				url = urlTemplate.replace("$Number$", segmentItem.i);
			}
		}

		if (segmentItem.r || url) {

			var xhr = new XMLHttpRequest();
			xhr.open('GET', url);
			xhr.responseType = 'arraybuffer';
			if (type == 'mpd')
			{
				// Set the desired range of bytes we want from the mp4 video file
				xhr.setRequestHeader("Range", "bytes=" + range);
			}
			xhr.send();
			xhr.addEventListener("readystatechange", function () {
				if (xhr.readyState == xhr.DONE && xhr.response != null /*&& xhr.status == 200*/) { // wait for video data to load
					if ($.isFunction(successCallback))
					{
						successCallback(xhr.response);
					}
				}
			}, false);
		}
	}
	
	// Handle a connection object.
	function connect(targetConnection) {
		console.clear();
		console.log('AAA -->>-- targetConnection: ', targetConnection);
		console.log('AAA -->>-- targetConnection peer:  ', peer.connections);
		
		// Handle a chat connection.
		if (targetConnection.label == 'data') {
			
			targetConnection.on('open', function(){
				console.log('AAA -->>--  targetConnection.open');
			});
			
			targetConnection.on('data', function(data) {
				console.log('AAA -->>-- targetConnection data = ', data);
				if (data.type == 'request')
				{
					var thisConnection = this;

					console.log('AAA получили запрос ', thisConnection.id, ' от ', data.clientID, ' на hashValue: ', data.hashValue);
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
							//var dataSegment = new Uint8Array(segmentsDBItem.data);
							var dataSegment = segmentsDBItem.data;

							// Возвращаем ответ:
							console.log('AAA Возвращаем ответ по соединению: ', thisConnection.id);
							var peerId = targetConnection.peer;
							var conns = peer.connections[peerId];
							var conn = _.find(conns, function(c){ return c.id == thisConnection.id; });
							var dataResponse = {
									type: 'response',
									//connectionID: data.connectionID,
									hashValue: data.hashValue,
									clientID: peer.id,
									data: dataSegment
								};
							if (conn.label == 'data') {
								conn.send(dataResponse);
							}

						}
					}

					requestDB.onerror = function(event) {
						console.log('AAA requestDB error ', event);
					}
				}
			});

			targetConnection.on('error', function(err) {
				console.log('AAA targetConnection.error ', err);
			});

			targetConnection.on('close', function() {
				console.log('AAA targetConnection.close ', this);
			});
			
		}
		
	}
	
	// Send client data segments hashes keys
	function sendClientDataHashes()
	{
		// Отправляем даные на сервер об имеющихся ключах в локальной indexedDB:
		sendAllHashesClientData(localClientID, indexedHashesKeys);
		
		// временно отключим контроль размера кеша
		if (false) {
		// Контроль за размером локального хранилища (indexedDB)
		var
			size = 0,			// общий размер сегментов в indexedDB
			count = 0,			// количество сегментов
			meanSegmentSize,	// средний размер одного сегмента 
			getAllHashesSegmentsSize = db.transaction(storeName).objectStore(storeName).openCursor();
		
		getAllHashesSegmentsSize.onsuccess = function(event){
			var cursor = event.target.result;
			if (cursor) {
				count++;
				size += cursor.value.data.byteLength;
				cursor.continue();
			}
			else {
				meanSegmentSize = Math.round(size/count);
				console.log("AAA indexedDB: Total size is ", bytesToSize(size), " Total count is ", count, " mean value: ", bytesToSize(meanSegmentSize));
				// 1. определяем есть ли необходимость освобождения памяти в indexedDB.
				if (size > limitSize)
				{
					console.log('AAA размер кеша превышен, требуется очистка данных ');
					// 2. определяем коли-во сегментов которое нужно освободить и отправляем эту инфу на сервер:
					var segmentsToFreeCount = Math.ceil((size-limitSize)/meanSegmentSize);
					console.log('AAA localClientID: ', localClientID, ' segmentsToFreeCount = ', segmentsToFreeCount);
					// 3. от сервера получаем номера сегментов для удаления
					$.ajax(redisServerPrefix + "hashes-test-free.php",{
						type: "GET",
						dataType: "json",
						data: {id: localClientID, remote: remoteClientID, count: segmentsToFreeCount},
						success: function(hashesToDelete) {
							console.log('AAA hashesToDelete: ', hashesToDelete);
							// 4. Удаление сегментов из indexedDB:
							if (hashesToDelete.length)
							{
								deleteHashClientData(hashesToDelete);
							}
						},
						error : function() {}
					});
				}
			}
        }
		}
	}
	
	// Отправка данных о всех хешах клиента в indexedDB:
	function sendAllHashesClientData(clientPeerId, hashesValues)
	{
		console.log('AAA Отправляем даные на сервер об имеющихся ключах в локальной indexedDB: ', clientPeerId, '  ', hashesValues.length);
		$.ajax(redisServerPrefix + "hashes-test-send.php",{
			type: "POST",
			data: {id: clientPeerId, hashes: hashesValues},
			success: function() {},
			error : function() {}
		});
	}
	
	// Отправка данных о добавленном хеше в indexedDB:
	function addHashClientData(clientPeerId, hashValue)
	{
		console.log('AAA Отправляем даные на сервер о добавленном ключе в локальной indexedDB: ', clientPeerId, '  ', hashValue);
		$.ajax(redisServerPrefix + "hashes-test-add.php",{
			type: "POST",
			data: {id: clientPeerId, hash: hashValue},
			success: function() {},
			error : function() {}
		});
	}
	
	// Вычисление HASH сегементов
	function hashGet(str) {
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
	
	// Convert size in bytes to KB, MB, GB
	function bytesToSize(bytes) {
		var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
		if (bytes == 0) return '0 Byte';
		var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
		return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
	};
	
	/*
		Public
	*/
	return {
		initData: initData,
		getSegment: getSegment
	};
	
})();
