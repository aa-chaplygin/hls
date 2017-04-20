<?php

	sleep(1);
	
	$peer_id = $_POST['id'];
	$hashes = (isset($_POST['hashes'])) ? $_POST['hashes'] : null;
	
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
	
	// Удаляем данные о пользователе в хешах (после освобождения хешей на клиенте):
	if ($peer_id_exist)
	{
		$all_hashes = $redis->keys('hash:*');
		foreach ($all_hashes as $hash) {
			$redis->srem($hash, $peer_id);
		}
	}
	
	// Дробавляем запись о хешах пользователя
	if (!is_null($hashes))
	{
		foreach ($hashes as $hash) {
			$redis->sadd('hash:'.$hash , $peer_id);
		}
	}
	
	
	
	//$data = $redis->smembers('hash:'.'8014b59ef499b499fdd501528d25cada');
	//$data = $redis->smembers('hash:'.'616b3679d8e1b8cd53de414e657fbed8');
	
	$data = $redis->keys('user:*');
	var_dump($data);
	
	
	// Удаление всех данных
	/*
	$all_data = $redis->keys('*');
	foreach ($all_data as $data) {
		$redis->del($data);
	}
	*/
	
	$redis->save();
	$redis -> close();
 ?>
