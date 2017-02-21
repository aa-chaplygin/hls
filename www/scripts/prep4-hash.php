<?php
echo("--- Start ------------------- \n\n");

chdir('../video/');

// Определяем путь к .mpd-файлу:
//$mpd_path = "manifest-toystory-comby.mpd";

//$mpd_path = "test-manifest-toystory.mpd";
$mpd_path = "test-manifest-toystory-dual.mpd";

function parse_data($n, $fn)
{
	global $data, $xml;
	
	$SegmentTemplate = $xml->Period->AdaptationSet[$n]->SegmentTemplate;
	$SegmentTemplate_attr = $SegmentTemplate->attributes();
	$Representation = $xml->Period->AdaptationSet[$n]->Representation;
	$Representation_attr = $Representation->attributes();
	
	if ($n == 0)
	{
		$data['t'] = (string)$Representation_attr['mimeType'];
		$data['m'] = (string)$SegmentTemplate_attr['media'];
		$data['i'] = (string)$SegmentTemplate_attr['initialization'];
	}
	
	$data[$fn['rid']] = (string)$Representation_attr['id'];
	$data[$fn['c']] = (string)$Representation_attr['codecs'];
	$data[$fn['sn']] = (int)$SegmentTemplate_attr['startNumber'];
	$timescale = (string)$SegmentTemplate_attr['timescale']/1000;

	$data[$fn['s']] = array();
	$timeline = $xml->Period->AdaptationSet[$n]->SegmentTemplate->SegmentTimeline->S;
	foreach($timeline as $timeline_item) {
		$timeline_item_attr = $timeline_item->attributes();
		$duration = (int)($timeline_item_attr['d']/$timescale);
		$repeat = $timeline_item_attr['r'];
		array_push($data[$fn['s']], array(
			'd' => $duration,
			'h' => null
		));

		if ($repeat)
		{
			for ($j = 0; $j < $repeat; $j++) {
				array_push($data[$fn['s']], array(
					'd' => $duration,
					'h' => null
				));
			}
		}
	}

	// хеш init
	$path_segment = str_replace("\$RepresentationID\$", $data[$fn['rid']], $data['i']);
	$data[$fn['ih']] = hash_segment($path_segment);
	echo ("hash Video init1: ".$data[$fn['ih']]."\n");

	// хеш сегментов
	echo ("hash Video "."\n");
	for ($i = 0; $i < count($data[$fn['s']]); $i++) {
		$path_segment = str_replace("\$Number\$", $i+$data[$fn['sn']], $data['m']);
		$path_segment = str_replace("\$RepresentationID\$", $data[$fn['rid']], $path_segment);
		$data[$fn['s']][$i]['h'] = hash_segment($path_segment);
		//echo ("hash i = ". $i." ". $data[$fn['s']][$i]['h'] ."\n");
	}
	
}

// Хеширование удаленного файла
function hash_segment($path)
{
	$bytes_count = 30000;
	
	$handle = fopen($path, "rb");
	$headers = get_headers($path, 1);
	$size = $headers["Content-Length"];
	
	if ($size<$bytes_count)
	{
		$s = fread($handle, $size);
		$data_s = $s;
	}
	else
	{
		$data_s = '';
		$contents = stream_get_contents($handle);
		$step = floor(strlen($contents)/$bytes_count);
		$j = 0;
		while ($j < strlen($contents)):
			$data_s .= $contents[$j];
			$j+=$step;
		endwhile;
	}

	$hash = md5($data_s);
	echo ("hash: ". $path . " ". $size . " " . $hash . "\n");
	fclose($handle);
	return $hash;
}

// Хеширование локального файла
function hash_segment_local($path)
{
	$bytes_count = 30000;
	
	$h = fopen($path, "rb");
	fseek($h, 0);
	$size = filesize($path);
	$s = fread($h, $size);
	
	if ($size<$bytes_count)
	{
		$data_s = $s;
	}
	else
	{
		$data_s = '';
		$step = floor(strlen($s)/$bytes_count);
		$j = 0;
		while ($j < strlen($s)):
			$data_s .= $s[$j];
			$j+=$step;
		endwhile;
	}
	
	$hash = md5($data_s);
	fclose($h);
	return $hash;
}

// Распарсиваем XML:
$data = array();
$xml = simplexml_load_file($mpd_path);

// Логика для видео-дорожек
parse_data(0, array(
	'rid' => 'vrid',
	'c' => 'cv',
	'sn' => 'snv',
	's' => 'sv',
	'ih' => 'ihv',
));

// Логика для аудио-дорожек
if ($xml->Period->AdaptationSet[1])
{
	parse_data(1, array(
		'rid' => 'arid',
		'c' => 'ca',
		'sn' => 'sna',
		's' => 'sa',
		'ih' => 'iha',
	));
}

//echo ("DATA: ". json_encode($data) ."\n");

// Записываем файл с JSON-данными:
$data_file_path = str_replace(".mpd", ".dat", $mpd_path);
$data_file = fopen($data_file_path, 'w');
if ($data_file)
{
	$test = fwrite($data_file, json_encode($data));
	if ($test) echo "- JSON Данные в файл успешно занесены. \n";
	else echo "- JSON Ошибка при записи в файл. \n";
	fclose($data_file); //Закрытие файла
}
else
{
	echo "- Ошибка при открытии .dat файла \n";
}

// Удаляем .mpd файл
//unlink($mpd_path);

echo("--- Finish ------------------- \n\n");
?>


