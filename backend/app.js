require('dotenv').config();
const ytdl = require('ytdl-core');
const path = require('path');
const express = require('express');
const app = express();
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
const contentDisposition = require('content-disposition');

if (process.env.NODE_ENV === 'dev') {
  ffmpeg.setFfmpegPath(ffmpegPath);
}

app.use(express.urlencoded({ extended: true }));

app.set('port', process.env.PORT || 4000);

// create a server object:
app.use(express.static(path.join(__dirname, '..', 'frontend', 'build')));
app.use(express.static(path.join(__dirname, '..', 'frontend', 'public')));
app.get('/healthz', (req, res) => res.sendStatus(200));

app.get('/style.css', (req, res, next) => {
  res.sendFile(path.join(__dirname, 'style.css'));
});

app.post('/', async (req, res, next) => {
  const { url } = req.body;
  if (ytdl.validateURL(url)) {
    try {
      const info = await ytdl.getBasicInfo(ytdl.getVideoID(url));
      res.status(200).send('OK');
    } catch (err) {
      res.statusMessage = err.message;
      res.status(500).send(err);
    }
  } else {
    res.statusMessage = 'Invalid URL';
    res.status(400).send('Invalid URL');
  }
});

app.post('/file-download', async (req, res, next) => {
  const { url } = req.body;
  if (ytdl.validateURL(url)) {
    try {
      const info = await ytdl.getBasicInfo(ytdl.getVideoID(url));
      const filename = info.videoDetails.media.artist
        ? `${info.videoDetails.media.artist.replace(
            /,/g,
            '',
          )} - ${info.videoDetails.media.song.replace(/[,\/]/g, '')}.mp3`
        : info.videoDetails.title
        ? `${info.videoDetails.title.replace(/[,\/]/g, '')}.mp3`
        : 'youtube download';
      const file = await ytdl(url, {
        filter: (format) => {
          return (
            format.hasAudio &&
            !format.hasVideo &&
            format.audioQuality === 'AUDIO_QUALITY_MEDIUM'
          );
        },
      });
      console.log('filename', filename);
      console.log('filename cd', contentDisposition(filename));
      res.set({
        'Content-Disposition': contentDisposition(filename),
        'Content-Type': 'audio/mp3',
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
      res.statusMessage = err.message;
      res.status(500).send(err);
    }
  } else {
    res.statusMessage = 'Invalid URL';
    res.status(400).send('Invalid URL');
  }
});

app.listen(app.get('port'), () => {
  console.log('Server running on port ' + app.get('port'));
});
