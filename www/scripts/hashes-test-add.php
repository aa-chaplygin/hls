<?php

	header("Access-Control-Allow-Origin: *");
	sleep(1);
	
	$peer_id = $_POST['id'];
	$hash = $_POST['hash'];

	// Redis
	try {
		$redis = new Redis(); 
		$redis->connect('localhost', 6379); 
		echo "Connection to server sucessfully";
	}
	catch (RedisException $e) {
		die("Ошибка подключения к Redis ".$e);
	}
	
	// Дробавляем запись о хеше пользователя
	//if ($redis->exists('hash:'.$hash))
	$redis->sadd('hash:'.$hash , $peer_id);
	$data = $redis->smembers('hash:'.$hash);
	var_dump($data);
	
	
	$redis->save();
	$redis -> close();
 ?>
