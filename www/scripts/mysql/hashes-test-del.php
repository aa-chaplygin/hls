<?php

	header("Access-Control-Allow-Origin: *");
	
	$peer_id = $_POST['id'];
	
	// Подключаемся к БД
	require 'db-connect.php';
	
	// Удаление peer_id
	$result = mysqli_query($LINK, "DELETE FROM users WHERE id = '".$peer_id."'");
	$result = mysqli_query($LINK, "DELETE FROM hashes WHERE peer = '".$peer_id."'");
	
	mysqli_close($LINK);
	
 ?>
