import fs from "fs";
import 'dotenv/config';
import cors from 'cors';
import multer from 'multer';
import OpenAI from "openai";
import express from 'express';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { saveData, getDatabyID, getAllData, info } from './griddbservices.js';

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

			// eslint-disable-next-line no-unused-vars
			const speechData = {
				filename: filePath,
				text: transcription.text,
				category: "voice note"
			}

			/**
			 * Data fieldss
			 * filename:
			 * text:
			 * category:
			 */

			// Process data to GridDB database
			// Save the transcription data to GridDB
			const saveStatus = await saveData(speechData);

			res.json({
				message: 'Successfully uploaded file and saved data',
				transcription: transcription.text,
				saveStatus: saveStatus
			});
		} catch (error) {
			console.error('Error during transcription:', error);
			res.status(500).json({ message: 'Error during transcription', error: error.message });
		}
	} else {
		res.status(400).json({ message: 'No file uploaded' });
	}
});

// Route to save data
app.post('/save-data', async (req, res) => {
	try {
		const { filename, text, category } = req.body;
		const saveStatus = await saveData({ filename, text, category });
		res.json({ message: 'Data saved successfully', saveStatus });
	} catch (error) {
		console.error('Error saving data:', error);
		res.status(500).json({ message: 'Failed to save data', error: error.message });
	}
});

// Route to get data by ID
app.get('/data/:id', async (req, res) => {
	try {
		const id = req.params.id;  // Extracting id from the URL parameter
		const data = await getDatabyID(id);
		if (data) {
			res.json({ message: 'Data retrieved successfully', data });
		} else {
			res.status(404).json({ message: 'Data not found' });
		}
	} catch (error) {
		console.error('Error retrieving data:', error);
		res.status(500).json({ message: 'Failed to retrieve data', error: error.message });
	}
});

// Route to get all data
app.get('/all-data', async (req, res) => {
	try {
		const data = await getAllData();
		res.json({ message: 'Data retrieved successfully', data });
	} catch (error) {
		console.error('Error retrieving all data:', error);
		res.status(500).json({ message: 'Failed to retrieve data', error: error.message });
	}
});

// Route to get container information
app.get('/info', async (req, res) => {
	try {
		const containersInfo = await info();
		res.json({ message: 'Container info retrieved successfully', containersInfo });
	} catch (error) {
		console.error('Error retrieving container info:', error);
		res.status(500).json({ message: 'Failed to retrieve container info', error: error.message });
	}
});

app.listen(port, () => {
	console.log(`Server listening at http://localhost:${port}`);
});
