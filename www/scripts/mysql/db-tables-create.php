<?php

// Подключаемся к серверу, 
$HOST = "localhost";				// имя сервера
$USER = "root";						// пользователь базы данных MySQL 
$PASS = "";							// пароль для доступа к серверу MySQL 
$DB = "db_hashes";				// название создаваемой базы данных


if(!mysql_connect("$HOST", "$USER", "$PASS")) exit(mysql_error());
else {echo "";}

$r = mysql_query("CREATE DATABASE $DB");
if(!$r)exit(mysql_error());

if (!mysql_select_db($DB)) exit(mysql_error());
else{echo "";}

// устанавливаем кодировку    
mysql_query("SET NAMES 'utf8';"); 
echo "База данных успешно создана.";



$LINK = mysql_connect($HOST, $USER, $PASS);
mysql_select_db($DB, $LINK);

$sql = "CREATE TABLE users (id VARCHAR(16) PRIMARY KEY , age INT(2), country VARCHAR(20))";

if (mysql_query($sql))
	echo "Создание таблицы завершено";
else
	echo "таблица не создана";

$sql = "CREATE TABLE hashes (id VARCHAR(32) , peer VARCHAR(16))";

if (mysql_query($sql))
	echo "Создание таблицы завершено";
else
	echo "таблица не создана";

?>
