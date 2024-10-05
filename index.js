const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());

const downloadVideo = (url, platform, res) => {
  const outputPath = path.join(__dirname, 'downloads');
  const cookiesPath = path.join(__dirname, 'cookies.txt'); // Dynamically generate the path for cookies.txt
  let command;

  if (platform === 'youtube') {
    command = `yt-dlp --cookies "${cookiesPath}" -o "${outputPath}/%(title)s.%(ext)s" "${url}"`;
  } else if (platform === 'instagram') {
    command = `instaloader --dirname-pattern "${outputPath}" --filename-pattern "{profile}_{mediaid}" -- "${url}"`;
  } else {
    return res.status(400).send({ error: 'Invalid platform' });
  }

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error downloading video: ${error.message}`);
      return res.status(500).send({ error: `Failed to download from ${platform}`, details: stderr });
    }
    res.send({ message: `${platform} content download completed!`, details: stdout });
  });
};

app.get("/", (req, res) => {
  res.json({ message: 'Welcome to the Video Downloader API!' });
});

app.post('/download/youtube', (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).send({ error: 'No URL provided' });
  }

  const platform = "youtube";
  downloadVideo(url, platform, res);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
