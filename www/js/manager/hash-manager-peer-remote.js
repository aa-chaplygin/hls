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
		myAPIKey = 'lwjd5qra8257b9',
		localClientID,
		remoteClientID;


	function initData(data)
	{
		console.log('AAA MMM segmentsData = ', data);
		segmentsData = data.segmentsData;
		type = data.type;
		connectDB();
		initPeer();
	}
	
	function connectDB()
	{
		console.log('AAA Открываем базу данных:');
		
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
			}
		};
	}
	
	var iii = 0;
	function getSegment(hashValue, callback)
	{
		console.log('AAA MMM getSegment = ', hashValue);
		
		// Не запрашиваем через пиринг стартовые сегменты: 
		if (hashValue != '61c85e432083be705ff75a2b10fcd213' && hashValue != '8014b59ef499b499fdd501528d25cada')
		{
			iii++;
			
			// Определяем peerID клиента с данными хеша:
			//var requestedPeer = remoteClientID;
			// Для эмуляции запоса к отключенному клиенту с id=545454
			var requestedPeer = (iii == 1) ? '545454' : remoteClientID;
			
			console.log('AAA --->>> Peer Устанавливаем соединение c ', requestedPeer, ' seg = ', hashValue);
					
			getDataFromPeer(requestedPeer, hashValue,
				function(dataResponse){
						console.log('AAA getHashFromPeer success');
						
						// Сохраняем данные в базе
						var tx = db.transaction("segments", "readwrite");
						var store = tx.objectStore("segments");
						var requestAddSegment = store.put({hash:hashValue, data: dataResponse});
						requestAddSegment.onsuccess= function(){
							console.log('AAA Данные сегмента сохранились');
							// Отправляем инфу о сегменте на сервер:
							addHashClientData(localClientID, hashValue);
						}
						requestAddSegment.onerror= function(){
							console.log('AAA Во время сохранения данных произошла ошибка');
						}
					   
						if ($.isFunction(callback))
						{
							var dataSegment = new Uint8Array(dataResponse);
							callback(dataSegment);
						}
					},
				function(){
						console.log('AAA getHashFromPeer error');
						getSegment(hashValue, callback);
					}
			);
			
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
					console.log('AAA есть данные в локальной БД ', segmentsDBItem);
					if ($.isFunction(callback))
					{
						var dataSegment = new Uint8Array(segmentsDBItem.data);
						callback(dataSegment);
					}
				}
				else
				{
					console.log('AAA нет данных в БД, делаем запрос на сервер');

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
									// Отправляем инфу о сегменте на сервер:
									addHashClientData(localClientID, hashValue);
								}
								requestAddSegment.onerror= function(){
									//console.log('AAA Во время сохранения данных произошла ошибка');
								}

								if ($.isFunction(callback))
								{
									var dataSegment = new Uint8Array(xhr.response);
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
	
	function getDataFromPeer(requestedPeer, hashValue, successCallback, errorCallback)
	{
		// Соединение для передачи данных.
		var dataConnection = peer.connect(requestedPeer, {
			label: 'data',
			reliable: true
		});

		dataConnection.on('open', function() {
			console.log('AAA dataConnection.open ', this);
			var thisConnection = this;

			// Отправляем данные
			var peerId = thisConnection.peer;
			console.log('AAA dataConnection.open peerId: ', peerId, ' connectionID: ', thisConnection.id);
			var conns = peer.connections[peerId];
			var conn = _.find(conns, function(c){ return c.id == thisConnection.id; });

			var dataRequest = {
					type: 'request',
					//connectionID: thisConnection.id,
					hashValue: hashValue,
					clientID: peer.id
				};
			if (conn.label === 'data') {
				conn.send(dataRequest);
			}

		});

		dataConnection.on('data', function(data) {
			if (data.type == 'response')
			{
				var thisConnection = this;
				console.log('AAA получили ответ от id: ', data.clientID, '  ', thisConnection.id,' на hashValue: ', data.hashValue);
				console.log('AAA peer.connections: --> ', peer.connections);

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

		dataConnection.on('disconnected', function(err) {
			console.log('AAA dataConnection.disconnected ');
		});

		dataConnection.on('close', function() {
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
		
		peer.on('error', function(err) {
			if ($.isFunction(errorCallback))
			{
				errorCallback();
			}
		});
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
		
		// Контроль за локальным кешем (indexedDB)
		
		// Определяем размер сегментов (общий и средний) в indexedDB:
		var size = 0;
		var count = 0;
		var meanSegmentSize;
		var getAllHashesSegmentsSize = db.transaction(storeName).objectStore(storeName).openCursor();
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
					$.ajax("/scripts/test-segments-free.php",{
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
	
	// Отправка данных о всех хешах клиента в indexedDB:
	function sendAllHashesClientData(clientPeerId, hashesValues)
	{
		console.log('AAA Отправляем даные на сервер об имеющихся ключах в локальной indexedDB: ', clientPeerId, '  ', hashesValues.length);
	}
	
	// Отправка данных о добавленном хеше в indexedDB:
	function addHashClientData(clientPeerId, hashValue)
	{
		console.log('AAA Отправляем даные на сервер о добавленном ключе в локальной indexedDB: ', clientPeerId, '  ', hashValue);
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
