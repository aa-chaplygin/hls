<?php

	header("Access-Control-Allow-Origin: *");
	
	$peer_id = $_POST['id'];
	$hash = $_POST['hash'];

	// Подключаемся к БД
	require 'db-connect.php';
	
	// Дробавляем запись о хеше пользователя
	$query = mysqli_query($LINK, "INSERT INTO hashes (id, peer) VALUES ('".$hash."', '".$peer_id."')");
	
	mysqli_close($LINK);
	
 ?>
