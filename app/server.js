import express from 'express';
import multer from 'multer';
import cors from 'cors';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const app = express();
const port = 3000;
const __dirname = dirname(fileURLToPath(import.meta.url));

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

app.post('/upload', upload.single('file'), (req, res) => {
	res.json({ message: 'Successfully uploaded file' });
});

app.listen(port, () => {
	console.log(`Server listening at http://localhost:${port}`);
});
