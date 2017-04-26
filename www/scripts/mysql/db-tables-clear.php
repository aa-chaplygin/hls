<?php

	header("Access-Control-Allow-Origin: *");

	// Подключаемся к БД
	
	$HOST = "localhost";
	$USER = "root";
	$PASS = "";
	$DB = "db_hashes";
	
	/*
	$HOST = "localhost";
	$USER = "u872743087_user";
	$PASS = "dbpass";
	$DB = "u872743087_db";
	*/
	
	$LINK = mysqli_connect($HOST, $USER, $PASS, $DB);

	$result = mysqli_query($LINK, "DELETE FROM users");
	$result = mysqli_query($LINK, "DELETE FROM hashes");

	mysqli_close($LINK);

?>
