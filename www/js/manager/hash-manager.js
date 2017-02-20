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
		fieldName	= "hash";
	
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
	
	function initData(data)
	{
		console.log('AAA MMM segmentsData = ', data);
		segmentsData = data.segmentsData;
		type = data.type;
		connectDB();
	}
	
	function getSegment(hashValue, callback)
	{
		console.log('AAA MMM getSegment = ', hashValue);

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
						if (xhr.readyState == xhr.DONE /*&& xhr.status == 200 && xhr.response != null*/) { // wait for video to load
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
	
	/*
	function isFunction(functionToCheck) {
		var getType = {};
		return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
	}
	*/
	
	/*
		Public
	*/
	return {
		initData: initData,
		getSegment: getSegment
	};
	
})();
