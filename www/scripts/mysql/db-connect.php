<?php
	
	// Подключаемся к серверу, 
	if ($_SERVER ["HTTP_HOST"] == 'hls.dev') {
		$HOST = "localhost";
		$USER = "root";
		$PASS = "";
		$DB = "db_hashes";
	} else {
		//$HOST = "mysql.hostinger.com.ua";
		$HOST = "localhost";
		$USER = "u872743087_user";
		$PASS = "dbpass";
		$DB = "u872743087_db";
	}
	
	$LINK = mysqli_connect($HOST, $USER, $PASS, $DB);
	
?>
