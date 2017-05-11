<?php

	/*
	$host = 'localhost'; //host
	$port = '8000'; //port
	$null = NULL; //null var

	
	//Create TCP/IP sream socket
	$socket = socket_create(AF_INET, SOCK_STREAM, SOL_TCP); //создаём сокет
	//reuseable port
	socket_set_option($socket, SOL_SOCKET, SO_REUSEADDR, 1); //разрешаем использовать один порт для нескольких соединений
	//bind socket to specified host
	socket_bind($socket, '127.0.0.1', $port); //привязываем его к указанным ip и порту
	
	//listen to port
	socket_listen($socket); //слушаем сокет
	* 
	*/

	if(extension_loaded('sockets')) echo "WebSockets OK";
	else echo "WebSockets UNAVAILABLE";

	$socket = stream_socket_server("tcp://127.0.0.1:8000", $errno, $errstr);
	
	if (!$socket) {
		die("$errstr ($errno)\n");
	}
	
	//create & add listning socket to the list
	//$clients = array($socket);
	
	$connects = array();
	/*
	while (true) {
		//формируем массив прослушиваемых сокетов:
		$read = $connects;
		$read[] = $socket;
		$write = $except = null;

		if (!stream_select($read, $write, $except, null)) {//ожидаем сокеты доступные для чтения (без таймаута)
			break;
		}

		if (in_array($socket, $read)) {//есть новое соединение
			$connect = stream_socket_accept($socket, -1);//принимаем новое соединение
			$connects[] = $connect;//добавляем его в список необходимых для обработки
			unset($read[ array_search($socket, $read) ]);
		}

		foreach($read as $connect) {//обрабатываем все соединения
			$headers = '';
			while ($buffer = rtrim(fgets($connect))) {
				$headers .= $buffer;
			}
			fwrite($connect, "HTTP/1.1 200 OK\r\nContent-Type: text/html\r\nConnection: close\r\n\r\nПривет");
			fclose($connect);
			unset($connects[ array_search($connect, $connects) ]);
		}
		
	}
	
	fclose($server);
	*/

	//var_dump($socket);
	
?>
