const fs = require('fs');
const ytdl = require('ytdl-core');
const path = require('path');
const express = require('express');
const app = express();
const ffmpeg = require('fluent-ffmpeg')

ffmpeg.setFfmpegPath(path.join(__dirname, '/src'))

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
				const writeStream = fs.createWriteStream('audio.mp3')
				res.set({
					'Content-disposition': `attachment;filename=${info.videoDetails.media.artist} - ${info.videoDetails.media.song}.mp3`,
					'Content-type': 'audio/mp3',
				});
				const command = ffmpeg(file)
				command.pipe(res)
				res.end()
				// file.pipe(writeStream)
				// writeStream.on('finish', () => {
				// 	const command = ffmpeg({
				// 		source: writeStream
				// 	})
				// 		.on('end', () => {
				// 			console.log('finished')
				// 			command.pipe(writeStream)
				// 		})
				// 		.on('error', (err) => {
				// 			console.error(err)
				// 		})
				// })
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
