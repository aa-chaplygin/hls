<?php

	header("Access-Control-Allow-Origin: *");
	sleep(1);
	
	$hash = $_POST['hash'];

	// Подключаемся к Redis
	require 'redis-connect.php';
	
	$data = $redis->smembers('hash:'.$hash);
	
	$redis->save();
	$redis -> close();
	
	echo json_encode($data);
 ?>
