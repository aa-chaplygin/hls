<?php

	sleep(1);
	
	$peer_id = $_POST['id'];
	$hashes = $_POST['hashes'];

	// Redis
	try {
		$redis = new Redis(); 
		$redis->connect('localhost', 6379); 
		echo "Connection to server sucessfully";
	}
	catch (RedisException $e) {
		die("Ошибка подключения к Redis ".$e);
	}
	
	// Дробавляем запись об информация по каждому пиру
	$peer_id_exist = $redis->exists($peer_id);
	if (!$peer_id_exist)
	{
		$redis->hmset('user:'.$peer_id, array(
			'age' => 25,
			'country' => 'finland',
		));
	}
	
	// Дробавляем запись о хешах пользователя
	foreach ($hashes as $hash) {
		$redis->sadd('hash:'.$hash , $peer_id);
	}
	$data = $redis->smembers('hash:'.'8014b59ef499b499fdd501528d25cada');
	var_dump($data);
	
	
	//$redis->exists('message')
	
	$redis->save();
	$redis -> close();
 ?>
