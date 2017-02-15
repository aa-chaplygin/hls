// Get MPD data from Bento4
var segmentsVideo;
var segmentsAudio;

file = '/video/' + data.querySelectorAll("Initialization")[0].getAttribute("sourceURL");

type = data.querySelectorAll("AdaptationSet")[0].getAttribute("mimeType");
var rep = data.querySelectorAll("Representation");
codecs = rep[0].getAttribute("codecs") + ',' + rep[1].getAttribute("codecs");
bandwidth = rep[0].getAttribute("bandwidth");

var ini = data.querySelectorAll("Initialization");
initialization = ini[0].getAttribute("range");

segmentsVideo = rep[0].querySelectorAll("SegmentURL");
segmentsAudio = rep[1].querySelectorAll("SegmentURL");

segments = [];
for (var i = 0; i < segmentsVideo.length; i++) {
	var elemSegment = data.createElement('SegmentURL');
	elemSegment.setAttribute("mediaRange", segmentsVideo[i].getAttribute("mediaRange").toString().split("-")[0] + '-' + segmentsAudio[i].getAttribute("mediaRange").toString().split("-")[1]);
	segments.push(elemSegment);
}

var segList = data.querySelectorAll("SegmentList");
segDuration = segList[0].getAttribute("duration")*1000/segList[0].getAttribute("timescale");


// Пропорциональное определение продолжительности сегментов
segments.forEach(function(itemSegment) {
	var itemDuration;
	itemDuration = timeToDownload(itemSegment.getAttribute("mediaRange").toString());
	durations.push(itemDuration);
});


// Расчет index по пропорциональной шкале:
// Определяем номер сегмента для загрузки:
index = Math.floor(videoElement.currentTime/ (segDuration/1000));
console.log('AAA seeking ', videoElement.currentTime, ' ', videoElement.duration, ' ', segDuration, ' ', index);
//if (index == 0)
if (!true)
{
	lastTime = index*segDuration/1000;
	playSegment(segments[index].getAttribute("mediaRange").toString(), file, index);
}
else
{
	// Загрузим дополнительно и предыдущий сегмент:
	var 
		from = segments[index-1].getAttribute("mediaRange").toString().split("-")[0],
		to = segments[index].getAttribute("mediaRange").toString().split("-")[1],
		segRanges = from + '-' + to;

	lastTime = (index-1)*segDuration/1000;
	playSegment(segRanges, file, index);
}



// Определение параметров:
segCheck = (timeToDownload(range) * .50).toFixed(3);
lastTime = videoElement.currentTime;

function timeToDownload(range) {
	var vidDur = range.split("-");
	// Time = size * 8bit / bitrate
	return (((vidDur[1] - vidDur[0]) * 8) / bandwidth);
}


// тестовый запрос на indexRange
var xhr1 = new XMLHttpRequest();
	xhr1.open('GET', file);
	xhr1.setRequestHeader("Range", "bytes=11749551-11749594");
	xhr1.responseType = 'arraybuffer';
	xhr1.send();

	xhr1.addEventListener("readystatechange", function () {
		if (xhr1.readyState == xhr1.DONE) { //wait for video to load
			console.log('AAA xhr1 ', xhr1.response);
		}
	});




downloadedSize(range, ind);

function downloadedSize(range, ind) {
	if (downloadedIndexes.indexOf(ind)<0)
	{
		downloadedIndexes.push(ind);
		var vidDur = range.split("-");
		downloadedBytes += vidDur[1] - vidDur[0];
		console.log('AAA downloadedBytes = ', downloadedBytes/1000000);
	}
}


