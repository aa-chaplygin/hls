<?php

echo("--- Start ------------------- \n\n");

chdir('../video/');

// Определяем путь к .mpd-файлу:
$mpd_path = "manifest-toystory.mpd";

// Распарсиваем XML:
$data = array();
$xml = simplexml_load_file($mpd_path);

$SegmentTemplate = $xml->Period->AdaptationSet[0]->SegmentTemplate;
$SegmentTemplate_attr = $SegmentTemplate->attributes();
$Representation = $xml->Period->AdaptationSet[0]->Representation;
$Representation_attr = $Representation->attributes();

$data['vrid'] = (string)$Representation_attr['id'];
$data['t'] = (string)$Representation_attr['mimeType'];
$data['cv'] = (string)$Representation_attr['codecs'];
$data['m'] = (string)$SegmentTemplate_attr['media'];
$data['i'] = (string)$SegmentTemplate_attr['initialization'];

$data['sv'] = array();
$timeline = $xml->Period->AdaptationSet[0]->SegmentTemplate->SegmentTimeline->S;
foreach($timeline as $timeline_item) {
	$timeline_item_attr = $timeline_item->attributes();
	$duration = (int)$timeline_item_attr['d'];
	$repeat = $timeline_item_attr['r'];
	
	array_push($data['sv'], $duration);
	if ($repeat)
	{
		for ($j = 0; $j < $repeat; $j++) {
			array_push($data['sv'], $duration);
		}
	}
}


$SegmentAudioTemplate = $xml->Period->AdaptationSet[1]->SegmentTemplate;
$SegmentAudioTemplate_attr = $SegmentAudioTemplate->attributes();
$RepresentationAudio = $xml->Period->AdaptationSet[1]->Representation;
$RepresentationAudio_attr = $RepresentationAudio->attributes();
$data['arid'] = (string)$RepresentationAudio_attr['id'];
$data['ca'] = (string)$RepresentationAudio_attr['codecs'];

$data['sa'] = array();
$timelineAudio = $xml->Period->AdaptationSet[1]->SegmentTemplate->SegmentTimeline->S;
foreach($timelineAudio as $timeline_item) {
	$timeline_item_attr = $timeline_item->attributes();
	$duration = (int)$timeline_item_attr['d'];
	$repeat = $timeline_item_attr['r'];
	
	array_push($data['sa'], $duration);
	if ($repeat)
	{
		for ($j = 0; $j < $repeat; $j++) {
			array_push($data['sa'], $duration);
		}
	}
}



//var_dump($data);
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


