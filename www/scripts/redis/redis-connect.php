<?php

	// Redis
	try {
		$redis = new Redis(); 
		$redis->connect('localhost', 6379); 
		echo "Connection to server sucessfully \n";
	}
	catch (RedisException $e) {
		die("Ошибка подключения к Redis ".$e);
	}
	
 ?>
