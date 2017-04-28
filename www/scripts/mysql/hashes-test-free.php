<?php

	header("Access-Control-Allow-Origin: *");
	
	/*
	if ($_GET['remote'] == 'remote')
	{
		$hashes = array(
			'234243',
			'565656',
			'686768',
		);
	}
	else
	{
		$hashes = array(
			'8c87a6c6ef513cc2122305d034874168',
			'b5dd2411c0842c781b54a49d534ac468',
			'd05a64b557279f54a7c2ed602352cec8'
		);
	}
	*/
	
	$hashes = array();
	echo json_encode($hashes);
	

 ?>
