<?php
	
	// Подключаемся к Redis
	require 'redis-connect.php';
	
	echo "users list: \n";
	$users_data = $redis->keys('user:*');
	foreach ($users_data as $user) {
		echo $user . "\n";
	}
	echo "\n";
	
	$redis -> close();
	
 ?>
