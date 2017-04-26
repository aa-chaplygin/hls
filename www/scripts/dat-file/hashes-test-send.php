<?php

	header("Access-Control-Allow-Origin: *");
	
	$peer_id = $_POST['id'];
	$hashes = (isset($_POST['hashes'])) ? $_POST['hashes'] : null;
	
	$str = file_get_contents("users.dat");
	$users = json_decode($str, true);

	// В файл user.dat добавляем запись о пользователе:
	// Дробавляем запись об информация по каждому пиру
	$peer_id_exist = array_key_exists ($peer_id, $users);
	if (!$peer_id_exist)
	{
		$users[$peer_id] = array('age' => 25, 'country' => 'finland');
		$users_new = json_encode($users);
		$fd = fopen("users.dat", 'w') or die("не удалось открыть файл");
		fwrite($fd, $users_new);
		fclose($fd);
	}
	
	// Удаляем данные о пользователе в хешах (после освобождения хешей на клиенте):
	if ($peer_id_exist)
	{
		$str = file_get_contents("hashes.dat");
		$all_hashes = json_decode($str, true);
		foreach ($all_hashes as $hash => $peers) {
			if (in_array($peer_id, $peers)) {
				unset($peers[array_search($peer_id, $peers)]);
				$all_hashes[$hash] = $peers;
			}
		}
		
		$hashes_data_new = json_encode($all_hashes);
		$fd = fopen("hashes.dat", 'w') or die("не удалось открыть файл");
		fwrite($fd, $hashes_data_new);
		fclose($fd);
	}
	
	// В файл hashes.dat добавляем запись о пользователе:
	// Дробавляем запись о хешах пользователя
	if (!is_null($hashes))
	{
		$str = file_get_contents("hashes.dat");
		$hashes_data = json_decode($str, true);
		
		foreach ($hashes as $hash) {
			if (!array_key_exists ($hash, $hashes_data))
			{
				$hashes_data[$hash] = array();
			}
			array_push($hashes_data[$hash], $peer_id);
		}
		
		$hashes_data_new = json_encode($hashes_data);
		$fd = fopen("hashes.dat", 'w') or die("не удалось открыть файл");
		fwrite($fd, $hashes_data_new);
		fclose($fd);
		
	}
	
	
 ?>
