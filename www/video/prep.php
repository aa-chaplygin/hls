<?php

//require 'vendor/autoload.php';
//$mp4box = MP4Box\MP4Box::create();
//$mp4box->process('toystory.mp4');

//$ffmpeg = FFMpeg\FFMpeg::create();
//$movie = new ffmpeg_movie('toystory.mp4');

//include "MP4Info.php";
//$inf = MP4Info::getInfo('toystory.mp4');

// Подключаем библиотеку для определения метаданных видео:
include_once('getid3/getid3.php');
$getID3 = new getID3;


echo("--- Start ------------------- \n\n");

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
exec("MP4Box -dash ". $dash ." -frag-rap -segment-timeline ". $file_path);

// Определяем путь к .mpd-файлу:
$mpd_path = str_replace(".mp4", "", $file_path) . "_dash.mpd";

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

$Representation = $xml->Period->AdaptationSet->Representation;
$Representation_attr = $Representation->attributes();

$data['u'] = (string)$Representation->BaseURL;
$data['t'] = (string)$Representation_attr['mimeType'];
$data['c'] = (string)$Representation_attr['codecs'];

$initialization = $xml->Period->AdaptationSet->Representation->SegmentList->Initialization;
$initialization_attr = $initialization->attributes();
$data['i'] = (string)$initialization_attr['range'];

$data['s'] = array();
$segments = $xml->Period->AdaptationSet->Representation->SegmentList->SegmentURL;
foreach($segments as $segment_item) {
	$segment_item_attr = $segment_item->attributes();
	array_push($data['s'], array(
		'r' => (string)$segment_item_attr['mediaRange'],
		'd' => null
	));
}

$i = 0;
$timeline = $xml->Period->AdaptationSet->SegmentList->SegmentTimeline->S;
foreach($timeline as $timeline_item) {
	$timeline_item_attr = $timeline_item->attributes();
	$duration = (int)$timeline_item_attr['d'];
	$repeat = $timeline_item_attr['r'];
	$data['s'][$i]['d'] = $duration;
	$i++;
	if ($repeat)
	{
		for ($j = 0; $j < $repeat; $j++) {
			$data['s'][$i]['d'] = $duration;
			$i++;
		}
	}
}
echo ("DATA: ". json_encode($data) ."\n");

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


