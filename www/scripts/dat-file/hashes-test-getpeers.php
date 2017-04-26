<?php

	header("Access-Control-Allow-Origin: *");
	
	$hash = $_POST['hash'];
	
	$str = file_get_contents("hashes.dat");
	$hashes_data = json_decode($str, true);
	
	$data = $hashes_data[$hash];
	
	echo json_encode($data);
 ?>
