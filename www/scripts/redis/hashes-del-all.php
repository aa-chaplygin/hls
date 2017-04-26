<?php
	
	// Redis
	try {
		$redis = new Redis(); 
		$redis->connect('localhost', 6379); 
		echo "Connection to server sucessfully";
	}
	catch (RedisException $e) {
		die("Ошибка подключения к Redis ".$e);
	}
	
	$all_data = $redis->keys('*');
	foreach ($all_data as $data) {
		$redis->del($data);
	}
	
	$redis->save();
	$redis -> close();
 ?>
