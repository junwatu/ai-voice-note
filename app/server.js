import fs from "fs";
import 'dotenv/config';
import cors from 'cors';
import multer from 'multer';
import OpenAI from "openai";
import express from 'express';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { saveData, getAllData, getDatabyID, info } from './griddbservices.js';

const app = express();
const port = 3000;
const __dirname = dirname(fileURLToPath(import.meta.url));

const openai = new OpenAI({
	// eslint-disable-next-line no-undef
	apiKey: process.env.OPENAI_API_KEY
});

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, 'uploads/');
	},
	filename: function (req, file, cb) {
		cb(null, file.fieldname + '-' + Date.now() + '.webm');
	}
});

const upload = multer({ storage: storage });

app.use(express.static(join(__dirname, 'www')));
app.use(cors());

app.post('/upload', upload.single('file'), async (req, res) => {
	if (req.file) {
		// The path to the uploaded audio file
		const filePath = join(__dirname, 'uploads', req.file.filename);

		try {
			// Perform speech-to-text on the uploaded file
			const transcription = await openai.audio.transcriptions.create({
				file: fs.createReadStream(filePath),
				model: "whisper-1",
			});

			console.log(transcription.text);

			// Send back the transcription as part of the response
			res.json({ message: 'Successfully uploaded file', transcription: transcription.text });
		} catch (error) {
			console.error('Error during transcription:', error);
			res.status(500).json({ message: 'Error during transcription', error: error.message });
		}
	} else {
		res.status(400).json({ message: 'No file uploaded' });
	}
});

/**
app.post('/upload', upload.single('file'), (req, res) => {
	res.json({ message: 'Successfully uploaded file' });
});
*/

app.listen(port, () => {
	console.log(`Server listening at http://localhost:${port}`);
});
