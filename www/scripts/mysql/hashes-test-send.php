<?php

	header("Access-Control-Allow-Origin: *");
	
	$peer_id = $_POST['id'];
	$hashes = (isset($_POST['hashes'])) ? $_POST['hashes'] : null;
	
	// Подключаемся к БД
	require 'db-connect.php';
	
	// Дробавляем запись об информация по каждому пиру
	$result = mysqli_query($LINK, "SELECT * FROM users WHERE id = '".$peer_id."'");
	$peer_id_exist = mysqli_num_rows($result) > 0;
	var_dump($peer_id_exist);
	if (!$peer_id_exist)
	{
		$sql = mysqli_query($LINK, "INSERT INTO users (id, age, country) VALUES ('".$peer_id."','25', 'finland')");
		if ($sql) {
			echo "<p>Данные успешно добавлены в таблицу.</p>";
		} else {
			echo "<p>Произошла ошибка.</p>";
		}
	}
	
	// Удаляем данные о пользователе в хешах (после освобождения хешей на клиенте):
	if ($peer_id_exist)
	{
		echo 'Удаляем данные';
		foreach ($hashes as $hash) {
			$query_del = mysqli_query($LINK, "DELETE FROM hashes WHERE (peer='".$peer_id."')");
		}
	}
	
	// Дробавляем запись о хешах пользователя
	if (!is_null($hashes))
	{
		foreach ($hashes as $hash) {
			$query = mysqli_query($LINK, "INSERT INTO hashes (id, peer) VALUES ('".$hash."', '".$peer_id."')");
		}
	}
		
	mysqli_close($LINK);
 ?>
