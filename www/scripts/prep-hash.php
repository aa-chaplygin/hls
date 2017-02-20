<?php

// Подключаем библиотеку для определения метаданных видео:
include_once('getid3/getid3.php');
$getID3 = new getID3;

function parse_data($n, $mp4fragmented_path, $fn)
{
	global $data, $xml;
	
	$Representation = $xml->Period->AdaptationSet[$n]->Representation;
	$Representation_attr = $Representation->attributes();

	if ($n == 0)
	{
		$data['t'] = (string)$Representation_attr['mimeType'];
	}
	$data[$fn['u']] = (string)$Representation->BaseURL;
	$data[$fn['c']] = (string)$Representation_attr['codecs'];

	$initialization = $xml->Period->AdaptationSet[$n]->Representation->SegmentList->Initialization;
	$initialization_attr = $initialization->attributes();
	$data[$fn['ir']] = (string)$initialization_attr['range'];

	$data[$fn['s']] = array();
	$segments = $xml->Period->AdaptationSet[$n]->Representation->SegmentList->SegmentURL;
	foreach($segments as $segment_item) {
		$segment_item_attr = $segment_item->attributes();
		array_push($data[$fn['s']], array(
			'r' => (string)$segment_item_attr['mediaRange'],
			'd' => null,
			'h' => null
		));
	}

	$i = 0;
	$timeline = $xml->Period->AdaptationSet[$n]->SegmentList->SegmentTimeline->S;
	foreach($timeline as $timeline_item) {
		$timeline_item_attr = $timeline_item->attributes();
		$duration = (int)$timeline_item_attr['d'];
		$repeat = $timeline_item_attr['r'];
		$data[$fn['s']][$i]['d'] = $duration;
		$i++;
		if ($repeat)
		{
			for ($j = 0; $j < $repeat; $j++) {
				$data[$fn['s']][$i]['d'] = $duration;
				$i++;
			}
		}
	}
	
	// хеш сегментов
	$handle = fopen($mp4fragmented_path, "rb");
	$data[$fn['ih']] = hash_segment($handle, $data[$fn['ir']]);
	echo ("hash Video ".$data[$fn['ih']]."\n");
	for ($i = 0; $i < count($data[$fn['s']]); $i++) {
		$data[$fn['s']][$i]['h'] = hash_segment($handle, $data[$fn['s']][$i]['r']);
		echo ("hash: " . $data[$fn['s']][$i]['h'] . "  \n");
	}
	fclose($handle);
}

function hash_segment($h, $r)
{
	$bytes_count = 30000;
		
	$range = explode('-', $r);
	fseek($h, $range[0]);
	$s = fread($h, $range[1]-$range[0]+1);
	
	if (strlen($s)<$bytes_count)
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
	return $hash;
}

echo("--- Start ------------------- \n\n");

chdir('../video/');

// Типа разбивки
$is_dual = true; // true - разбивка на дорожки

$file_path = isset($argv[1]) ? $argv[1] : 'toystory.mp4';
$segment_size = isset($argv[2]) ? $argv[2] : 3;

$file = $getID3->analyze($file_path);
$bitrate = $file['bitrate'];
//$duration = $file['playtime_seconds'];
//$filesize = $file['filesize'];

// Определяем длительность сегмента:
$dash = floor($segment_size*1000000*8/$bitrate)*1000;

echo("APP file = ".$file_path."\n");
echo("Bitrate: ".$bitrate." \n");
echo("Dash: ".$dash." \n");

// Запускаем процесс фрагментирования:
if ($is_dual)
{
	// Определяем путь к .mpd-файлу:
	$mpd_path = str_replace(".mp4", "", $file_path) . "_dash-dual.mpd";
	exec("MP4Box -dash ". $dash ." -frag-rap -segment-timeline ". " -out ". $mpd_path ." ". $file_path."#video ". $file_path."#audio");
}
else
{
	// Определяем путь к .mpd-файлу:
	$mpd_path = str_replace(".mp4", "", $file_path) . "_dash.mpd";
	exec("MP4Box -dash ". $dash ." -frag-rap -segment-timeline ". " -out ". $mpd_path ." ". $file_path);
}

// Исправляем ошибку в .mpd (не закрыт открывающий тег)
$str = implode('',file($mpd_path));
if (strpos($str, "\"\n"))
{
	$str_corrected = str_replace("\"\n", "\">\n", $str);
	$mpd_file = fopen($mpd_path, 'w');
	if ($mpd_file)
	{
		$test = fwrite($mpd_file, $str_corrected);
		if ($test) echo "- Данные в файле .mpd исправлены. \n";
		else echo "- Ошибка при мсправлении .mpd файла. \n";
		fclose($mpd_file); //Закрытие файла
	}
	else
	{
		echo "- Ошибка при открытии .mpd файла \n";
	}
}
	
// Распарсиваем XML:
$data = array();
$xml = simplexml_load_file($mpd_path);

// Определяем путь к отфрагментированному .mp4-файлу:
if ($is_dual)
{
	$mp4fragmented_path_video = str_replace("dash-dual.mpd", "", $mpd_path) . "track1_dashinit.mp4";
	$mp4fragmented_path_audio = str_replace("dash-dual.mpd", "", $mpd_path) . "track2_dashinit.mp4";
}
else
{
	$mp4fragmented_path_video = str_replace("dash.mpd", "", $mpd_path) . "dashinit.mp4";
}

// Логика для видео-дорожек
parse_data(0, $mp4fragmented_path_video, array(
	'u' => 'uv',
	'c' => 'cv',
	'ir' => 'irv',
	'ih' => 'ihv',
	's' => 'sv',
));

// Логика для аудио-дорожек
if ($is_dual)
{
	parse_data(1, $mp4fragmented_path_audio, array(
		'u' => 'ua',
		'c' => 'ca',
		'ir' => 'ira',
		'ih' => 'iha',
		's' => 'sa',
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


