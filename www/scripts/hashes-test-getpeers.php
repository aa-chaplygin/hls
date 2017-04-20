<?php

	sleep(1);
	
	$hash = $_POST['hash'];

	// Redis
	try {
		$redis = new Redis(); 
		$redis->connect('localhost', 6379); 
	}
	catch (RedisException $e) {
		die("Ошибка подключения к Redis ".$e);
	}
	
	$data = $redis->smembers('hash:'.$hash);
	
	$redis->save();
	$redis -> close();
	
	echo json_encode($data);
 ?>
