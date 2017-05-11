<?php

	header("Access-Control-Allow-Origin: *");
	sleep(1);
	
	$peer_id = $_POST['id'];

	// Подключаемся к Redis
	require 'redis-connect.php';
	
	// Удаление peer_id
	$redis->delete('user:'.$peer_id);

	// Поиск ключей данных hash и удаление из них peer_id
	$all_hashes = $redis->keys('hash:*');
	foreach ($all_hashes as $hash) {
		$redis->srem($hash, $peer_id);
	}
	
	$redis->save();
	$redis -> close();
 ?>
