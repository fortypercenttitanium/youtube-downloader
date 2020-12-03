require('dotenv').config();
const fs = require('fs');
const ytdl = require('ytdl-core');
const path = require('path');
const express = require('express');
const app = express();
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');

if (process.env.NODE_ENV === 'dev') {
	ffmpeg.setFfmpegPath(ffmpegPath);
}

app.use(express.urlencoded({ extended: true }));

app.set('port', process.env.PORT || 3000);

// create a server object:
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
			const filename = info.videoDetails.media.artist
				? `${info.videoDetails.media.artist.replace(
						/,/g,
						''
				  )} - ${info.videoDetails.media.song.replace(/,/g, '')}.mp3`
				: `${info.videoDetails.title.replace(/,/g, '')}.mp3`;
			console.log(filename);
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
				'Content-disposition': `attachment;filename=${filename}`,
				'Content-type': 'audio/mp3',
			});
			const command = ffmpeg(file)
				.format('mp3')
				.audioCodec('libmp3lame')
				.withNoVideo()
				.on('error', (err) => {
					console.error(err);
					res.end('ended with an error');
				});
			command.pipe(res, { end: true });
		} catch (err) {
			console.error(err);
		}
	} else {
		console.error('Invalid URL');
	}
});

app.listen(app.get('port'), () => {
	console.log('Server running on port ' + app.get('port'));
});
