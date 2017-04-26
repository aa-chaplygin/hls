<?php

	header("Access-Control-Allow-Origin: *");
	sleep(1);
	
	$peer_id = $_POST['id'];

	// Redis
	try {
		$redis = new Redis(); 
		$redis->connect('localhost', 6379); 
		echo "Connection to server sucessfully";
	}
	catch (RedisException $e) {
		die("Ошибка подключения к Redis ".$e);
	}
	
	// Удаление peer_id
	$redis->delete('user:'.$peer_id);

	// Поиск ключей данных hash и удаление из них peer_id
	$allHashes = $redis->keys('hash:*');
	foreach ($allHashes as $hash) {
		$redis->srem($hash, $peer_id);
	}
	
	$redis->save();
	$redis -> close();
 ?>
