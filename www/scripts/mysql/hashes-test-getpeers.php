<?php

	header("Access-Control-Allow-Origin: *");
	
	$hash = $_POST['hash'];
	
	// Подключаемся к БД
	require 'db-connect.php';
	
	$result = mysqli_query($LINK, "SELECT peer FROM hashes WHERE (id = '".$hash."') ");
	
	$data = array();
	while ($row = mysqli_fetch_assoc($result)) {
		array_push($data, $row['peer']);
	}
	
	mysqli_close($LINK);
	
	echo json_encode($data);
?>
