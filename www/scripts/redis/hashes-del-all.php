<?php
	
	// Подключаемся к Redis
	require 'redis-connect.php';
	
	$users_data = $redis->keys('user:*');
	foreach ($users_data as $user) {
		$redis->del($user);
	}
	
	$hashes_data = $redis->keys('hash:*');
	foreach ($hashes_data as $hash) {
		$redis->del($hash);
	}
	
	/*
	$all_data = $redis->keys('*');
	foreach ($all_data as $data) {
		$redis->del($data);
	}
	*/
	
	$redis->save();
	$redis -> close();
 ?>
