const fs = require('fs');
const ytdl = require('ytdl-core');
const path = require('path');
const express = require('express');
const app = express();

app.use(express.urlencoded({ extended: true }));

//create a server object:
app.get('/', (req, res, next) => {
	res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/style.css', (req, res, next) => {
	res.sendFile(path.join(__dirname, 'style.css'));
});

app.post('/', async (req, res, next) => {
	const { url } = req.body;
	if (ytdl.validateURL(url)) {
		try {
			const info = await ytdl.getBasicInfo(ytdl.getVideoID(url));

			const file = await ytdl(url, {
				filter: (format) => {
					return (
						format.hasAudio &&
						!format.hasVideo &&
						format.audioQuality === 'AUDIO_QUALITY_MEDIUM'
					);
				},
			});
			res.set({
				'Content-disposition': `attachment;filename=${info.videoDetails.media.artist} - ${info.videoDetails.media.song}.mp4`,
				'Content-type': 'audio/mp4',
			});
			file.pipe(res);
		} catch (err) {
			console.error(err);
		}
	} else {
		console.error('Invalid URL');
	}
});

app.listen(8080, () => {
	console.log('Server running on port 8080');
});
