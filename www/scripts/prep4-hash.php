<?php
echo("--- Start ------------------- \n\n");

chdir('../video/');

// Определяем путь к .mpd-файлу:
//$mpd_path = "manifest-toystory-comby.mpd";

//$mpd_path = "test-manifest-toystory.mpd";
//$mpd_path = "test-manifest-toystory-dual.mpd";

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
$SegmentTemplate = $xml->Period->AdaptationSet[0]->SegmentTemplate;
$SegmentTemplate_attr = $SegmentTemplate->attributes();
$Representation = $xml->Period->AdaptationSet[0]->Representation;
$Representation_attr = $Representation->attributes();

$data['t'] = (string)$Representation_attr['mimeType'];
$data['m'] = (string)$SegmentTemplate_attr['media'];
$data['i'] = (string)$SegmentTemplate_attr['initialization'];

$data['vrid'] = (string)$Representation_attr['id'];
$data['cv'] = (string)$Representation_attr['codecs'];
$data['snv'] = (int)$SegmentTemplate_attr['startNumber'];
$timescale_video = (string)$SegmentTemplate_attr['timescale']/1000;

// хеш init
$path_segment = str_replace("\$RepresentationID\$", $data['vrid'], $data['i']);
$data['ihv'] = hash_segment($path_segment);
echo ("hash Video init1: ".$data['ihv']."\n");

$data['sv'] = array();
$timeline = $xml->Period->AdaptationSet[0]->SegmentTemplate->SegmentTimeline->S;
foreach($timeline as $timeline_item) {
	$timeline_item_attr = $timeline_item->attributes();
	$duration = (int)($timeline_item_attr['d']/$timescale_video);
	$repeat = $timeline_item_attr['r'];
	array_push($data['sv'], array(
		'd' => $duration,
		'h' => null
	));
	
	if ($repeat)
	{
		for ($j = 0; $j < $repeat; $j++) {
			array_push($data['sv'], array(
				'd' => $duration,
				'h' => null
			));
		}
	}
}

// хеш сегментов
echo ("hash Video "."\n");
for ($i = 0; $i < count($data['sv']); $i++) {
	$path_segment = str_replace("\$Number\$", $i+$data['snv'], $data['m']);
	$path_segment = str_replace("\$RepresentationID\$", $data['vrid'], $path_segment);
	$data['sv'][$i]['h'] = hash_segment($path_segment);
	//echo ("hash i = ". $i." ". $data['sv'][$i]['h'] ."\n");
}

// Логика для аудио-дорожек
if ($xml->Period->AdaptationSet[1])
{
	$SegmentAudioTemplate = $xml->Period->AdaptationSet[1]->SegmentTemplate;
	$SegmentAudioTemplate_attr = $SegmentAudioTemplate->attributes();
	$RepresentationAudio = $xml->Period->AdaptationSet[1]->Representation;
	$RepresentationAudio_attr = $RepresentationAudio->attributes();
	
	$data['arid'] = (string)$RepresentationAudio_attr['id'];
	$data['ca'] = (string)$RepresentationAudio_attr['codecs'];
	$data['sna'] = (int)$SegmentAudioTemplate_attr['startNumber'];
	$timescale_audio = (string)$SegmentAudioTemplate_attr['timescale']/1000;
	
	// хеш init
	$path_segment = str_replace("\$RepresentationID\$", $data['arid'], $data['i']);
	$data['iha'] = hash_segment($path_segment);
	echo ("hash Video init: ".$data['iha']."\n");
	
	$data['sa'] = array();
	$timelineAudio = $xml->Period->AdaptationSet[1]->SegmentTemplate->SegmentTimeline->S;
	foreach($timelineAudio as $timeline_item) {
		$timeline_item_attr = $timeline_item->attributes();
		$duration = (int)($timeline_item_attr['d']/$timescale_audio);
		$repeat = $timeline_item_attr['r'];
		array_push($data['sa'], array(
			'd' => $duration,
			'h' => null
		));
		
		if ($repeat)
		{
			for ($j = 0; $j < $repeat; $j++) {
				array_push($data['sa'], array(
					'd' => $duration,
					'h' => null
				));
			}
		}
	}
	
	// хеш сегментов
	echo ("hash Audio "."\n");
	for ($i = 0; $i < count($data['sa']); $i++) {
		$path_segment = str_replace("\$Number\$", $i+$data['sna'], $data['m']);
		$path_segment = str_replace("\$RepresentationID\$", $data['arid'], $path_segment);
		$data['sa'][$i]['h'] = hash_segment($path_segment);
		//echo ("hash i = ". $i." ". $data['sa'][$i]['h'] ."\n");
	}
	
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


