<?php

	header("Access-Control-Allow-Origin: *");
	
	$peer_id = $_POST['id'];
	$hash = $_POST['hash'];

	
	// Дробавляем запись о хеше пользователя
	$str = file_get_contents("hashes.dat");
	$hashes_data = json_decode($str, true);
	
	if (!array_key_exists ($hash, $hashes_data))
	{
		$hashes_data[$hash] = array();
	}
	array_push($hashes_data[$hash], $peer_id);
	
	$hashes_data_new = json_encode($hashes_data);
	$fd = fopen("hashes.dat", 'w') or die("не удалось открыть файл");
	fwrite($fd, $hashes_data_new);
	fclose($fd);
	
 ?>
